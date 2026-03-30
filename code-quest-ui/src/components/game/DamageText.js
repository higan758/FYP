import React, { useEffect, useState } from 'react';
import './battle.css';

export default function DamageText({ 
  damage = 0, 
  type = 'enemy',
  x = 50,
  y = 50,
  onComplete 
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible || damage <= 0) return null;

  return (
    <div 
      className={`damage-text ${type}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      -{damage}
    </div>
  );
}
