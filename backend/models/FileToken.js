// models/FileToken.js
import mongoose from 'mongoose';

const FileTokenSchema = new mongoose.Schema({
  token: { type: String, required: true},
  filePath: { type: String, required: true }, // Path to the file
  expiresAt: { type: Date, required: true },
  operationType: { type: String, enum: ['convert', 'merge'], default: 'convert' }

  
});

FileTokenSchema.index({ token: 1 }, { unique: true });
FileTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

//filetokens is the collection name
export default mongoose.model('FileToken', FileTokenSchema);