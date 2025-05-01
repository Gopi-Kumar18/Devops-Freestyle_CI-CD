import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile';

import '../Styles/Main-1.css';

const ExcelToCSV = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  
  const allowedExtensions = ['.xls', '.xlsx', '.xlsm'];
  const allowedMimeTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
  ];

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
      formData.append('outputFormat', 'csv');
      formData.append('conversionType', 'excel-to-csv');

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
        navigate(`/download?token=${encodedToken}&outputFormat=csv`);
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
    <div className="excel-to-csv container mt-5">
      <h2 className="text-center mb-4">Excel to CSV</h2>
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
              description='Word files (DOC, DOCX)'
            />
          
          <p className="mt-3 text-center">or</p>
            <button 
              type="submit" 
              className="btn btn-primary w-40 d-block mx-auto" 
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="converting-shimmer">Converting...</span>
              ) : (
                "Convert to CSV"
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
    How to convert documents with the DocSwitch Excel to "Comma-separated values"(CSV) converter tool
  </h4>
  <p className="mb-4">
    Follow these easy steps to turn a SpreadSheet file into a CSV document:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Select Choose File"</strong> button or drag and drop a Excel file.
      </li>
      <li className="list-group-item">
        Choose any Excel file you want to convert to CSV format.
      </li>
      <li className="list-group-item">
        Our tool will automatically convert the Excel to an editable CSV document.
      </li>
      <li className="list-group-item">
        After conversion, download the CSV document or share it as needed.
      </li>
    </ol>
  </div>
</div>
    </>
  );
};

export default ExcelToCSV;