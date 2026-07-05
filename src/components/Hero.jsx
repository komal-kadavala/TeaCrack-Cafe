import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

export default function Hero() {
  useEffect(() => {
    // Generate floating icons in background
    const container = document.getElementById('floaters');
    if (!container) return;
    container.innerHTML = ''; // Clear previous

    const emojis = ['🍵', '☕', '🍕', '🥪', '🍟', '🍔'];
    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.fontSize = `${Math.random() * 2 + 1.5}rem`;
      el.style.animationDuration = `${Math.random() * 15 + 10}s`;
      el.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(el);
    }
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-noise"></div>
      <div className="floaters" id="floaters"></div>
      
      <div className="hero-content">
        <div style={{ marginBottom: '24px', animation: 'fadeUp .8s ease both' }}>
          <img 
            src={logoImg} 
            alt="Teacrack Cafe Logo" 
            style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              border: '4px solid var(--gold)', 
              objectFit: 'cover',
              boxShadow: '0 0 40px rgba(212,168,67,0.4)' 
            }} 
          />
        </div>
        
        <div className="hero-tag">Est. 2026 · Rajkot</div>
        
        <h1 className="hero-title">
          TEA<span>CRACK</span><br />CAFE
        </h1>
        
        <p className="hero-sub">Every bite, made just for you!!</p>
        
        <div className="hero-cta">
          <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          <Link to="/contact" className="btn btn-outline">Visit Us</Link>
        </div>
      </div>
      
      <div className="scroll-hint">↓ Scroll</div>
    </section>
  );
}
