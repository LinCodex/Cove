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
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-current">
                <path d="M50 32 C43 20 28 20 22 28 C16 36 20 48 32 50 C20 52 16 64 22 72 C28 80 43 80 50 68 C57 80 72 80 78 72 C84 64 80 52 68 50 C80 48 84 36 78 28 C72 20 57 20 50 32 Z" />
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
