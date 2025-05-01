
import path from 'path';
import fs from 'fs';
import { deleteLocalFile } from '../utils/cleanUp.js';
import { verifyDownloadToken } from '../utils/tokenUtils.js';
import FileToken from '../models/FileToken.js';

export const downloadConvertedFile = async (req, res) => {
  try {
    const { token } = req.query;

    // const clientIp = req.ip;

    const decoded = verifyDownloadToken(token);

    // console.log("Encoded file path :- ",decoded.file,"\n");   //debugging


    if (!decoded?.file) {
      console.log('JWT Verification Failed - Decoded:', decoded,"\n");
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    

    const fileToken = await FileToken.findOne({ token });
    // console.log("databse filepath" , fileToken.filePath);  //debuggin..

    if (!fileToken) {
        return res.status(401).json({ error: 'Token not found' });
      }

     


    if (fileToken.filePath !== decoded.file) {
      return res.status(401).json({ error: 'Invalid file path' });
    }
    

    // 2. Decode file path
    const relativeFilePath = Buffer.from(decoded.file, 'base64url').toString();
    // console.log('Decoded Path:', relativeFilePath,"\n");

    
    if (new Date() > fileToken.expiresAt) {
      return res.status(401).json({ error: 'Token expired' });
    }

    
    const absolutePath = path.join(process.cwd(), relativeFilePath);
    // console.log('Absolute Path:', absolutePath,"\n");
    
    if (!fs.existsSync(absolutePath)) {
      console.log('File not found at:', absolutePath,"\n");
      return res.status(404).json({ error: 'File not found' });
    }


    res.download(absolutePath, async (err) => {
      try {
        
        if (!err) {
          await deleteLocalFile(absolutePath); 
        }
      } catch (err) {
        console.error('Cleanup failed:', err);
      }
    });

  } catch (error) {
    console.error('Download Error:');
    res.status(500).json({ error: error.message });
  }
};



































// controller/downloadController.js
// import path from 'path';
// import fs from 'fs';
// import { deleteLocalFile } from '../utils/cleanUp.js';
// import { verifyDownloadToken } from '../utils/tokenUtils.js';
// import FileToken from '../models/FileToken.js';

// export const downloadConvertedFile = async (req, res) => {
//   try {
//     const { token } = req.query; //if u use name as token id change here...

//     // Verify JWT token
//     const decoded = verifyDownloadToken(token);
//     if (!decoded || !decoded.filePath) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }

//     // Validate token in the database
//     const fileToken = await FileToken.findOne({ token });
//     if (!fileToken || new Date() > fileToken.expiresAt) {
//       return res.status(401).json({ error: 'Token expired or not valid' });
//     }

//     const absPath = path.join(process.cwd(), decoded.filePath);
//     if (!fs.existsSync(absPath)) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     // Serve the file to frontend and then clean up the token and local file if download is successful..
//     res.download(absPath, async (err) => {
//       if (!err) {
//         deleteLocalFile(absPath);
//       }
//     });

//   } catch (error) {
//     console.error('Download error:', error);
//     res.status(500).json({ error: 'Download failed' });
//   }
// };
