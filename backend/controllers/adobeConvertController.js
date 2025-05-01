import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { fileTypeFromFile } from "file-type";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExportPDFJob,
    ExportPDFTargetFormat,
    ExportPDFParams,
    ExportPDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";
import FileToken from "../models/FileToken.js";  

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeConverter = async (req, res) => {
  let outputFilePath = null;
  try {
    // 1. Input Validation
    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // 2. File Validation
    const inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);
    // Accept only PDFs for Adobe conversion

    const allowedMimes = ["application/pdf"];
    if (!fileInfo || !allowedMimes.includes(fileInfo.mime)) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Invalid file type" });
    }

    // 3. Sanitize inputs
    const outputFormat = req.body.outputFormat.replace(/[^a-z]/gi, "");
    const conversionType = req.body.conversionType.replace(/[^a-zA-Z0-9-_]/g, "");
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 100);

      //  console.log(outputFormat);

    let targetFormat;
switch (outputFormat) {
  case "pptx":
    targetFormat = ExportPDFTargetFormat.PPTX;
    break;
  case "xlsx":
    targetFormat = ExportPDFTargetFormat.XLSX;
    break;
  case "jpg":
  case "jpeg":
    targetFormat = ExportPDFTargetFormat.JPEG;
    break;
  case "png":
    targetFormat = ExportPDFTargetFormat.PNG;
    break;
  default:
    return res.status(400).json({ error: "Unsupported conversion format" });
}

    // 4. Initialize Adobe PDF Services
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    if (!credentials) {
      console.error("Credentials not found");
    }
    
    const pdfServices = new PDFServices({ credentials });

    // 5. Create an input asset by uploading the local PDF file.
    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.PDF
    });

    // 6. Build export parameters for PPTX conversion.
    const params = new ExportPDFParams({
      targetFormat: targetFormat
    });

    // 7. Create a new job instance for exporting PDF to PPTX.
    const job = new ExportPDFJob({
      inputAsset,
      params
    });

    // 8. Submit the job and get the polling URL.
    const pollingURL = await pdfServices.submit({ job });

    // 9. Get the job result.
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExportPDFResult
    });

    // 10. creating secure storage directory.
    const downloadsDir = path.join(process.cwd(),"downloads",conversionType.slice(0, 50));
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });
    }

    // 11. Generating a unique output file name.
    const outputFileName = `${originalName}_${crypto.randomBytes(4).toString("hex")}.${outputFormat}`;

    outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join("downloads", conversionType, outputFileName);


    const streamAsset = await pdfServices.getContent({
      asset: pdfServicesResponse.result.asset
    });
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 });
    streamAsset.readStream.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const encodedFilePath = Buffer.from(relativeFilePath).toString('base64url');

    const token = jwt.sign({ file: encodedFilePath, ip: req.ip },process.env.JWT_SECRET,{ algorithm: "HS256", expiresIn: "15m" });

    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    try {
      await unlinkAsync(inputFilePath);
      console.log(`[${new Date().toISOString()}] File removed: ${inputFilePath}`);
    } catch (err) {
      console.error("File removal error:", err);
    }

    res.json({
      success: true,
      token,
      outputFormat,
      fileName: outputFileName
    });
  } catch (err) {
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.error("Exception encountered while executing operation", err);
  } else {
      console.error("Exception encountered while executing operation", err);
  }

    res.status(500).json({
      error: "Conversion failed",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};
