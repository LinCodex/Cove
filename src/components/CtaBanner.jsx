import React from 'react';
import { Download, QrCode, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CtaBanner() {
  const handleDownload = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.3 }
    });
  };

  return (
    <section className="py-20 bg-black relative border-t border-white/5">
      <div className="cove-container">
        
        <div className="p-8 sm:p-14 rounded-3xl bg-[#0A0D15] border border-white/10 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
              
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block font-mono">
                ✓ Verified APK Ready (19.2 MB)
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Automate Your Android SMS Today
              </h2>

              <p className="text-[#8E96A4] text-base max-w-xl mx-auto lg:mx-0">
                Install Cove on your smartphone and start managing inbound text communication with custom schedules and instant auto-replies.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a 
                  href="/cove-app.apk" 
                  download="cove-autoresponder-v1.0.apk"
                  onClick={handleDownload}
                  className="btn-blue-pill py-3.5 px-8 text-base shadow-xl"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download APK
                </a>

                <div className="flex items-center gap-2 text-xs text-[#8E96A4] font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% On-Device • No Telemetry</span>
                </div>
              </div>

            </div>

            {/* Right QR Code Box for Mobile Scanning */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="p-5 rounded-2xl bg-[#0E111B] border border-white/10 text-center space-y-3 max-w-[220px]">
                <div className="p-3 bg-white rounded-xl mx-auto inline-block">
                  <svg viewBox="0 0 100 100" className="w-32 h-32">
                    <path d="M0,0 h100 v100 h-100 z" fill="white" />
                    <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" fill="#0A0D15" />
                    <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" fill="#0A0D15" />
                    <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" fill="#0A0D15" />
                    <path d="M40,10 h5 v10 h-5 z M50,15 h10 v5 h-10 z M45,25 h15 v5 h-15 z M10,40 h10 v5 h-10 z M25,40 h10 v10 h-10 z M40,40 h20 v5 h-20 z M65,40 h10 v5 h-10 z M80,40 h10 v15 h-10 z M10,50 h5 v10 h-5 z M20,55 h15 v5 h-15 z M45,50 h10 v15 h-10 z M60,50 h15 v5 h-15 z M70,60 h20 v5 h-20 z M40,70 h10 v20 h-10 z M55,70 h15 v5 h-15 z M75,70 h15 v15 h-15 z M55,80 h5 v10 h-5 z M70,90 h20 v5 h-20 z" fill="#1D61FF" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#70A8FF]" />
                    Scan with Phone
                  </span>
                  <p className="text-[10px] text-[#8E96A4] mt-0.5">Download directly to your Android device</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
