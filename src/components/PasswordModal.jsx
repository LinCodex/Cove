import React, { useState } from 'react';
import { Lock, Key, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PasswordModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const expectedPassword = import.meta.env.VITE_DOWNLOAD_PASSWORD || 'cove2026';

  const handleVerifyAndDownload = (e) => {
    e.preventDefault();
    if (password.trim() === expectedPassword) {
      setError('');
      setSuccess(true);
      
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 }
      });

      setTimeout(() => {
        // Trigger APK download
        const link = document.createElement('a');
        link.href = '/cove-app.apk';
        link.download = 'cove-autoresponder-v1.0.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          onClose();
          setSuccess(false);
          setPassword('');
        }, 1200);
      }, 400);
    } else {
      setError('Invalid access password. Please check your credentials.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-icon-badge">
            <Lock size={20} className="text-blue-400" />
          </div>
          <h3 className="modal-title">Access APK Download</h3>
          <p className="modal-subtitle">
            This build is password-protected. Enter your authorized access key to download the APK.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerifyAndDownload} className="modal-form">
          <div className="input-wrapper">
            <Key size={16} className="input-icon" />
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter access password..."
              className="modal-input"
              autoFocus
            />
          </div>

          {error && (
            <div className="modal-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="modal-success">
              <CheckCircle size={14} />
              <span>Access granted! Downloading APK package...</span>
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="modal-btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!password.trim() || success}
              className="modal-btn-submit"
            >
              <Download size={16} />
              <span>{success ? 'Downloading...' : 'Unlock & Download'}</span>
            </button>
          </div>
        </form>

        <div className="modal-hint">
          <span>Configured via <code>VITE_DOWNLOAD_PASSWORD</code> in environment</span>
        </div>

      </div>
    </div>
  );
}
