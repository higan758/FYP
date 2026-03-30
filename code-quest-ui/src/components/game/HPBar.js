import React from 'react';
import './battle.css';

export default function HPBar({ 
  label = 'HP', 
  value = 100, 
  max = 100, 
  color = '#10b981',
  position = 'left'
}) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`hp-bar-wrapper ${position}`}>
      <div className="hp-bar-label">
        <span className="hp-label-text">{label}</span>
        <span className="hp-label-value">{Math.max(0, value)}/{max}</span>
      </div>
      <div className="hp-bar-container">
        <div 
          className="hp-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.5s ease-out'
          }}
        />
      </div>
    </div>
  );
}
