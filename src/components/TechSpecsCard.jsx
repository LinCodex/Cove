import React from 'react';
import { Zap, Battery, Layers, Lock, Cpu, Smartphone } from 'lucide-react';

export default function TechSpecsCard() {
  const specs = [
    {
      icon: Zap,
      title: "Average Latency",
      value: "< 95 ms",
      desc: "Instant background thread execution upon carrier broadcast"
    },
    {
      icon: Battery,
      title: "Battery Consumption",
      value: "< 0.2% / Day",
      desc: "Zero wake-lock battery drain, native WorkManager lifecycle"
    },
    {
      icon: Cpu,
      title: "Memory Footprint",
      value: "~18 MB RAM",
      desc: "Ultra-lean native runtime with background boot auto-start"
    },
    {
      icon: Layers,
      title: "Failover Channels",
      value: "5 Multi-Slots",
      desc: "Automatic backup failover sequence for 99.99% uptime"
    },
    {
      icon: Lock,
      title: "Local Encryption",
      value: "100% Local",
      desc: "Zero message telemetry or remote storage of customer logs"
    },
    {
      icon: Smartphone,
      title: "OS Compatibility",
      value: "Android 8.0+",
      desc: "Full support across Samsung, Google Pixel, OnePlus & Motorola"
    }
  ];

  return (
    <div className="elite-card specs-full-card">
      
      <div className="specs-card-header">
        <span className="pill-tag-purple">SYSTEM ARCHITECTURE</span>
        <h2 className="section-card-title">Engineered for Maximum Speed & Privacy</h2>
        <p className="section-card-desc">
          Built natively for Android with zero external dependencies, ultra-low resource usage, and military-grade on-device data isolation.
        </p>
      </div>

      <div className="specs-grid">
        {specs.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="spec-item-box">
              <div className="spec-icon-wrap">
                <Icon size={18} className="text-blue-400" />
              </div>
              <div className="spec-val-row">
                <span className="spec-value-text">{s.value}</span>
                <span className="spec-label-text">{s.title}</span>
              </div>
              <p className="spec-desc-text">{s.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
