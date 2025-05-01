// routes/convertRoutes.js
import express from 'express';
import multer from 'multer';
import { convertFile } from '../controllers/convertController.js';
import {adobeConverter} from '../controllers/adobeConvertController.js';
import {mergePdfs} from '../controllers/mergeController.js';
import { downloadConvertedFile } from '../controllers/downloadController.js';
import { adobeCompressor } from '../controllers/adobeCompressController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/convert', upload.single('file'), convertFile); // Endpoint for file conversion
router.post('/adobeConvert', upload.single('file'), adobeConverter); // Endpoint for Adobe conversion
router.post('/merge', upload.array('files', 10), mergePdfs); // Endpoint for file merging
router.post('/compress', upload.single('file'), adobeCompressor); // Endpoint for file compression

router.get('/download', downloadConvertedFile); // Endpoint for file download

export default router;
