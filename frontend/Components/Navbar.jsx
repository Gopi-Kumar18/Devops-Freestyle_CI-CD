import React, { useState, useEffect, useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../Styles/NavBar.css';
import {ThemeContext} from '../otherComponents/ThemeContext';

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  return (
    <nav className={`custom-navbar navbar navbar-expand-lg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <a className="navbar-brand" href="/home">DocSwitch</a>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={handleToggle} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/home">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Login</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Sign Up</a>
            </li>
            <li className="nav-item">
              <button 
                className="theme-toggle-btn" 
                onClick={toggleTheme}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <i className="fas fa-sun"></i> // Sun icon for light mode
                ) : (
                  <i className="fas fa-moon"></i> // Moon icon for dark mode
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


