
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const PdfToDocx = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const allowedExtensions = ['.pdf'];
  const allowedMimeTypes = ['application/pdf'];
  
  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', 'docx');
      formData.append('conversionType', 'pdf-to-word');

      const res = await fetch('http://localhost:3000/convert', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Conversion failed');
      }

      const result = await res.json();
      
      if (result.success) {
        const encodedToken = encodeURIComponent(result.token);
        navigate(`/download?token=${encodedToken}&outputFormat=docx`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (e) {
      console.error('Conversion error:', e);
      setErrorMessage(e.message.startsWith('{') ? 'Invalid server response' : `Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="pdf-to-docx container mt-5">
      <h2 className="text-center mb-4">PDF to Word</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
          <DragDropFile 
              setFile={setFile}
              setErrorMessage={setErrorMessage}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={sanitizeFilename}
              maxFileSize={maxFileSize}
              description='PDF files'
            />

            <div className="mt-3 text-center"></div>
            <button 
              type="submit" 
              className="btn btn-primary w-40 d-block mx-auto" 
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="converting-shimmer">Converting...</span>
              ) : (
                "Convert to DOCX"
              )}
            </button>
          </form>
          {errorMessage && (
            <div className="alert alert-danger mt-3 mb-0">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Q&A Section */}
    <div className="container mt-5 mb-5 text-center">
  <h4 className="mb-4">
    How to convert documents with the DocSwitch PDF to Word converter tool
  </h4>
  <p className="mb-4">
    Follow these easy steps to turn a PDF into a Microsoft Word document:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Select Choose File"</strong> button or drag and drop a PDF file.
      </li>
      <li className="list-group-item">
        Choose the PDF file you want to convert to DOCX format.
      </li>
      <li className="list-group-item">
        Our tool will automatically convert the PDF to an editable Word document.
      </li>
      <li className="list-group-item">
        After conversion, download the Word document or share it as needed.
      </li>
    </ol>
  </div>
</div>
  </>
);
};

export default PdfToDocx;

