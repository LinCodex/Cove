import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import InteractiveSimulatorCard from './InteractiveSimulatorCard';
import PasswordModal from './PasswordModal';
import '../landing.css';

const FAQS = [
  {
    q: 'How does the credit wallet work?',
    a: 'Add funds once — $5, $20, $50, or more. Each auto-reply spends a tiny token-based slice (~$0.00018). Credits never expire, and $10 comfortably covers tens of thousands of replies.'
  },
  {
    q: 'Where are customer messages stored?',
    a: 'On the phone. SMS history, contacts, and business rules stay in an on-device SQLite database. Customer logs are not uploaded to tracking servers.'
  },
  {
    q: 'What if the primary AI channel fails?',
    a: 'Cove fails over through up to five backup slots in milliseconds, so customers still get a reply if a provider is down or rate-limited.'
  },
  {
    q: 'Can I set quiet hours?',
    a: 'Yes. Restrict auto-reply to business hours, send a closed message after hours, and escalate urgent keywords to an on-call number.'
  },
  {
    q: 'Is there a monthly subscription?',
    a: 'No. Cove has zero recurring fees. You only spend wallet credit when a message is actually answered.'
  },
  {
    q: 'How do I install the APK?',
    a: 'Tap Get the app, enter your access key, and download cove-autoresponder-v1.0.apk. Open the file on Android 8.0+ to install.'
  }
];

