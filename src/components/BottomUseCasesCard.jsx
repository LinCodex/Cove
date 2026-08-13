import React, { useState } from 'react';
import { Store, Briefcase, Home, ShieldAlert, Check } from 'lucide-react';

export default function BottomUseCasesCard({ onOpenDownloadModal }) {
  const [activeTab, setActiveTab] = useState('retail');

  const useCases = {
    retail: {
      icon: Store,
      title: "Retail & Local Commerce",
      badge: "High Inbound Volume",
      description: "Auto-reply to frequent customer questions like store hours, item availability, and delivery updates without lifting a finger.",
      triggers: ["Store Hours & Directions", "Stock & Menu Queries", "Curbside Pickup Confirmations"]
    },
    services: {
      icon: Briefcase,
      title: "Consultants & Appointments",
      badge: "Zero Missed Leads",
      description: "Send calendar links, answer service pricing questions, and gather preliminary client details automatically during client intake.",
      triggers: ["Calendar Scheduling Links", "Service Intake Questionnaire", "Emergency Escalation"]
    },
    realestate: {
      icon: Home,
      title: "Real Estate & Agencies",
      badge: "Instant Property Response",
      description: "Instantly reply to property inquiries, send tour booking times, and capture high-intent buyer information 24/7.",
      triggers: ["Property Walkthrough Booking", "Listing Details & PDFs", "Broker Call-Back Requests"]
    },
    emergency: {
      icon: ShieldAlert,
      title: "After-Hours & On-Call",
      badge: "Quiet Hours Guard",
      description: "Configure custom nighttime quiet hours while automatically escalating urgent client keywords to on-call phone lines.",
      triggers: ["Keyword Escalation Filter", "Custom Night Mode Messages", "Spam & Telemarketer Block"]
    }
  };

  const current = useCases[activeTab];
  const CurrentIcon = current.icon;

  return (
    <div className="elite-card bottom-card-usecases">
      
      <div className="usecases-top-header">
        <span className="pill-tag-purple">WHY COVE?</span>
        <h2 className="bottom-card-title">
          Auto-reply anytime, anywhere.
        </h2>
        <p className="bottom-card-desc">
          Deploy customizable rule engines tailored for your exact industry and business communication requirements.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="usecases-tabs-row">
        {Object.keys(useCases).map((key) => {
          const u = useCases[key];
          const Icon = u.icon;
          const isSelected = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`usecase-tab-btn ${isSelected ? 'usecase-tab-active' : ''}`}
            >
              <Icon size={14} />
              <span>{u.title.split('&')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="usecase-detail-panel">
        <div className="usecase-panel-header">
          <div className="usecase-icon-box">
            <CurrentIcon size={18} className="text-blue-400" />
          </div>
          <div>
            <h4 className="usecase-item-title">{current.title}</h4>
            <span className="usecase-item-badge">{current.badge}</span>
          </div>
        </div>

        <p className="usecase-item-desc">{current.description}</p>

        <div className="usecase-triggers-list">
          <span className="triggers-label">Pre-configured Triggers:</span>
          <div className="triggers-grid">
            {current.triggers.map((t, idx) => (
              <div key={idx} className="trigger-item">
                <Check size={12} className="text-emerald-400" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="usecase-footer-action">
          <button onClick={onOpenDownloadModal} className="btn-usecase-cta">
            <span>Download & Setup Workflow</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </div>

    </div>
  );
}
