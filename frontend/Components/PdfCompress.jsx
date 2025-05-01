import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Main-1.css'; 
import DragDropFile from '../otherComponents/DragDropFile.jsx';

const PdfCompress = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const allowedExtensions = ['.pdf'];
  const allowedMimeTypes = ['application/pdf'];

  const sanitizeFilename = (filename) =>
    filename.replace(/[^a-zA-Z0-9-_.]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:3000/compress', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Compression failed');
      }

      const result = await res.json();
      if (result.success) {
        navigate(`/download?token=${encodeURIComponent(result.token)}&outputFormat=pdf`);
      } else {
        throw new Error('Compression failed');
      }
    } catch (err) {
      console.error('Compression error:', err);
      setErrorMessage(err.message.startsWith('{') ? 'Invalid server response' : `Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="pdf-compress container mt-5">
        <h2 className="text-center mb-4">Compress PDF</h2>

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
                description="PDF file"
              />
              
              <div className="mt-3 text-center">
              <button
                type="submit"
                className="btn btn-primary w-40 d-block mx-auto"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <span className="converting-shimmer">Compressing...</span>
                ) : (
                  'Compress PDF'
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
          How to compress PDFs with our tool
        </h4>
        <p className="mb-4">
          Follow these simple steps to reduce your PDF file size:
        </p>

        <div className="d-flex justify-content-center">
          <ol
            className="list-group list-group-numbered text-start"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <li className="list-group-item">
              Click the <strong>Select PDF File</strong> button or drag & drop your PDF.
            </li>
            <li className="list-group-item">
              Choose the PDF you want to compress.
            </li>
            <li className="list-group-item">
              Our tool will automatically compress your PDF file.
            </li>
            <li className="list-group-item">
              After compression, download the optimized PDF or share it as needed.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default PdfCompress;
