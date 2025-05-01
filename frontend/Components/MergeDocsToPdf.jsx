
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../Styles/Main-1.css';

const MergeDocumentsToPdf = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Allowed file formats
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg'
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  
  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '');
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    let errorMsg = '';

    const sanitizedFiles = newFiles.map(file => {
      if (!allowedTypes.includes(file.type)) {
        errorMsg = 'Only PDF, DOCX, PPTX, JPG, and PNG files are allowed.';
        return null;
      }
      if (file.size > maxFileSize) {
        errorMsg = 'One or more files exceed the 5MB limit.';
        return null;
      }

      const sanitizedName = sanitizeFilename(file.name);
      return new File([file], sanitizedName, { type: file.type });
    }).filter(Boolean);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // Check total file count
    const totalFiles = files.length + sanitizedFiles.length;
    if (totalFiles > 10) {
      setError('Maximum 10 files allowed.');
      return;
    }

    // Append new files to existing ones
    setFiles(prevFiles => [...prevFiles, ...sanitizedFiles]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      if (newFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return newFiles;
    });
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    if (files.length < 2) {
      setError('Please select at least 2 files.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const res = await axios.post('http://localhost:3000/merge', formData, {
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // }
      });

      if (res.data.success) {
        const encodedToken = encodeURIComponent(res.data.token);
        navigate(`/download?token=${encodedToken}&outputFormat=pdf`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (err) {
      console.error('Merge error:', err);
      setError(err.message.startsWith('{') ? 'Invalid server response' : `Error: ${err.message}`);
    } finally {
      console.log('Finally block: setting isLoading to false');
      setIsLoading(false);
    }
  };

return (
  <>
  <div className="merge-docs-to-pdf container mt-5">
    <h2 className="text-center mb-4">Merge Documents</h2>
    <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
      <div className="card-body">
        <form onSubmit={handleMerge}>
          <div className="mb-3">
            <label htmlFor="docFiles" className="form-label">
              Select Documents (PDF, DOCX, PPTX, JPG, PNG)
            </label>
            <div className="file-input-container">
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                id="docFiles"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
                required
              />
              <span className="file-input-label">Choose Files</span>
            </div>

            {files.length > 0 && (
              <div className="selected-files mt-3">
                <h6>Selected Files ({files.length}):</h6>
                {files.map((file, index) => (
                  <div key={index} className="file-item d-flex justify-content-between align-items-center">
                    <span className="file-name">
                      {index + 1}. {file.name}
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm"     //in case if css button is not working..
                      onClick={() => handleRemoveFile(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-40 d-block mx-auto"
            disabled={isLoading || files.length < 2}
          >
            {isLoading ? (<span className="converting-shimmer">Merging...</span>) : `Merge ${files.length} Documents`}
          </button>
          {error && (
            <div className="alert-danger text-center mt-3">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  </div>

  {/* Q&A Section */}
  <div className="container mt-5 mb-5 text-center">
  <h4 className="mb-4">
    How to Merge documents with the DocSwitch various Documents to PDF converter tool
  </h4>
  <p className="mb-4">
    Follow these easy steps to Combine multiple files into a Sinle PDF document:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Select Choose File"</strong> button or drag and drop files(upto 10).
      </li>
      <li className="list-group-item">
        Choose any allowed files you want to merge them to single PDF format.
      </li>
      <li className="list-group-item">
      Our tool will automatically convert your files into a PDF, helping you save disk space.      </li>
      <li className="list-group-item">
        After conversion, download the PDF document or share it as needed.
      </li>
    </ol>
  </div>
</div>
  </>
  );
};

export default MergeDocumentsToPdf;



