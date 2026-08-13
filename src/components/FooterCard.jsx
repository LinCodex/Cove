import React from 'react';
import { Zap, Shield, Terminal } from 'lucide-react';

export default function FooterCard({ onOpenDownloadModal }) {
  return (
    <div className="elite-card footer-card">
      <div className="footer-content">
        
        {/* Top Footer Row */}
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="elite-logo">
              <div className="elite-logo-icon">
                <Zap size={14} className="text-white fill-current" />
              </div>
              <span className="elite-logo-text">COVE.</span>
            </div>
            <p className="footer-tagline">
              Credit-based automated SMS response engine for Android. High speed, zero monthly recurring fees, and 100% on-device privacy.
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">Navigation</span>
            <div className="footer-links-list">
              <a href="#simulator" className="footer-link">Live Simulator</a>
              <a href="#wallet" className="footer-link">Credit Wallet</a>
              <a href="#usecases" className="footer-link">Industry Use Cases</a>
              <button onClick={onOpenDownloadModal} className="footer-link text-blue-400 font-semibold bg-transparent border-0 p-0 text-left cursor-pointer">
                Access APK
              </button>
            </div>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">Architecture</span>
            <div className="footer-links-list">
              <span className="footer-static-item">Android 8.0+ Oreo to 15+</span>
              <span className="footer-static-item">SQLite AES-256 Storage</span>
              <span className="footer-static-item">5-Tier Failover Slots</span>
              <span className="footer-static-item">WorkManager Background</span>
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
