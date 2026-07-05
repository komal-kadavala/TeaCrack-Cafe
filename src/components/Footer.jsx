import React from 'react';
import logoImg from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={logoImg} 
            alt="Teacrack Cafe Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '3px solid var(--gold)', 
              objectFit: 'cover' 
            }} 
          />
        </div>
        <h2 className="footer-logo">Teacrack Cafe</h2>
        <p className="footer-tagline">“Every Bite, Made Just For You!”</p>
        
        <hr className="footer-divider" />
        
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Teacrack Cafe. All Rights Reserved. Designed for premium experience.
        </p>
      </div>
    </footer>
  );
}
