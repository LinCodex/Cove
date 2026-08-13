import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export default function TopStatsCard() {
  return (
    <div className="elite-card stats-main-card">
      
      {/* Top Header */}
      <div className="stats-card-top">
        <div className="stats-metric-box">
          <span className="stats-giant-number">64m</span>
          <span className="stats-metric-sub">Messages Handled</span>
        </div>

        {/* User Profile Avatar with Online Badge */}
        <div className="stats-user-avatar">
          <div className="avatar-img-circle">
            <span className="avatar-letter">E</span>
          </div>
          <div className="avatar-online-dot"></div>
        </div>
      </div>

      {/* Center Neon Glowing Curve Chart (Exact match to reference graph) */}
      <div className="stats-chart-container">
        <svg viewBox="0 0 320 140" className="chart-svg-neon">
          <defs>
            <linearGradient id="neonBlueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="neonFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.25)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
            </linearGradient>
          </defs>

          {/* Grid background lines */}
          <line x1="0" y1="40" x2="320" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Area Fill */}
          <path 
            d="M 10 110 Q 50 120, 90 90 T 170 85 T 250 50 T 310 65 L 310 140 L 10 140 Z" 
            fill="url(#neonFill)" 
          />

          {/* Main glowing line */}
          <path 
            d="M 10 110 Q 50 120, 90 90 T 170 85 T 250 50 T 310 65" 
            fill="none" 
            stroke="url(#neonBlueGlow)" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* Secondary dashed trajectory line */}
          <path 
            d="M 10 95 Q 60 90, 110 75 T 200 65 T 280 40 T 310 35" 
            fill="none" 
            stroke="rgba(148, 163, 184, 0.4)" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            strokeLinecap="round" 
          />

          {/* Peak point indicator */}
          <circle cx="250" cy="50" r="4" fill="#60A5FA" />
          <circle cx="250" cy="50" r="8" fill="none" stroke="#60A5FA" strokeWidth="1.5" className="animate-ping" />
        </svg>
      </div>

      {/* Bottom Metrics Breakdown (Matching reference 2-column footer) */}
      <div className="stats-card-footer">
        <div className="stat-footer-col">
          <span className="stat-footer-label">Wallet Savings</span>
          <span className="stat-footer-val">$287,562</span>
        </div>

        <div className="stat-footer-col">
          <span className="stat-footer-label">Active Threads</span>
          <span className="stat-footer-val">12,565</span>
        </div>

        <div className="stat-footer-col">
          <span className="stat-footer-label">Cost per SMS</span>
          <span className="stat-footer-val text-emerald-400">$0.0002</span>
        </div>
      </div>

    </div>
  );
}
