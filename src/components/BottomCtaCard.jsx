import React from 'react';
import { Lock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BottomCtaCard({ onOpenDownloadModal }) {
  return (
    <div className="elite-card bottom-cta-card">
      
      <div className="cta-centered-layout">
        
        <div className="pill-tag">
          <Sparkles size={12} className="inline mr-1" />
          READY FOR ANDROID 8.0+
        </div>

        <h2 className="cta-title">
          Start Automating Your Customer SMS Today
        </h2>

        <p className="cta-desc">
          Deposit funds into your secure wallet and start auto-replying with enterprise speed, customized industry rules, and 100% on-device data privacy.
        </p>

        {/* Feature Checkmarks Row */}
        <div className="cta-features-strip">
          <div className="cta-strip-item">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Zero Monthly Fees</span>
          </div>
          <div className="cta-strip-item">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>$0.00018 / Auto-Reply</span>
          </div>
          <div className="cta-strip-item">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>100% On-Device Privacy</span>
          </div>
        </div>

        {/* Action Button & Badges */}
        <div className="cta-btn-row-centered">
          <button 
            onClick={onOpenDownloadModal}
            className="btn-elite-blue btn-large-cta"
          >
            <Lock size={16} />
            <span>Unlock & Download APK</span>
          </button>

          <div className="cta-verified-badge">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Verified Android Build • 19.2 MB</span>
          </div>
        </div>

      </div>

    </div>
  );
}
