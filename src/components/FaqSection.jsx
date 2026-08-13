import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Is Cove free to download and use?",
      a: "Yes! Cove is 100% free to download as an APK package. There are no subscriptions or hidden fees to use the full on-device rule autoresponder."
    },
    {
      q: "Which Android versions are supported?",
      a: "Cove is compatible with Android 8.0 (Oreo) all the way up through Android 15+. It runs on Samsung, Google Pixel, Xiaomi, Motorola, OnePlus, and standard Android devices."
    },
    {
      q: "Does Cove store my SMS messages on external servers?",
      a: "No. All incoming and outgoing SMS text logs are processed entirely on-device and stored in your phone's secure local SQLite database."
    },
    {
      q: "Can I set quiet hours and custom schedules?",
      a: "Yes. You can specify operating business hours and configure distinct after-hours auto-replies so clients always receive immediate, courteous answers."
    },
    {
      q: "How does the spam shield protect my phone?",
      a: "Cove includes a built-in rate limiter that automatically detects rapid texting, marketing links, or repeat spam numbers and prevents unnecessary replies."
    },
    {
      q: "How do I install the APK file on my phone?",
      a: "Tap the 'Get the App' button to download `cove-autoresponder-v1.0.apk`. Open the downloaded file on your Android device and tap Install (grant 'Install unknown apps' permission if prompted)."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-black relative border-t border-white/5">
      <div className="cove-container max-w-3xl">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#70A8FF] uppercase tracking-wider mb-2 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#8E96A4] text-base mt-3">
            Everything you need to know about Cove SMS Autoresponder.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#0A0D15] border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-white hover:text-[#70A8FF] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#70A8FF] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#8E96A4] leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
