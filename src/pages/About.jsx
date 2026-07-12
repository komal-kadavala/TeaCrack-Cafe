import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function About() {
  useScrollReveal();

  const guidelines = [
    { text: "Orders once placed cannot be cancelled or changed.", icon: "🚫" },
    { text: "Please check your order before leaving.", icon: "🛍️" },
    { text: "Outside food is not allowed.", icon: "🍔" },
    { text: "Please pay at the time of ordering.", icon: "💳" },
    { text: "Pets are not allowed inside the café.", icon: "🐶" },
    { text: "Free Wi-Fi available for customers.", icon: "📶" },
    { text: "Smoking is prohibited inside the café.", icon: "🚭" },
    { text: "Please maintain cleanliness and respect other customers.", icon: "🧹" }
  ];

  return (
    <div>
      <SEO title="About Us" path="/about" />
      {/* Narrative Section */}
      <section id="about" className="about-section" style={{ minHeight: 'calc(100vh - 100px)', paddingTop: '140px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-text reveal">
              <p className="section-label">Our Story</p>
              <h2 className="section-title">A Cafe Born From Love</h2>
              <p className="about-para">
                Teacrack Cafe opened its doors in 2026 with one simple promise — every bite, made just for you. 
                From our first cup of masala chai to our wood-fired pizzas, every item is crafted with care and a whole lot of flavour.
              </p>
              <p className="about-para">
                We believe great food doesn't need to be expensive. Our menu is designed to be accessible, 
                satisfying, and absolutely delicious — whether you're here for a quick snack or a slow, lingering coffee.
              </p>
              <Link to="/menu" className="btn btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                Explore Menu
              </Link>
            </div>
            
            <div className="about-visual reveal">
              <div className="about-card about-card-main">
                <div className="emoji">☕</div>
                <h3>Fresh Brewed<br />Daily</h3>
              </div>
              <div className="about-card about-card-accent">
                <div className="big-num">100%</div>
                <p>Pure Veg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned GOOD TO KNOW Section */}
      <section className="guidelines-section">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <p className="section-label" style={{ color: 'var(--gold)' }}>Cafe Rules</p>
            <h2 className="section-title" style={{ color: 'var(--cream)', marginBottom: '8px' }}>GOOD TO KNOW</h2>
            <p className="guidelines-subtitle">Please read these guidelines before placing your order.</p>
          </div>

          <div className="guidelines-grid">
            {guidelines.map((g, idx) => (
              <div className="guideline-card reveal" key={idx}>
                <div className="guideline-icon">{g.icon}</div>
                <div className="guideline-text">{g.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
