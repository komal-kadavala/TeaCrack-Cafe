import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Contact() {
  useScrollReveal();

  return (
    <section id="location" style={{ minHeight: '100vh', paddingTop: '140px', background: 'var(--cream)' }}>
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <p className="section-label">Come Visit Us</p>
          <h2 className="section-title">Find Us in Rajkot</h2>
        </div>

        <div className="reveal contact-grid">
          {/* Map on the Left (Option A) */}
          <div className="map-wrapper">
            <iframe 
              src="https://maps.google.com/maps?q=Teacrack+Cafe,+Rajkot,+Gujarat&output=embed&z=17&hl=en" 
              width="100%" 
              height="100%" 
              style={{ border: 'none', display: 'block' }} 
              allowFullScreen 
              loading="lazy"
              title="TeaCrack Cafe Location Map"
            ></iframe>
          </div>

          {/* Contact Details on the Right */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="contact-info-block">
              <div className="contact-info-icon">📍</div>
              <div>
                <div className="contact-info-label">Address</div>
                <div className="contact-info-value">Teacrack Cafe, Rajkot, Gujarat, India</div>
              </div>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-icon">🕐</div>
              <div>
                <div className="contact-info-label">Hours</div>
                <div className="contact-info-value">Open Daily · Morning to Night</div>
              </div>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-icon">📞</div>
              <div>
                <div className="contact-info-label">Phone</div>
                <div className="contact-info-value">
                  <a href="tel:9274328677">92743 28677</a>
                </div>
              </div>
            </div>

            <div className="contact-info-block" style={{ marginBottom: '36px' }}>
              <div className="contact-info-icon">🍵</div>
              <div>
                <div className="contact-info-label">Vibe</div>
                <div className="contact-info-value">100% Veg · Fresh Daily · Made With Love</div>
              </div>
            </div>

            <div>
              <a 
                href="https://maps.app.goo.gl/MmhBj8DRSeyFwsHGA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                📍 Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
