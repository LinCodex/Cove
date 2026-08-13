import React from 'react';
import { Zap, Battery, Layers, Lock } from 'lucide-react';

export default function AppStats() {
  const stats = [
    {
      label: "Response Latency",
      value: "< 100 ms",
      detail: "Instant background execution upon SMS broadcast receive",
      icon: Zap
    },
    {
      label: "Memory Footprint",
      value: "~18 MB RAM",
      detail: "Ultra-lean Android WorkManager service with zero battery impact",
      icon: Battery
    },
    {
      label: "Failover Channels",
      value: "5 Multi-Slots",
      detail: "Automatic fallback sequence for maximum uptime reliability",
      icon: Layers
    },
    {
      label: "Privacy & Storage",
      value: "100% Local",
      detail: "All message logs and rules remain strictly on your Android device",
      icon: Lock
    }
  ];

  return (
    <section id="specs" className="py-16 bg-[#06080E] relative border-t border-white/5">
      <div className="cove-container">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0D15] border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="space-y-2 border-b sm:border-b-0 sm:border-r border-white/10 pb-6 sm:pb-0 last:border-0 pr-0 sm:pr-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-[#70A8FF]" />
                    <span className="text-xs font-bold text-[#8E96A4] uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {s.value}
                  </div>
                  <p className="text-xs text-[#8E96A4] leading-normal pt-1">
                    {s.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
