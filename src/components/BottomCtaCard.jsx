import React from 'react';
import { Lock, QrCode, ShieldCheck, Download, Sparkles } from 'lucide-react';

export default function BottomCtaCard({ onOpenDownloadModal }) {
  return (
    <div className="elite-card bottom-cta-card">
      
      <div className="cta-grid-layout">
        
        {/* Left Column */}
        <div className="cta-left-col">
          <div className="pill-tag">
            <Sparkles size={12} className="inline mr-1" />
            READY FOR ANDROID 8.0+
          </div>

          <h2 className="cta-title">
            Start Automating Your Customer SMS Today
          </h2>

          <p className="cta-desc">
            Deposit funds into your wallet and start auto-replying with enterprise speed, customized industry rules, and 100% on-device data privacy.
          </p>

          <div className="cta-btn-row">
            <button 
              onClick={onOpenDownloadModal}
              className="btn-elite-blue"
            >
              <Lock size={15} />
              <span>Unlock & Download APK</span>
            </button>

            <div className="cta-verified-badge">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verified Build • 19.2 MB</span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code */}
        <div className="cta-qr-col">
          <div className="qr-box-container">
            <div className="qr-white-frame">
              <svg viewBox="0 0 100 100" className="qr-svg-code">
                <path d="M0,0 h100 v100 h-100 z" fill="white" />
                <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" fill="#0B0E17" />
                <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" fill="#0B0E17" />
                <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" fill="#0B0E17" />
                <path d="M40,10 h5 v10 h-5 z M50,15 h10 v5 h-10 z M45,25 h15 v5 h-15 z M10,40 h10 v5 h-10 z M25,40 h10 v10 h-10 z M40,40 h20 v5 h-20 z M65,40 h10 v5 h-10 z M80,40 h10 v15 h-10 z M10,50 h5 v10 h-5 z M20,55 h15 v5 h-15 z M45,50 h10 v15 h-10 z M60,50 h15 v5 h-15 z M70,60 h20 v5 h-20 z M40,70 h10 v20 h-10 z M55,70 h15 v5 h-15 z M75,70 h15 v15 h-15 z M55,80 h5 v10 h-5 z M70,90 h20 v5 h-20 z" fill="#1D61FF" />
              </svg>
            </div>
            <div className="qr-label-box">
              <span className="qr-main-label">
                <QrCode size={13} className="text-blue-400 inline mr-1" />
                Scan to Install on Mobile
              </span>
              <span className="qr-sub-label">Direct download for Android</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
