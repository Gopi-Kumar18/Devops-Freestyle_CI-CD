
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; 

const DownloadPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const outputFormat = searchParams.get('outputFormat');
  const navigate = useNavigate(); 

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleDownload = () => {
    window.location.href = `${backendUrl}/download?token=${token}&outputFormat=${outputFormat}`;
  };

  const handleBackToHome = () => {
    navigate('/'); 
  };

  return (
    <div className="download-page container mt-5">
      <h2 className="text-center mb-4">Your file is ready!</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body text-center">
          <button onClick={handleDownload} className="btn btn-success me-3">
            Download {outputFormat?.toUpperCase()}
          </button>
          <button onClick={handleBackToHome} className="btn btn-secondary">
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
