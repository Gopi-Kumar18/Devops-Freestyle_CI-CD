
//util/tokenUtils.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
console.log('JWT_SECRET:-', JWT_SECRET, "\n");

export const verifyDownloadToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'] 
    });
  } catch (err) {
    return null;
  }
};
























































































































// //util/tokenUtils.js
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';

// dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET || 'default_Secret';
// // console.log('JWT_SECRET:', JWT_SECRET);  // for debugging

// const TOKEN_EXPIRATION = '15m';

// export const generateDownloadToken = (filePath) => {
//   return jwt.sign({ filePath }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
// };

// export const verifyDownloadToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch (err) {
//     return null;
//   }
// };