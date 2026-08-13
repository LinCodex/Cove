import React from 'react';
import { Clock, Sliders, ShieldCheck, Layers, Globe, Cpu } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Clock,
      title: "Business Hours & Quiet Mode",
      badge: "Schedule",
      description: "Define active working hours, after-hours custom greetings, and weekend quiet schedules with automated status transitions."
    },
    {
      icon: Sliders,
      title: "Keyword & Pattern Triggers",
      badge: "Smart Rules",
      description: "Match specific incoming customer inquiries (appointments, pricing, directions, store hours) and dispatch tailored replies in under 100ms."
    },
    {
      icon: ShieldCheck,
      title: "Spam & Rate-Limit Shield",
      badge: "Protection",
      description: "Automatic suppression of telemarketers, spam links, and rapid-fire messaging to protect your device resources."
    },
    {
      icon: Layers,
      title: "5-Tier Failover Slots",
      badge: "Redundancy",
      description: "Configure up to 5 multi-stage backup reply channels ensuring 99.99% message delivery reliability even under network strain."
    },
    {
      icon: Globe,
      title: "Multilingual Fallbacks",
      badge: "Localization",
      description: "Auto-detects customer language (English, Spanish, Chinese, French) and routes tailored localized responses seamlessly."
    },
    {
      icon: Cpu,
      title: "100% On-Device Processing",
      badge: "Native Android",
      description: "Runs as a native Android background service. Re-activates on system boot with zero external server dependencies."
    }
  ];

  return (
    <section id="features" className="py-20 bg-black relative">
      <div className="cove-container">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#70A8FF] uppercase tracking-wider mb-2 block">
            Engineered for Android
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Pure Reliability
          </h2>
          <p className="text-[#8E96A4] text-base mt-3">
            Every feature is designed to automate customer communication without latency, complexity, or privacy compromises.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-[#0A0D15] border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#70A8FF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/5 text-[#8E96A4] font-mono">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5">
                    {f.title}
                  </h3>

                  <p className="text-sm text-[#8E96A4] leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center text-xs font-semibold text-[#70A8FF]">
                  <span>Active native module</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
