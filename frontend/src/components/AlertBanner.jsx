import React, { useState, useEffect } from 'react';
import './AlertBanner.css';

const AlertBanner = ({ 
  message, 
  type = 'error', 
  onClose, 
  autoClose = true,
  autoCloseTime = 6000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeoutId;
    if (autoClose && visible) {
      timeoutId = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoClose, visible, onClose, autoCloseTime]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-content">
        {type === 'error' && <span className="alert-icon">⚠️</span>}
        {type === 'success' && <span className="alert-icon">✓</span>}
        {type === 'info' && <span className="alert-icon">ℹ️</span>}
        {type === 'warning' && <span className="alert-icon">⚠️</span>}
        <p className="alert-message">{message}</p>
      </div>
      <button className="alert-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default AlertBanner; 