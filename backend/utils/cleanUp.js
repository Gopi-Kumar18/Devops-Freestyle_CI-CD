
import fs from 'fs';

export const deleteLocalFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    console.log(`Successfully deleted: ${filePath}\n\n`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
    } else {
      console.error(`Failed to delete ${filePath}:`, error);
      throw error; 
    }
  }
};
































































































// import fs from 'fs';

// export const deleteLocalFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log(`File deleted from server at this path : ${filePath}`);
//     }
//   } catch (error) {
//     console.error('Error deleting file:', error);
//   }
// };
