import React from 'react';

export default function MenuCard({ category, icon, items }) {
  return (
    <div className="menu-category reveal">
      <div className="cat-header">
        <span className="cat-icon">{icon}</span>
        <span className="cat-name">{category}</span>
      </div>
      <div className="cat-body">
        {items.map((item, index) => (
          <div className="menu-item" key={index}>
            <div>
              <div className="item-name">{item.name}</div>
              {item.sub && <div className="item-sub">{item.sub}</div>}
            </div>
            <div className="item-price">{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
