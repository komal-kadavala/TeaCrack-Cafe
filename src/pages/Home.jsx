import React from 'react';
import Hero from '../components/Hero';
import useScrollReveal from '../hooks/useScrollReveal';
import insideImg from '../assets/inside.jpg';

export default function Home() {
  useScrollReveal();

  const marqueeItems = [
    '🍕 Pizza', '☕ Hot Coffee', '🥪 Sandwiches', '🧋 Milkshakes', 
    '🍟 Fries', '🍵 Masala Chai', '🧆 Samosa', '🍔 Burger', 
    '🌯 Frankie', '🍞 Garlic Bread'
  ];

  return (
    <div>
      {/* HERO BANNER */}
      <Hero />

      {/* MARQUEE SECTION */}
      <div className="marquee-wrap">
        <div className="marquee-track" id="marquee">
          {marqueeItems.concat(marqueeItems).map((item, idx) => (
            <span className="marquee-item" key={idx}>
              {item} <span>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* SPECIALS / MUST-TRY */}
      <section id="specials" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <p className="section-label">Staff Picks</p>
            <h2 className="section-title">Must Try</h2>
          </div>
          
          <div className="specials-grid">
            <div className="special-card reveal">
              <div className="special-emoji">🍵</div>
              <div className="special-name">Spiced Masala Chai</div>
              <p className="special-desc">The classic that started it all. Rich, aromatic, and made fresh every time.</p>
              <div className="special-price">30 Rs</div>
            </div>
            
            <div className="special-card reveal">
              <div className="special-emoji">🍕</div>
              <div className="special-name">American Garden Pizza</div>
              <p className="special-desc">Our most loaded pizza — garden-fresh toppings on a crispy base with extra cheese.</p>
              <div className="special-price">130 Rs</div>
            </div>
            
            <div className="special-card reveal">
              <div className="special-emoji">🧋</div>
              <div className="special-name">KitKat Milkshake</div>
              <p className="special-desc">Thick, creamy, and utterly sinful. The bestseller that's been loved since day one.</p>
              <div className="special-price">100 Rs</div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP INSIDE */}
      <section id="inside" style={{ background: 'var(--dark)', padding: '40px 0' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p className="section-label" style={{ color: 'var(--gold)' }}>Real Ambience</p>
            <h2 className="section-title" style={{ color: 'var(--cream)', textAlign: 'center' }}>Step Inside Teacrack</h2>
            <p className="inside-subtitle">See exactly how we look — warm seats, good vibes &amp; great chai waiting for you.</p>
          </div>
          
          <div className="reveal inside-media-container">
            <img src={insideImg} alt="Teacrack Cafe Ambience" />
          </div>
        </div>
      </section>
    </div>
  );
}
