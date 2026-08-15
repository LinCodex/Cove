import React from 'react';
import { Shield, Terminal, Lock, Download } from 'lucide-react';
import CoveLogo from './CoveLogo';

export default function FooterCard({ onOpenDownloadModal }) {
  return (
    <div className="elite-card footer-card">
      <div className="footer-content">
        
        {/* Top Footer Row */}
        <div className="footer-top-row">
          
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="elite-logo">
              <div className="elite-logo-icon">
                <CoveLogo variant="gradient" size={22} />
              </div>
              <span className="elite-logo-text">COVE.</span>
            </div>
            <p className="footer-tagline">
              Credit-based automated SMS response engine for Android. High speed, zero monthly recurring fees, and 100% on-device data privacy.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-links-col">
            <span className="footer-col-title">Navigation</span>
            <div className="footer-links-list">
              <a href="#simulator" className="footer-link">Live Simulator</a>
              <a href="#wallet" className="footer-link">Credit Wallet</a>
              <a href="#usecases" className="footer-link">Industry Use Cases</a>
              <a href="#faq" className="footer-link">FAQ</a>
              <a 
                href="/mastercontrol" 
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/mastercontrol');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="footer-link" 
                style={{ color: '#38bdf8', fontWeight: '600' }}
              >
                ⚡ Master Control Panel
              </a>
            </div>
          </div>

          {/* Actions & APK Download */}
          <div className="footer-links-col">
            <span className="footer-col-title">Download & Specs</span>
            <div className="footer-links-list">
              <button 
                onClick={onOpenDownloadModal}
                className="footer-apk-btn"
              >
                <Lock size={12} className="text-blue-400" />
                <span>Access APK Download</span>
              </button>
              <span className="footer-static-item">Android 8.0+ (19.2 MB)</span>
              <span className="footer-static-item">SQLite AES-256 Storage</span>
              <span className="footer-static-item">5-Tier Failover Slots</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="footer-bottom-row">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Cove Autoresponder. All rights reserved.
          </p>

          <div className="footer-badges">
            <span className="badge-item">
              <Shield size={12} className="text-emerald-400 inline mr-1" />
              100% On-Device Data Isolation
            </span>
            <span className="badge-sep">•</span>
            <span className="badge-item">
              <Terminal size={12} className="text-blue-400 inline mr-1" />
              Direct Carrier Broadcast Receiver
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
