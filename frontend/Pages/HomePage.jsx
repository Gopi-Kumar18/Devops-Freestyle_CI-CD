
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../Styles/HomePage.css'; 

import PdfToWordlogo from '../assets/Pdf-Word.png';
import PdfToPresentationlogo from '../assets/Pdf-Pres.png';
import PdfToExcellogo from '../assets/Pdf-Excel.png';
import WordToPdflogo from '../assets/Word-Pdf.png';
import PresentationToPdflogo from '../assets/Pres-Pdf.png';
import ExcelToCSVlogo from '../assets/Excel-CSV.png';
import MergeDoclogo from '../assets/Merged-Pdf.png';
import CompressPdflogo from '../assets/Pdf-compress.png';

const conversionTypes = ["DOCX", "PDF", "PPTX", "JPG", "PNG"];

const cardData = [
  {
    path: "/pdf-to-word",
    img: PdfToWordlogo,
    title: "PDF to Word",
    text: "Transform your PDF to Word format",
    subtext: "Edit text and reuse content in Word easily."
  },
  {
    path: "/pdf-to-presentation",
    img: PdfToPresentationlogo,
    title: "PDF to Presentation",
    text: "Create presentations from PDFs",
    subtext: "Convert your documents into slide-ready visuals."
  },
  {
    path: "/pdf-to-excel",
    img: PdfToExcellogo,
    title: "PDF To SpreadSheets",
    text: "Convert PDFs to various SpreadSheets format.",
    subtext: "Extract tabular data to Excel for quick analysis."
  },
  {
    path: "/word-to-pdf",
    img: WordToPdflogo,
    title: "Word to PDF",
    text: "Transform your Word to PDF",
    subtext: "Preserve formatting and secure your documents."
  },
  {
    path: "/presentation-to-pdf",
    img: PresentationToPdflogo,
    title: "Presentation to PDF",
    text: "Convert presentations to PDFs",
    subtext: "Share slides with consistent formatting anywhere."
  },
  {
    path: "/excel-to-csv",
    img: ExcelToCSVlogo,
    title: "SpreadSheets To CSV",
    text: "Convert spreadsheets to CSV",
    subtext: "Export data into a clean, shareable format."
  },
  {
    path: "/merge-docs",
    img: MergeDoclogo,
    title: "Merge PDFs",
    text: "Combine multiple DOCs into one",
    subtext: "Merge files for streamlined sharing and storage."
  },
  {
    path: "/compress-pdf",
    img: CompressPdflogo,
    title: "Compress PDF",
    text: "Compress an Pdf file ",
    subtext: "Compress PDf for streamlined storage save."
  }
];

const HomePage = () => {
  const [currentConversion, setCurrentConversion] = useState(conversionTypes[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentConversion(prev => {
          const index = conversionTypes.indexOf(prev);
          return conversionTypes[(index + 1) % conversionTypes.length];
        });
        setFade(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page container">
      <header className="text-center mt-5">
      <div className="display-6">From PDFs to Everything – Instantly</div>
        <p className="lead">
          Transform your documents to {" "}
          <span className={`conversion-text ${fade ? 'fade-out' : 'fade-in'}`}>{currentConversion}</span>{" "}
          effortlessly. All tools are FREE and user-friendly!
        </p>
      </header>

      <div className="row justify-content-center mt-4">
        {cardData.slice(0, 6).map(({ path, img, title, text, subtext }, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <Link to={path} className="text-decoration-none text-dark">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <img src={img} alt={`${title} Logo`} className="img-fluid" style={{ maxHeight: '40px' }} />
                  </div>
                  <h3 className="card-title">{title}</h3>
                  <p className="card-text small-text">{text}<br />{subtext}</p>
                </div>
                <div className="card-footer bg-light">
                  <small className="text-muted">Click to convert</small>
                </div>
              </div>
            </Link>
          </div>
        ))}

        <br /><br /><br />
        <h3 style={{ textAlign: "center" }}>Our other frequently used Pdf conversion's</h3>
        <br /><br />

        {cardData.slice(6).map(({ path, img, title, text, subtext }, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <Link to={path} className="text-decoration-none text-dark">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <img src={img} alt={`${title} Logo`} className="img-fluid" style={{ maxHeight: '40px' }} />
                  </div>
                  <h3 className="card-title">{title}</h3>
                  <p className="card-text small-text">{text}<br />{subtext}</p>
                </div>
                <div className="card-footer bg-light">
                  <small className="text-muted">Click to merge</small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>

    
  );
};

export default HomePage;


