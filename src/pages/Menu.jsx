import React, { useState } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import { menuData } from '../data/menuData';
import MenuCard from '../components/MenuCard';

export default function Menu() {
  const [activeTab, setActiveTab] = useState('drinks');
  useScrollReveal(activeTab);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <section id="menu" style={{ minHeight: '100vh', paddingTop: '140px' }}>
      <SEO title="Menu" path="/menu" />
      <div className="container">
        <div className="reveal">
          <p className="section-label">What We Serve</p>
          <h2 className="section-title">Our Full Menu</h2>
        </div>

        {/* Tab Buttons */}
        <div className="menu-tabs reveal">
          <button 
            className={`tab-btn ${activeTab === 'drinks' ? 'active' : ''}`} 
            onClick={() => handleTabChange('drinks')}
          >
            ☕ Drinks
          </button>
          <button 
            className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`} 
            onClick={() => handleTabChange('food')}
          >
            🍽️ Food
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pizza' ? 'active' : ''}`} 
            onClick={() => handleTabChange('pizza')}
          >
            🍕 Pizza & Bread
          </button>
        </div>

        {/* Dynamic Category Panels */}
        <div className="menu-grid">
          {menuData[activeTab].map((categoryObj, idx) => (
            <MenuCard 
              key={idx}
              category={categoryObj.category}
              icon={categoryObj.icon}
              items={categoryObj.items}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
