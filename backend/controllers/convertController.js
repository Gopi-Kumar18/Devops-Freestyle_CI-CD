// controller/convertController.js
import CloudConvert from 'cloudconvert';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileTypeFromFile } from 'file-type';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import FileToken from '../models/FileToken.js';
import dotenv from 'dotenv'

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const convertFile = async (req, res) => {
  let outputFilePath = null; 
  try {
    // 1. Input Validation
    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 2. File Validation
    const inputFilePath = req.file.path;

    // console.log('file after frontend sanitization', req.file);

    const fileInfo = await fileTypeFromFile(inputFilePath);

    const allowedMimes = [ 'application/pdf',
      'application/msword', // .doc
      'application/x-cfb', // Compound File Binary (some .doc files)
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm (this extension may cause security concerns...)
      
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      
      'image/png',
      'image/jpeg',
      
      'application/zip', // .docx/.xlsx are technically ZIP archives
      'application/octet-stream' // Generic binary fallback
    ]; 

    if (!fileInfo || !allowedMimes.includes(fileInfo.mime)) {
      console.log('Rejected file. Detected MIME:', fileInfo?.mime);
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // 3. Sanitize inputs
    const outputFormat = req.body.outputFormat.replace(/[^a-z]/gi, '');
    const conversionType = req.body.conversionType.replace(/[^a-zA-Z0-9-_]/g, '');
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').substring(0, 100);

    // console.log('File name after backend sanitization', originalName);

    // 4. Initialize CloudConvert
    const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK2);

    // 5. Create conversion job
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-upload': { operation: 'import/upload' },
        'convert-file': {
          operation: 'convert',
          input: ['import-upload'],
          output_format: outputFormat,
          engine: 'libreoffice'
        },
        'export-url': { operation: 'export/url', input: ['convert-file'] }
      }
    });

    // 6. File upload to CloudConvert
    const uploadTask = job.tasks.find(t => t.name === 'import-upload');
    await cloudConvert.tasks.upload(uploadTask, fs.createReadStream(inputFilePath), originalName);

    // 7. Wait for conversion
    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
    const downloadUrl = exportTask.result.files[0].url;

    // 8. Prepare secure storage
    const downloadsDir = path.join(process.cwd(),'downloads',conversionType.slice(0, 50));  //remind this will cause future issues..
    
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });        //read-write-execute  by owners & read-execute by others..
    }

    // 9. Appending an hexadecimal string to the file name..
    const outputFileName = `${originalName}_${crypto.randomBytes(4).toString('hex')}.${outputFormat}`;
     outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join('downloads', conversionType, outputFileName);

    // 10. Download converted file with timeout
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000 // 30 sec...
    });

    // 11. Secure write stream
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 });    //readable-writable only by owner..no permsisions to other  
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish',() => {
         resolve();
    });
    writer.on('error',(e) => {
      console.error("Error writing file");
     reject(e);
  });
});

    // 12. Generating safe JWT token with IP binding

    const encodedFilePath = Buffer.from(relativeFilePath).toString('base64url');
    
    const token = jwt.sign({file: encodedFilePath,ip: req.ip},process.env.JWT_SECRET,{ algorithm: 'HS256',expiresIn: '15m'});

    // console.log('Generated token convertController :- ',token,"\n");   //used for debug..

    // 13. Store token in database
    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    
    // 14. Cleanup original file
    try {
      await unlinkAsync(inputFilePath);
      console.log(`[${new Date().toISOString()}] File removed from : ${inputFilePath}\n\n`);
    } catch (err) {
      console.error('File removal error:', err);
    }

    // 15. sending json response..
    res.json({
      success: true,
      token,
      outputFormat,
      fileName: outputFileName
    });

  } catch (error) {
    console.error('Conversion error:', error);
    
    // 16. Secure error handling
    res.status(500).json({
      error: 'Conversion failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null  //change -3
    });
  }
};

