import React from 'react';
import { Check, X, Shield, Zap, Sparkles } from 'lucide-react';

export default function ComparisonCard() {
  const comparisonRows = [
    {
      feature: "Monthly Subscription Cost",
      cove: "$0 / month (Zero recurring fee)",
      traditional: "$49 - $199 / month flat",
      coveAdvantage: true
    },
    {
      feature: "Cost Per Auto-Reply",
      cove: "~$0.00018 per message (True token cost)",
      traditional: "$0.04 - $0.08 per message markup",
      coveAdvantage: true
    },
    {
      feature: "Credit Expiration",
      cove: "Never expire — rollover forever",
      traditional: "Use it or lose it every 30 days",
      coveAdvantage: true
    },
    {
      feature: "Privacy & Data Storage",
      cove: "100% On-Device Local SQLite",
      traditional: "Stored on remote vendor servers",
      coveAdvantage: true
    },
    {
      feature: "Redundant Failover Channels",
      cove: "Up to 5 Multi-Stage Failover Slots",
      traditional: "Single point of failure",
      coveAdvantage: true
    },
    {
      feature: "Custom Rules & Quiet Hours",
      cove: "Unlimited rules & after-hours logic",
      traditional: "Rigid keyword-only matches",
      coveAdvantage: true
    }
  ];

  return (
    <div className="elite-card comparison-full-card">
      
      <div className="comparison-header">
        <span className="pill-tag-orange">COST & PERFORMANCE BREAKDOWN</span>
        <h2 className="section-card-title">Why Businesses Choose Cove Over Subscriptions</h2>
        <p className="section-card-desc">
          Stop overpaying for bloated monthly SaaS platforms. Cove's direct credit wallet model gives you enterprise-grade automation with pure token efficiency.
        </p>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-feature">Capability</th>
              <th className="th-cove">
                <div className="cove-badge-header">
                  <Zap size={14} className="text-blue-400" />
                  <span>Cove Credit Engine</span>
                </div>
              </th>
              <th className="th-traditional">Traditional Platforms</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="tr-row">
                <td className="td-feature">{row.feature}</td>
                <td className="td-cove">
                  <div className="td-val-flex">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-white font-semibold">{row.cove}</span>
                  </div>
                </td>
                <td className="td-traditional">
                  <div className="td-val-flex">
                    <X size={14} className="text-rose-400 shrink-0" />
                    <span className="text-slate-400">{row.traditional}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
