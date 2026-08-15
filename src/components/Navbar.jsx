import React, { useState, useEffect } from 'react';
import { Download, Menu, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownload = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.2 }
    });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3.5' : 'bg-transparent py-5 md:py-6'
    }`}>
      <div className="cove-container flex items-center justify-between">
        
        {/* Brand Logo (Matching reference 4-petal clover emblem) */}
        <a href="#" className="flex items-center gap-2.5 text-decoration-none group">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 96 72" className="w-8 h-6 text-white fill-current group-hover:scale-105 transition-transform">
              <g fill="currentColor">
                <path fillRule="evenodd" d="M20 10H48A14 14 0 0 1 62 24v14A14 14 0 0 1 48 52H24L10 66l6-14h4A14 14 0 0 1 6 38V24A14 14 0 0 1 20 10ZM22 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM34 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM46 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0Z" />
                <rect x="68" y="22" width="18" height="6" rx="3" />
                <rect x="68" y="33" width="24" height="6" rx="3" />
                <rect x="68" y="44" width="18" height="6" rx="3" />
              </g>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">Cove</span>
        </a>

        {/* Desktop Links (Matching reference minimalist navbar) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8E96A4]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#simulator" className="hover:text-white transition-colors">Demo</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Setup</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* CTA Button (Matching reference "Get the App" blue pill) */}
        <div className="hidden md:flex items-center gap-3">
          <a 
            href="/cove-app.apk" 
            download="cove-autoresponder-v1.0.apk"
            onClick={handleDownload}
            className="btn-blue-pill"
          >
            Get the App
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <a 
            href="/cove-app.apk" 
            download="cove-autoresponder-v1.0.apk"
            onClick={handleDownload}
            className="btn-blue-pill px-3.5 py-1.5 text-xs"
          >
            Get APK
          </a>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0D14] border-b border-white/10 px-6 py-5 space-y-4 text-sm font-medium">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            Features
          </a>
          <a 
            href="#simulator" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            Interactive Demo
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            Installation Guide
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1"
          >
            FAQ
          </a>
          <div className="pt-2">
            <a 
              href="/cove-app.apk" 
              download="cove-autoresponder-v1.0.apk"
              onClick={() => { handleDownload(); setMobileMenuOpen(false); }}
              className="btn-blue-pill w-full justify-center py-3 text-sm"
            >
              <Download className="w-4 h-4" />
              Download Cove APK (19.2 MB)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
