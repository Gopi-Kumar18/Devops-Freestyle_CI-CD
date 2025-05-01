
import CloudConvert from 'cloudconvert';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileTypeFromFile } from 'file-type';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import FileToken from '../models/FileToken.js';
import dotenv from 'dotenv';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const mergePdfs = async (req, res) => {
  try {
    // 1. Input Validation: Ensure files are provided
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for merge' });
    }
    
    const outputFormat = 'pdf';
    const conversionType = 'merged-docs';

    // 2. File Validation: Validate each file's MIME type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg'
    ];
    
    for (const file of files) {
      const fileInfo = await fileTypeFromFile(file.path);
      console.log('Detected MIME type for', file.originalname, ':', fileInfo?.mime); 
      if (!fileInfo || !allowedMimes.includes(fileInfo.mime)) {
        // Cleanup invalid file thereafter
        await unlinkAsync(file.path);
        return res.status(400).json({ error: `Invalid file type: ${file.originalname}` });
      }
    }

    // 3. Initialize CloudConvert
    const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK2);

    // 4. Create dynamic import and conversion tasks
    const importTasks = {};
    const convertTasks = {};
    
    files.forEach((file, index) => {
      // Sanitize the original file name (allow alphanumeric, dashes, underscores, dots)
      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').substring(0, 100);
      
      importTasks[`import-upload-${index}`] = {
        operation: 'import/upload'
      };

      convertTasks[`convert-to-pdf-${index}`] = {
        operation: 'convert',
        input: [`import-upload-${index}`],
        output_format: 'pdf'
      };

      // Overwrite file property to use sanitized name during upload
      file.sanitizedOriginalName = sanitizedOriginalName;
    });

    // 5. Create the merge job with all tasks
    const job = await cloudConvert.jobs.create({
      tasks: {
        ...importTasks,
        ...convertTasks,
        'merge-pdfs': {
          operation: 'merge',
          input: Object.keys(convertTasks), // Merge all converted PDFs
          output_format: outputFormat,
        },
        'export-url': {
          operation: 'export/url',
          input: ['merge-pdfs']
        }
      }
    });

    // 6. Upload files to CloudConvert
    await Promise.all(files.map(async (file, index) => {
      const uploadTask = job.tasks.find(t => t.name === `import-upload-${index}`);
      await cloudConvert.tasks.upload(
        uploadTask,
        fs.createReadStream(file.path),
        file.sanitizedOriginalName
      );
    }));

    // 7. Wait for job completion and get download URL
    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
    const downloadUrl = exportTask.result.files[0].url;

    // 8. creating secure storage directory
    const downloadsDir = path.join(process.cwd(), 'downloads', conversionType.slice(0,50)); //conversionTypes.slice(0,50)
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 }); // read-write-execute by owner, read-execute by others
    }

    // 9. Define output file name with appended hexadecimal string for uniqueness
    const outputFileName = `merged_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join('downloads', conversionType, outputFileName);

    // 10. Download the merged file with timeout and secure stream write
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000 // 30 seconds timeout
    });
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 }); // readable-writable only by owner
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

// 11. Generate secure token using base64url encoding of relativeFilePath and binding IP
    const encodedFilePath = Buffer.from(relativeFilePath).toString('base64url');
    
    const token = jwt.sign(
      { file: encodedFilePath, ip: req.ip },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '15m' }
    );

    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    // 12. Cleanup original uploaded files asynchronously
    await Promise.all(files.map(async (file) => {
      try {
        await unlinkAsync(file.path);
        console.log(`[${new Date().toISOString()}] File removed: ${file.path}`);
      } catch (err) {
        console.error(`Error removing file ${file.path}:`, err);
      }
    }));

    res.json({
      success: true,
      token,
      outputFormat,
      fileName: outputFileName
    });

  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({
      error: 'Document merge failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};





