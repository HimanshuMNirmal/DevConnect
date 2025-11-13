import React from 'react';
import { useTheme } from '../../theme/useTheme';
import './Footer.css';

const Footer = () => {
  const { theme, gradients } = useTheme();

  return (
    <footer className="footer" style={{ 
      background: theme.colors.bgPrimary,
      borderTop: `1px solid ${theme.colors.borderColorLight}`
    }}>
      <div className="footer-container">
        <div className="footer-content">
          <h3 className="footer-title" style={{
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            DevConnect
          </h3>

          <div className="footer-info">
            <p style={{ color: theme.colors.lightText }}>
              <strong>Developer:</strong> Himanshu Nirmal
            </p>

            <div className="footer-links">
              <a 
                href="mailto:nirmalhimanshu1505@gmail.com"
                style={{ color: theme.colors.primary }}
              >
                nirmalhimanshu1505@gmail.com
              </a>
              <span style={{ color: theme.colors.lightText }}>~|~</span>
              <a 
                href="https://linkedin.com/in/himanshunirmal"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.colors.primary }}
              >
                linkedin.com/in/himanshunirmal
              </a>
              <span style={{ color: theme.colors.lightText }}>~|~</span>
              <a 
                href="https://github.com/HimanshuMNirmal"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.colors.primary }}
              >
                github.com/HimanshuMNirmal
              </a>
            </div>

            <div className="footer-project">
              <p style={{ color: theme.colors.lightText }}>
                <strong>Source Code:</strong>
              </p>
              <a 
                href="https://github.com/HimanshuMNirmal/DevConnect"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.colors.primary }}
              >
                github.com/HimanshuMNirmal/DevConnect
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
