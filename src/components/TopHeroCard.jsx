import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import CoveLogo from './CoveLogo';

export default function TopHeroCard({ onOpenDownloadModal }) {
  return (
    <div className="elite-card hero-main-card">
      
      {/* Top Card Header */}
      <div className="card-top-nav">
        {/* Brand Logo */}
        <div className="elite-logo">
          <div className="elite-logo-icon">
            <CoveLogo variant="gradient" size={22} />
          </div>
          <span className="elite-logo-text">COVE.</span>
        </div>

        {/* Right Sign in / Access Button */}
        <button 
          onClick={onOpenDownloadModal}
          className="elite-signin-btn"
        >
          <Lock size={13} />
          <span>Access APK</span>
        </button>
      </div>

      {/* Hero Body Grid */}
      <div className="hero-grid-layout">
        
        {/* Left Text Content */}
        <div className="hero-text-col">
          
          <div className="pill-tag">
            <span>INTRODUCING COVE SMART AUTORESPONDER</span>
          </div>

          <h1 className="hero-big-title">
            Autoresponder for any business
          </h1>

          <p className="hero-desc">
            A fully integrated suite of credit-based auto-response products. Deposit funds and spend based on token usage.
          </p>

          <div className="hero-cta-row">
            <button 
              onClick={onOpenDownloadModal}
              className="btn-elite-blue"
            >
              Start free trial
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="scroll-indicator">
            <div className="mouse-pill">
              <div className="mouse-wheel"></div>
            </div>
            <span>Scroll down</span>
          </div>

        </div>

        {/* Right 3D Angled 3-Phone Cluster (Exact Match to Reference Image) */}
        <div className="hero-phones-cluster">
          
          {/* Ambient Glow Background */}
          <div className="phones-ambient-glow"></div>

          {/* Phone 1 (Left Angled Phone) */}
          <div className="phone-device phone-left">
            <div className="phone-screen">
              
              {/* Graphic Sphere & Wireframe Wave */}
              <div className="phone-wave-graphic">
                <div className="sphere-icon"></div>
                <svg viewBox="0 0 100 60" className="wave-svg">
                  <path d="M10,50 Q50,0 90,50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <path d="M15,45 Q50,5 85,45" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <path d="M20,40 Q50,10 80,40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <path d="M25,35 Q50,15 75,35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                </svg>
              </div>

              <div className="phone-left-content">
                <span className="text-tag-mini">More than a responder 💳</span>
                <h4 className="phone-left-title">
                  Make Replying Easier With Cove Wallet.
                </h4>
                <div className="dot-indicators">
                  <span className="dot active"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <button onClick={onOpenDownloadModal} className="phone-mini-btn">
                  Get Started
                </button>
              </div>

            </div>
          </div>

          {/* Phone 2 (Center Main Phone) */}
          <div className="phone-device phone-center">
            <div className="phone-screen">
              
              <div className="phone-header-row">
                <div className="icon-back-box">←</div>
                <div className="phone-notch-pill"></div>
                <div className="icon-more-box">⚙</div>
              </div>

              {/* Greeting & Balance */}
              <div className="phone-center-body">
                <span className="phone-greeting">Good morning 👋</span>
                <h3 className="phone-user-name">Maya Shiro</h3>

                {/* Credit Wallet Card */}
                <div className="wallet-card-preview">
                  <div className="wallet-card-top">
                    <span className="wallet-label">Wallet Balance</span>
                    <div className="card-chip-icon">
                      <div className="mastercard-circles">
                        <span className="circle-red"></span>
                        <span className="circle-yellow"></span>
                      </div>
                    </div>
                  </div>
                  <div className="wallet-amount">$5,621.44</div>
                  <div className="wallet-card-bottom">
                    <span className="wallet-card-no">•••• 4829</span>
                    <span className="wallet-tag-auto">Auto-Refill ON</span>
                  </div>
                </div>

                {/* Send Again Contacts */}
                <div className="send-again-section">
                  <span className="section-label-mini">Recent Channels</span>
                  <div className="contacts-row">
                    <div className="contact-col">
                      <div className="avatar-circle av-1">S</div>
                      <span className="contact-name">Stacey</span>
                    </div>
                    <div className="contact-col">
                      <div className="avatar-circle av-2">O</div>
                      <span className="contact-name">Oron</span>
                    </div>
                    <div className="contact-col">
                      <div className="avatar-circle av-3">Y</div>
                      <span className="contact-name">Yasmeen</span>
                    </div>
                    <div className="contact-col">
                      <div className="avatar-circle av-4">M</div>
                      <span className="contact-name">Morgan</span>
                    </div>
                  </div>
                </div>

                <button onClick={onOpenDownloadModal} className="btn-phone-continue">
                  <span>Continue</span>
                  <ChevronRight size={13} />
                </button>

              </div>

            </div>
          </div>

          {/* Phone 3 (Right Angled Phone) */}
          <div className="phone-device phone-right">
            <div className="phone-screen">
              
              <div className="phone-right-header">
                <div className="icon-back-box">←</div>
                <span className="date-badge">January 2024</span>
              </div>

              <div className="phone-right-body">
                <span className="spending-label">Total token spending</span>
                <div className="spending-amount">$3,784.88</div>

                {/* Mini Bar Chart */}
                <div className="spending-barchart">
                  <div className="bar b1" style={{ height: '40%' }}></div>
                  <div className="bar b2" style={{ height: '65%' }}></div>
                  <div className="bar b3" style={{ height: '30%' }}></div>
                  <div className="bar b4" style={{ height: '85%' }}></div>
                  <div className="bar b5" style={{ height: '55%' }}></div>
                  <div className="bar b6" style={{ height: '95%' }}></div>
                  <div className="bar b7" style={{ height: '70%' }}></div>
                </div>

                {/* Latest Activities */}
                <div className="latest-activities">
                  <span className="act-heading">Latest activities</span>
                  
                  <div className="act-item">
                    <div className="act-icon-box bg-figma">F</div>
                    <div className="act-details">
                      <span className="act-title">Figma API</span>
                      <span className="act-sub">Tokens • Yesterday</span>
                    </div>
                    <span className="act-price text-green">+$0.56</span>
                  </div>

                  <div className="act-item">
                    <div className="act-icon-box bg-sketch">💎</div>
                    <div className="act-details">
                      <span className="act-title">Credit Deposit</span>
                      <span className="act-sub">Paid • Jan 3, 2024</span>
                    </div>
                    <span className="act-price text-slate">-$99.00</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
