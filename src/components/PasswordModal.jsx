import React, { useState } from 'react';
import CoveLogo from './CoveLogo';
import { Key, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
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
        const link = document.createElement('a');
        link.href = '/cove-app.apk';
        link.download = 'cove-autoresponder-v1.0.6.apk';
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
    <div className="clu-modal-backdrop" onClick={onClose}>
      <div className="clu-card clu-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="clu-modal-title">
        <button onClick={onClose} className="clu-modal-close" aria-label="Close">
          <X size={18} />
        </button>

        <div className="clu-modal-head">
          <div className="clu-modal-icon">
            <CoveLogo variant="gradient" size={28} />
          </div>
          <h3 id="clu-modal-title">Get the APK</h3>
          <p>The APK is currently for beta users only. Please enter the access password that was shared with you.</p>
        </div>

        <form onSubmit={handleVerifyAndDownload} className="clu-modal-form">
          <div className="clu-modal-field">
            <Key size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Access password"
              autoFocus
            />
          </div>

          {error && (
            <div className="clu-modal-note is-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="clu-modal-note is-ok">
              <CheckCircle size={14} />
              <span>Access granted. Downloading…</span>
            </div>
          )}

          <div className="clu-modal-actions">
            <button type="button" onClick={onClose} className="clu-btn-quiet">
              Cancel
            </button>
            <button type="submit" disabled={!password.trim() || success} className="clu-btn-dark">
              <Download size={16} />
              <span>{success ? 'Downloading…' : 'Download APK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
