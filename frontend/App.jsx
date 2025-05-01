import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import Navbar from './Components/Navbar';

import HomePage from './Pages/HomePage';
import AboutUs from './Pages/AboutUs';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsAndConditions from './Pages/TermsAndConditions';
import FAQs from './Pages/FAQs';
import DownloadPage from './Pages/DownloadPage';
// import ContactUs from './Pages/ContactUs.jsx';


import PdfToDocx from './Components/PdfToDocx';
import DocxToPdf from './Components/DocxToPdf';
import PdfToPptx from './Components/PdfToPptx';
import PptxToPdf from './Components/PptxToPdf';
import MergeDocumentsToPdf from './Components/MergeDocsToPdf';
import PdfToExcel from './Components/PdfToExcel';
import ExcelToCSV from './Components/ExcelToCSV';
import PdfCompress from './Components/PdfCompress';
import { ThemeProvider } from './otherComponents/ThemeContext';
// import './otherComponents/ToolLinks.jsx';


import Footer from './Footer/Footer';

import './Styles/App.css';



const App = () => {
  return (
    <>
    <ThemeProvider>
    <Router>
      <AppContent />
    </Router>
    </ThemeProvider>
    
    </>
    
  );
};


const AppContent = () => {
  const location = useLocation();

  return (
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">

          <Routes>

                 {/* Redirect from root to home page */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/download" element={<DownloadPage />} />
                {/* <Route path="/contactus" element={<ContactUs />}/> */}
                 

                 {/*Conversion routes..*/}
                <Route path="/pdf-to-word" element={<PdfToDocx />} />
                <Route path="/pdf-to-presentation" element={<PdfToPptx />} />
                <Route path="/word-to-pdf" element={<DocxToPdf />} />
                <Route path="/presentation-to-pdf" element={<PptxToPdf />} />
                <Route path="/pdf-to-excel" element={<PdfToExcel />}/>
                <Route path="/excel-to-csv" element={<ExcelToCSV />}/>
                <Route path="/compress-pdf" element={<PdfCompress />} />

                {/*Merge route*/}
                <Route path="/merge-docs" element={<MergeDocumentsToPdf />} />


          </Routes>

        </main>
        {/* Show footer only on home page */}
        {['/', '/home'].includes(location.pathname) && <Footer />}

      </div>
  );
};

export default App;