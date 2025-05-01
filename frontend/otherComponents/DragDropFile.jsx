
import React, { useState, useRef } from 'react';
import '../Styles/DragDropFile.css'; 

const DragDropFile = ({ 
  setFile, 
  setErrorMessage,
  allowedMimeTypes,
  allowedExtensions,
  sanitizeFilename,
  maxFileSize,
  description, 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const validateFile = (file) => {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setErrorMessage(`Only ${allowedExtensions.join(', ')} files are allowed`);
      return false;
    }

    const isValidMime = allowedMimeTypes.includes(file.type) || 
                       (allowedExtensions.includes(extension) && file.type === '');

    if (!isValidMime) {
      setErrorMessage(`Invalid file type. Please select a valid ${description}`);
      return false;
    }

    if (file.size > maxFileSize) {
      setErrorMessage(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    const sanitizedFile = new File(
      [file],
      sanitizeFilename(file.name),
      { type: file.type }
    );
    
    setFile(sanitizedFile);
    setFileName(sanitizedFile.name);
    setErrorMessage('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={allowedExtensions.join(',')}
        className="file-input-hidden"
      />
      
      <div className="drag-instruction">
        {dragActive ? (
          'Drop your file here'
        ) : (
          <>
            <div>Click to select or drag and drop</div>
            <div className="drag-subtext">
              (Supported: {allowedExtensions.join(', ')} up to {maxSizeMB}MB)
            </div>
          </>
        )}
      </div>

      {fileName && (
        <><div className="selected-file-label">
          Selected file:
        </div>
        <div className="selected-file-name">{fileName}</div>
        </>
      )}
    </div>
  );
};

export default DragDropFile;