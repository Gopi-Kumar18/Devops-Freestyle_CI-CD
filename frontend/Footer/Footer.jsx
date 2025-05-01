
import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../otherComponents/ThemeContext';
import '../Styles/Footer.css';

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <footer className={`footer ${darkMode ? 'dark-theme' : ''}`}>
      <div className="footer-container">
        
        {/* DocSwitch Section with Wave */}
        <div className="footer-section">
          <div className="section-header">
            <h3>DocSwitch</h3>
            <div className="waterwave"></div>
          </div>
          <ul>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>

        {/* Products */}
        <div className="footer-section">
          <div className="section-header">
            <h3>Products</h3>
            <div className="waterwave"></div>
          </div>
          <ul>
            <li><a href="/features">Features</a></li>
            <li><a href="/developers">Developers</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section">
          <div className="section-header">
            <h3>Contact Us</h3>
            <div className="waterwave"></div>
          </div>
          <ul>
            <li>Email: <a href="mailto:lovosotia@emcil.com">gptz1811@gmail.com</a></li>
            <li>Phone: <a href="tel:+AOYSSSA5SJ5186">+91 6300965097</a></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div className="footer-section">
          <div className="section-header">
            <h3>Follow Us</h3>
            <div className="waterwave"></div>
          </div>
          <div className="social-media-links">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-x-twitter"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Links (Privacy Policy & T&C) */}
      <div className="footer-bottom">
        <span>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </span>
        <Link to="/terms-and-conditions">Terms and Conditions</Link>
      </div>


      {/* <h1 class="footer-title">
    <span>D</span><span>o</span><span>c</span><span>S</span><span>w</span><span>i</span><span>t</span><span>c</span><span>h</span>
  </h1> }*/}

    </footer>
  );
};

export default Footer;





