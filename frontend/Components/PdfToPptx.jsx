
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const PdfToPptx = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024;

  const allowedExtensions = ['.pdf'];
  const allowedMimeTypes = ['application/pdf'];


  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '');
  };

  const handleConversion = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', 'pptx');
      formData.append('conversionType', 'pdf-to-presentation');

      const response = await fetch('http://localhost:3000/adobeConvert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const encodedToken = encodeURIComponent(result.token);
        navigate(`/download?token=${encodedToken}&outputFormat=pptx`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setErrorMessage(error.message.startsWith('{') ? 'Server error occurred' : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="pdf-to-pptx container mt-5">
      <h2 className="text-center mb-4">PDF to PowerPoint Conversion</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleConversion}>
          <DragDropFile 
              setFile={setFile}
              setErrorMessage={setErrorMessage}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={sanitizeFilename}
              maxFileSize={maxFileSize}
              description='PDF files'
            />
          
          <div className="mt-3 text-center">
            <button 
              type="submit" 
              className="btn btn-primary w-40 d-block mx-auto"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="converting-shimmer">Converting...</span>
              ) : (
                'Convert to PowerPoint'
              )}
            </button>
            </div>
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
    How to convert documents with the DocSwitch PDF to Presentation converter tool
  </h4>
  <p className="mb-4">
    Follow these easy steps to turn a PDF into a Microsoft Presentation document:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Select Choose File"</strong> button or drag and drop a PDF file.
      </li>
      <li className="list-group-item">
        Choose the PDF file you want to convert to PPTX format.
      </li>
      <li className="list-group-item">
        Our tool will automatically convert the PDF to an editable Presentation document.
      </li>
      <li className="list-group-item">
        After conversion, download the PPTX document or share it as needed.
      </li>
    </ol>
  </div>
</div>
    </>
  );
};

export default PdfToPptx;
