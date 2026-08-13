import React from 'react';
import confetti from 'canvas-confetti';
import { Signal, Wifi, Battery, ChevronLeft, Share2 } from 'lucide-react';

export default function App() {
  const triggerDownload = (e) => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.3 }
    });
  };

  return (
    <div className="outer-canvas">
      
      {/* Main Dark App Card (Exact match to reference mockup framing) */}
      <div className="main-card">
        
        {/* Top Navbar */}
        <header className="navbar">
          
          {/* Logo (4-petal clover icon + brand name) */}
          <a href="#" className="brand-logo">
            <svg viewBox="0 0 100 100" width="28" height="28" fill="white">
              <path d="M50 32 C43 20 28 20 22 28 C16 36 20 48 32 50 C20 52 16 64 22 72 C28 80 43 80 50 68 C57 80 72 80 78 72 C84 64 80 52 68 50 C80 48 84 36 78 28 C72 20 57 20 50 32 Z" />
            </svg>
            <span className="brand-name">Cove</span>
          </a>

          {/* Right Navigation */}
          <div className="nav-right">
            <a href="#about" className="nav-link">Blog</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a 
              href="/cove-app.apk" 
              download="cove-autoresponder-v1.0.apk"
              onClick={triggerDownload}
              className="btn-get-app"
            >
              Get the App
            </a>
          </div>

        </header>

        {/* Hero Section */}
        <main className="hero-content">
          
          {/* Left Column */}
          <div className="hero-left">
            
            {/* Rating subtitle */}
            <div className="rating-row">
              <span>App Store <strong>★ 4.8</strong></span>
              <span>Google Play <strong>★ 4.8</strong></span>
            </div>

            {/* 3-line Headline */}
            <h1 className="hero-title">
              The Ultimate<br />
              SMS Autoresponder<br />
              <span className="highlight-blue">Tool</span>
            </h1>

            {/* Outlined Action Pill Button */}
            <div>
              <a 
                href="/cove-app.apk" 
                download="cove-autoresponder-v1.0.apk"
                onClick={triggerDownload}
                className="btn-hero-outline"
              >
                Get the App
              </a>
            </div>

          </div>

          {/* Right Column: Phone Mockup & 3D Decorations */}
          <div className="hero-right">
            
            {/* 3D Blue Bars (Top Right) */}
            <div className="deco-bars">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <defs>
                  <linearGradient id="barTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#99C5FF" />
                    <stop offset="100%" stopColor="#4D92FF" />
                  </linearGradient>
                  <linearGradient id="barFront" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1D61FF" />
                    <stop offset="100%" stopColor="#0B3CB8" />
                  </linearGradient>
                  <linearGradient id="barLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
                {/* Bar 1 */}
                <polygon points="20,70 34,60 34,85 20,95" fill="url(#barLeft)" />
                <polygon points="34,60 48,70 48,95 34,85" fill="url(#barFront)" />
                <polygon points="20,70 34,60 48,70 34,80" fill="url(#barTop)" />
                {/* Bar 2 */}
                <polygon points="38,50 52,40 52,70 38,80" fill="url(#barLeft)" />
                <polygon points="52,40 66,50 66,80 52,70" fill="url(#barFront)" />
                <polygon points="38,50 52,40 66,50 52,60" fill="url(#barTop)" />
                {/* Bar 3 */}
                <polygon points="56,30 70,20 70,55 56,65" fill="url(#barLeft)" />
                <polygon points="70,20 84,30 84,65 70,55" fill="url(#barFront)" />
                <polygon points="56,30 70,20 84,30 70,40" fill="url(#barTop)" />
              </svg>
            </div>

            {/* 3D Silver Metallic Trophy (Bottom Left) */}
            <div className="deco-trophy">
              <svg viewBox="0 0 120 120" width="100%" height="100%">
                <defs>
                  <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#CBD5E1" />
                    <stop offset="75%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>
                  <linearGradient id="blueBase" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1D61FF" />
                    <stop offset="100%" stopColor="#0E38A8" />
                  </linearGradient>
                </defs>
                {/* Handles */}
                <path d="M30 42 C18 42 16 64 34 68" fill="none" stroke="url(#silverGrad)" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M90 42 C102 42 104 64 86 68" fill="none" stroke="url(#silverGrad)" strokeWidth="5.5" strokeLinecap="round" />
                {/* Main Cup */}
                <path d="M32 32 L88 32 C88 56 76 72 60 76 C44 72 32 56 32 32 Z" fill="url(#silverGrad)" />
                {/* Stem */}
                <rect x="56" y="76" width="8" height="14" fill="url(#silverGrad)" rx="2" />
                {/* Blue Base */}
                <path d="M42 90 L78 90 L84 104 L36 104 Z" fill="url(#blueBase)" />
                <rect x="34" y="104" width="52" height="5" rx="2" fill="#0A1838" />
              </svg>
            </div>

            {/* Dark Smartphone Shell */}
            <div className="phone-mockup">
              
              {/* Status Bar */}
              <div className="phone-status">
                <span className="phone-time">9:41</span>
                <div className="phone-notch"></div>
                <div className="phone-icons">
                  <Signal size={11} />
                  <Wifi size={11} />
                  <Battery size={13} />
                </div>
              </div>

              {/* Navigation Header */}
              <div className="phone-nav">
                <ChevronLeft size={16} />
                <span className="phone-nav-title">pat</span>
                <Share2 size={13} />
              </div>

              {/* Profile Card */}
              <div className="phone-profile">
                <div className="profile-top">
                  <div>
                    <span className="profile-followers">25 followers • 30 following</span>
                    <h3 className="profile-name">Pat</h3>
                    <span className="profile-handle">@pat</span>
                  </div>
                  <div className="profile-avatar-box">
                    <div className="profile-avatar">P</div>
                    <span className="profile-edit">Edit</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="specialties-box">
                  <h4 className="specialties-title">Specialties</h4>
                  <p className="specialties-desc">You haven't selected any specialties yet!</p>
                </div>
              </div>

              {/* At a glance */}
              <div className="phone-glance">
                <h4 className="glance-title">At a glance</h4>
                <div className="glance-grid">
                  <div className="glance-card">
                    <span className="glance-label">Top league</span>
                    <span className="glance-badge badge-nba">NBA</span>
                    <span className="glance-value">56 bets</span>
                  </div>
                  <div className="glance-card">
                    <span className="glance-label">Top team</span>
                    <span className="glance-badge badge-dal">DAL</span>
                    <span className="glance-value">8 bets</span>
                  </div>
                  <div className="glance-card">
                    <span className="glance-label">Top player</span>
                    <span className="glance-badge badge-player">👤</span>
                    <span className="glance-value">8 bets</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="phone-categories">
                <div className="categories-header">
                  <span className="cat-label">Categories</span>
                  <span className="cat-rate">380.00%</span>
                </div>
                <div className="cat-row">
                  <div className="cat-left">
                    <div className="cat-icon">G</div>
                    <div>
                      <span className="cat-name">GOLF</span>
                      <span className="cat-sub">14 bets</span>
                    </div>
                  </div>
                  <span className="cat-status">Active</span>
                </div>
              </div>

            </div>

          </div>

        </main>

        {/* Bottom Curved Banner */}
        <footer className="bottom-banner">
          <p className="bottom-banner-text">
            We are <span className="highlight-blue">backed</span> by a team of dedicated developers who share our passion for seamless SMS automation.
          </p>
        </footer>

      </div>

    </div>
  );
}