function CoveMark({ dark }) {
  return (
    <span className={`clu-mark ${dark ? 'clu-mark-dark' : ''}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function LandingPage({ onOpenMasterControl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const openDownload = () => setIsModalOpen(true);

  return (
    <div className="clu-page">
      <header className="clu-nav">
        <a href="/" className="clu-brand">
          <CoveMark />
          Cove
        </a>
        <nav className="clu-nav-links">
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button type="button" className="clu-nav-cta" onClick={openDownload}>
          Get the app
        </button>
      </header>

      <section className="clu-hero">
        <svg className="clu-mountains" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden>
          <defs>
            <linearGradient id="cluSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="42%" stopColor="#7EB6FF" />
              <stop offset="72%" stopColor="#C5DEFF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="cluPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EEF6FF" />
              <stop offset="35%" stopColor="#6BA4F5" />
              <stop offset="100%" stopColor="#3E7EE8" />
            </linearGradient>
            <linearGradient id="cluPeak2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F7FBFF" />
              <stop offset="40%" stopColor="#8BB8F8" />
              <stop offset="100%" stopColor="#4F8AE8" />
            </linearGradient>
            <linearGradient id="cluFog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#cluSky)" />
          <path fill="url(#cluPeak2)" opacity="0.85" d="M-40 620 L180 340 L310 470 L470 250 L620 430 L790 210 L980 455 L1180 280 L1440 520 L1480 900 L-40 900 Z" />
          <path fill="url(#cluPeak)" d="M-20 700 L140 410 L260 560 L420 300 L560 490 L720 260 L900 500 L1080 330 L1280 540 L1460 380 L1520 900 L-20 900 Z" />
          <path fill="#2F6FD6" opacity="0.35" d="M-40 760 L220 520 L380 640 L540 470 L760 680 L980 500 L1200 670 L1460 540 L1480 900 L-40 900 Z" />
          <rect y="520" width="1440" height="380" fill="url(#cluFog)" />
        </svg>

        <div className="clu-hero-copy">
          <h1>
            #1 AI Autoresponder
            <br />
            for customer SMS
          </h1>
          <p>
            Cove reads every incoming text and replies in your voice — 24/7,
            on-device, and billed only when a message is actually sent.
          </p>
          <div className="clu-hero-actions">
            <button type="button" className="clu-btn-white" onClick={openDownload}>
              Get the app
            </button>
            <a href="#how" className="clu-btn-ghost">See how it works</a>
          </div>
        </div>

        <div className="clu-overlay" aria-hidden>
          <div className="clu-overlay-bar">
            <span>Cove</span>
            <span className="clu-overlay-hide">Hide</span>
          </div>
          <div className="clu-overlay-tabs">
            <span className="is-on">Assist</span>
            <span>Suggest reply</span>
            <span>Hours</span>
            <span>Recap</span>
          </div>
          <p className="clu-overlay-label">Incoming text</p>
          <p className="clu-overlay-in">Are you open today? Need a birthday cake for 4pm.</p>
          <p className="clu-overlay-label">Suggested reply</p>
          <p className="clu-overlay-out">
            Yes — we’re open until 6. A birthday cake for 4pm works if we start now. Vanilla or chocolate, and any writing on top?
          </p>
          <div className="clu-overlay-input">
            Ask about this conversation…
            <span>↵</span>
          </div>
        </div>
      </section>

      <section className="clu-section" id="how">
        <h2 className="clu-h2">How Cove helps when a text arrives</h2>

        <div className="clu-split">
          <div>
            <h3 className="clu-h3">Cove listens to the conversation</h3>
            <p className="clu-lead">
              It picks up the customer’s question in real time, matches it against your store hours, products, and rules, then drafts a reply in your tone.
            </p>
          </div>
          <div className="clu-panel">
            <div className="clu-bubble clu-bubble-in">Do you have vegan sourdough today?</div>
            <div className="clu-meta">Customer · just now</div>
            <div className="clu-chip">Context: bakery FAQ · hours · diet filters</div>
          </div>
        </div>

        <div className="clu-split clu-split-flip">
          <div>
            <h3 className="clu-h3">When they need an answer, Cove sends it instantly</h3>
            <p className="clu-lead">
              Replies go out over the same Android SMS stack you already use. If a model is down, backup channels take over automatically.
            </p>
          </div>
          <div className="clu-panel">
            <div className="clu-bubble clu-bubble-out">
              Yes — vegan sourdough is baked this morning and on the shelf until we sell out. We close at 6.
            </div>
            <div className="clu-meta">Cove · 1.2s · $0.00018</div>
          </div>
        </div>
      </section>

      <section className="clu-section clu-muted" id="privacy">
        <h2 className="clu-h2">Private in every way</h2>
        <p className="clu-sub">A suite of controls so customer texts never have to leave the phone.</p>
        <div className="clu-feature-grid">
          <article>
            <h3>Stays on-device</h3>
            <p>Conversation history lives in local SQLite on the Android handset assigned to that store.</p>
          </article>
          <article>
            <h3>No extra numbers</h3>
            <p>Cove is not a hosted inbox. It replies from the same SIM customers already text.</p>
          </article>
          <article>
            <h3>Quiet hours</h3>
            <p>Pause auto-replies after close, send an after-hours note, and escalate emergencies only.</p>
          </article>
        </div>
      </section>

      <section className="clu-section">
        <h2 className="clu-h2">Built for the moment, not the invoice</h2>
        <div className="clu-stats">
          <div>
            <strong>&lt; 95ms</strong>
            <span>Time from incoming SMS to the reply engine waking up.</span>
          </div>
          <div>
            <strong>$0.00018</strong>
            <span>Typical cost per auto-reply. Credits never expire.</span>
          </div>
          <div>
            <strong>5 backups</strong>
            <span>Failover slots so one provider outage does not stall the store.</span>
          </div>
        </div>
      </section>

      <section className="clu-section clu-muted" id="simulator">
        <h2 className="clu-h2">Try a live reply</h2>
        <p className="clu-sub">Same credit wallet, same token math — tap a sample text or type your own.</p>
        <div className="clu-sim-frame">
          <InteractiveSimulatorCard />
        </div>
      </section>

      <section className="clu-section" id="faq">
        <h2 className="clu-h2">Frequently asked questions</h2>
        <div className="clu-faq">
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div key={item.q} className={`clu-faq-item ${open ? 'is-open' : ''}`}>
                <button type="button" onClick={() => setOpenFaq(open ? -1 : idx)}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>
                {open && <p>{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="clu-endcta">
        <h2>SMS AI that replies during the shift, not after.</h2>
        <p>Install Cove on the store phone and let the next customer text answer itself.</p>
        <button type="button" className="clu-btn-white" onClick={openDownload}>
          Get the app
        </button>
      </section>

      <footer className="clu-footer">
        <div className="clu-footer-grid">
          <div>
            <div className="clu-brand clu-brand-foot">
              <CoveMark dark />
              Cove
            </div>
            <p>Credit-based SMS autoresponder for Android. No monthly fee. On-device privacy.</p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#how">How it works</a>
            <a href="#simulator">Live demo</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Download</h4>
            <button type="button" className="clu-footer-btn" onClick={openDownload}>Get the APK</button>
            <span>Android 8.0+ · 19.2 MB</span>
            <span>SQLite AES-256 storage</span>
          </div>
          <div>
            <h4>Admin</h4>
            <a
              href="/mastercontrol"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenMasterControl) onOpenMasterControl();
                else {
                  window.history.pushState({}, '', '/mastercontrol');
                  window.dispatchEvent(new Event('popstate'));
                }
              }}
            >
              Cove Control
            </a>
          </div>
        </div>
        <div className="clu-footer-base">
          <span>© {new Date().getFullYear()} Cove Autoresponder. All rights reserved.</span>
        </div>
      </footer>

      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
