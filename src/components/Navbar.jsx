import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav>
      <NavLink className="nav-logo" to="/" onClick={closeMenu}>
        <img src={logoImg} alt="Teacrack Cafe Logo" loading="lazy" decoding="async" />
        <span className="nav-logo-text">Teacrack</span>
      </NavLink>

      <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
        {isOpen ? '✕' : '☰'}
      </button>

      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li>
          <NavLink to="/" onClick={closeMenu} end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/menu" onClick={closeMenu}>
            Menu
          </NavLink>
        </li>
        <li>
          <NavLink to="/gallery" onClick={closeMenu}>
            Gallery
          </NavLink>
        </li>
        <li>
          <NavLink to="/reviews" onClick={closeMenu}>
            Reviews
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
