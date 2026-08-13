import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqCard() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does the credit-based wallet work?",
      a: "Instead of paying high monthly subscription fees, you simply add funds to your wallet (e.g. $5, $20, or $50). Each auto-reply consumes tiny micro-fractions based on exact token usage (~$0.00018 / message). $10 easily covers over 50,000 automated customer replies."
    },
    {
      q: "Do my deposited wallet credits ever expire?",
      a: "No! Your wallet balance never expires and rolls over indefinitely. You only spend credits when incoming messages are received and automatically answered."
    },
    {
      q: "Are my customer text messages kept private on my phone?",
      a: "Yes, 100%. All incoming and outgoing SMS text history, contact briefings, and business rules remain strictly stored inside your phone's encrypted local SQLite database. No message logs are ever uploaded to third-party tracking servers."
    },
    {
      q: "What happens if a primary reply channel fails?",
      a: "Cove features multi-tier failover redundancy. If your primary response channel experiences network strain, Cove immediately falls back through your secondary backup slots within milliseconds."
    },
    {
      q: "Can I set quiet hours and emergency escalation keywords?",
      a: "Yes. You can customize business operating hours and configure distinct after-hours auto-replies. Urgent keywords (like 'EMERGENCY' or 'OUTAGE') can instantly trigger custom escalation messages or on-call alerts."
    },
    {
      q: "How do I install the APK package?",
      a: "Click 'Access APK' or 'Start free trial', enter your access key in the security modal, and download `cove-autoresponder-v1.0.apk`. Open the file on your Android device to install."
    }
  ];

  return (
    <div className="elite-card faq-full-card">
      
      <div className="faq-card-header">
        <span className="pill-tag">COMMON QUESTIONS</span>
        <h2 className="section-card-title">Frequently Asked Questions</h2>
        <p className="section-card-desc">
          Everything you need to know about Cove's credit wallet, response engine, and privacy architecture.
        </p>
      </div>

      <div className="faq-accordion-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="faq-item-card">
              <button 
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="faq-question-btn"
              >
                <span>{faq.q}</span>
                <ChevronDown size={16} className={`faq-chevron ${isOpen ? 'faq-chevron-rotated' : ''}`} />
              </button>

              {isOpen && (
                <div className="faq-answer-body">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
