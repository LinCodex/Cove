import React from 'react';
import { Download, Sliders, Power, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Download,
      title: "Install Cove APK",
      description: "Download the APK package (19.2 MB). Install on any Android device running Android 8.0+ and grant standard SMS receive permissions.",
      tag: "1-Minute Install"
    },
    {
      number: "02",
      icon: Sliders,
      title: "Set Business Rules",
      description: "Enter your business hours, keyword trigger templates, and after-hours response rules. Everything is stored locally on your device.",
      tag: "Customizable"
    },
    {
      number: "03",
      icon: Power,
      title: "Activate Autoresponder",
      description: "Toggle auto-reply to ON. Cove responds instantly to incoming SMS inquiries, logs recent activity, and filters spam seamlessly.",
      tag: "24/7 Automation"
    }
  ];

  const handleDownload = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.3 }
    });
  };

  return (
    <section id="how-it-works" className="py-20 bg-black relative border-t border-white/5">
      <div className="cove-container">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#70A8FF] uppercase tracking-wider mb-2 block">
            Simple Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-[#8E96A4] text-base mt-3">
            Get your automated SMS workflow running in three simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-[#0A0D15] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-3xl font-extrabold text-[#70A8FF]/40 font-mono">
                      {s.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#70A8FF]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5">
                    {s.title}
                  </h3>

                  <p className="text-sm text-[#8E96A4] leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  <span>{s.tag}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <a 
            href="/cove-app.apk" 
            download="cove-autoresponder-v1.0.apk"
            onClick={handleDownload}
            className="btn-blue-pill py-3.5 px-8 text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Download APK (v1.0)
          </a>
        </div>

      </div>
    </section>
  );
}
