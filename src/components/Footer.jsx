import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 text-[#8E96A4] text-xs">
      <div className="cove-container">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 96 72" className="w-6 h-5 text-white fill-current">
                <g fill="currentColor">
                  <path fillRule="evenodd" d="M20 10H48A14 14 0 0 1 62 24v14A14 14 0 0 1 48 52H24L10 66l6-14h4A14 14 0 0 1 6 38V24A14 14 0 0 1 20 10ZM22 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM34 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM46 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0Z" />
                  <rect x="68" y="22" width="18" height="6" rx="3" />
                  <rect x="68" y="33" width="24" height="6" rx="3" />
                  <rect x="68" y="44" width="18" height="6" rx="3" />
                </g>
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight">Cove</span>
            <span className="text-[10px] text-[#8E96A4] ml-2">Android SMS Autoresponder</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#simulator" className="hover:text-white transition-colors">Demo</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Setup</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="/cove-app.apk" download className="text-[#70A8FF] hover:underline font-semibold">Download APK</a>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Cove Autoresponder. Built for Android.</p>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% On-Device • No Remote Logging</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
