import React, { useEffect, useState } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import insideImg from '../assets/inside.jpg';
import collageImg from '../assets/interior_collage.jpg';
import posterImg from '../assets/menu_poster.jpg';

export default function Gallery() {
  useScrollReveal();
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    {
      img: collageImg,
      title: "Lively Ambience",
      desc: "Our cozy seating area where friends gather and conversations spark over fresh brews."
    },
    {
      img: insideImg,
      title: "Step Inside",
      desc: "Aesthetic warm lighting and comfortable seating designed to make you feel at home."
    },
    {
      img: posterImg,
      title: "TeaCrack Specials & Info",
      desc: "Our menu highlights, delivery policies, and direct contact details at a glance."
    }
  ];

  useEffect(() => {
    if (!selectedImage) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedImage]);

  return (
    <section id="gallery" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <SEO title="Gallery" path="/gallery" />
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-label">Moments</p>
          <h2 className="section-title">TeaCrack Gallery</h2>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#666', fontSize: '1.1rem', marginTop: '-24px' }}>
            A glimpse into our warm seats, fine cups, and happy faces.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          {galleryItems.map((item, idx) => (
            <div className="reveal" key={idx} style={{
              background: 'var(--white)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-premium)',
              transition: 'var(--transition-smooth)'
            }}>
              <div
                className="gallery-image-card"
                style={{ height: '360px', overflow: 'hidden', cursor: 'zoom-in' }}
                onClick={() => setSelectedImage(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedImage(item);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open ${item.title} in full view`}
              >
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="gallery-thumb-image"
                  loading="lazy"
                  decoding="async"
                  style={{
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = ''}
                />
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: 'var(--teal)', marginBottom: '8px', fontWeight: '900' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="gallery-modal-backdrop" onClick={() => setSelectedImage(null)}>
            <div className="gallery-modal" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="gallery-modal-close"
                onClick={() => setSelectedImage(null)}
                aria-label="Close gallery image"
              >
                ×
              </button>
              <img
                src={selectedImage.img}
                alt={selectedImage.title}
                className="gallery-modal-image"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
