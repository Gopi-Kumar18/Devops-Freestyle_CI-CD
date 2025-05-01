import React from "react";
import { Link } from "react-router-dom";

const ToolLinks = () => {
  const sections = [
    {
      title: "Convert from PDF",
      items: [
        { name: "PDF to Word", to: "/pdf-to-word" },
        { name: "PDF to JPG", to: "/pdf-to-jpg" },
        { name: "PDF to Excel", to: "/pdf-to-excel" },
        { name: "PDF to PPT", to: "/pdf-to-ppt" },
        { name: "PDF converter", to: "/pdf-converter" },
      ],
    },
    {
      title: "Convert to PDF",
      items: [
        { name: "Word to PDF", to: "/word-to-pdf" },
        { name: "JPG to PDF", to: "/jpg-to-pdf" },
        { name: "PNG to PDF", to: "/png-to-pdf" },
        { name: "Excel to PDF", to: "/excel-to-pdf" },
        { name: "PPT to PDF", to: "/ppt-to-pdf" },
        { name: "OCR PDF", to: "/ocr-pdf" },
        { name: "Compress PDF", to: "/compress-pdf", isSubTitle: true },
      ],
    },
    {
      title: "Edit",
      items: [
        { name: "Edit PDF", to: "/edit-pdf" },
        { name: "Merge PDFs", to: "/merge-pdfs" },
        { name: "Split PDF", to: "/split-pdf" },
        { name: "Crop PDF", to: "/crop-pdf" },
        { name: "Delete PDF pages", to: "/delete-pdf-pages" },
        { name: "Rotate PDF pages", to: "/rotate-pdf-pages" },
        { name: "Reorder PDF pages", to: "/reorder-pdf-pages" },
        { name: "Extract PDF pages", to: "/extract-pdf-pages" },
        { name: "Insert PDF pages", to: "/insert-pdf-pages" },
        { name: "Number PDF pages", to: "/number-pdf-pages" },
      ],
    },
    {
      title: "Sign & Protect",
      items: [
        { name: "Fill & Sign", to: "/fill-sign" },
        { name: "Request e-signatures", to: "/request-e-signatures" },
        { name: "Protect PDF", to: "/protect-pdf" },
      ],
    },
    {
      title: "Generative AI",
      items: [{ name: "Chat with PDF", to: "/chat-with-pdf" }],
    },
  ];

  return (
    <div className="container my-5">
      <h3 className="text-center mb-5 fw-bold">Try these Acrobat online tools</h3>
      <div className="row row-cols-1 row-cols-md-5 g-4 text-start">
        {sections.map((section, idx) => (
          <div className="col" key={idx}>
            <h6 className="fw-semibold">{section.title}</h6>
            <ul className="list-unstyled">
              {section.items.map((item, i) => (
                <li key={i}>
                  {item.isSubTitle ? (
                    <h6 className="fw-semibold mt-3">{item.name}</h6>
                  ) : (
                    <Link to={item.to} className="text-decoration-none text-primary">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolLinks;
