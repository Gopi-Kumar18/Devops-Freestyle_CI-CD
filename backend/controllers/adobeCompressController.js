import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { fileTypeFromFile } from "file-type";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import FileToken from "../models/FileToken.js";  

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CompressPDFJob,
  CompressPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError
} from "@adobe/pdfservices-node-sdk";

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeCompressor = async (req, res) => {
  let outputFilePath = null;
  let readStream   = null;

  try {
    // 1. Validate upload
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // 2. Ensure it's a PDF
    const inputFilePath = req.file.path;
    const info = await fileTypeFromFile(inputFilePath);
    if (!info || info.mime !== MimeType.PDF) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Only PDFs allowed." });
    }

    // 3. Adobe credentials + client
    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });
    const pdfServices = new PDFServices({ credentials });

    // 4. Upload to Adobe
    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF
    });

    // 5. Create Compress job
    const job = new CompressPDFJob({ inputAsset });

    // 6. Submit & poll
    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: CompressPDFResult
    });

    // 7. Prepare output directory
    const downloadsDir = path.join(process.cwd(), "downloads", "compress");
    fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });

    // 8. Unique output name
    const baseName       = path.parse(req.file.originalname).name;
    const safeBase       = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
    const randomHex      = crypto.randomBytes(4).toString("hex");
    const outputFileName = `${safeBase}_${randomHex}.pdf`;
    outputFilePath       = path.join(downloadsDir, outputFileName);
    const relativePath   = path.join("downloads", "compress", outputFileName);

    // 9. Save compressed PDF
    const streamAsset = await pdfServices.getContent({
      asset: result.result.asset
    });
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 });
    streamAsset.readStream.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });


    const encodedFilePath = Buffer.from(relativePath).toString("base64url");
    const token   = jwt.sign(
      { file: encodedFilePath, ip: req.ip },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" }
    );
    
    await FileToken.create({
      token,
      filePath:  encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    // 11. Cleanup original upload
    await unlinkAsync(inputFilePath);


    res.json({
      success:      true,
      token,
      fileName:     outputFileName,
    });

  } catch (err) {
    console.error("Compress error:", err);

    readStream?.destroy();
    if (outputFilePath) fs.unlink(outputFilePath, () => {});
    if (req.file?.path)  unlinkAsync(req.file.path).catch(() => {});

    const msg =
      err instanceof ServiceApiError   ? "Adobe API error" :
      err instanceof ServiceUsageError ? "Adobe usage error" :
      err instanceof SDKError          ? "Adobe SDK error" : 
      "Internal error";

    res.status(500).json({
      error:   msg,
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
