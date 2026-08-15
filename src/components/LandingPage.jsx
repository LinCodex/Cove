import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import InteractiveSimulatorCard from './InteractiveSimulatorCard';
import PasswordModal from './PasswordModal';
import CoveLogo from './CoveLogo';
import '../landing.css';

const FAQS = [
  {
    q: 'How does the wallet work?',
    a: 'Recharge by Zelle, Venmo, or cash. We credit your store wallet by hand — there is no self-serve checkout. Each auto-reply is billed at $0.005, with a lower rate the more you recharge. Credits never expire.'
  },
  {
    q: 'What is the message rate?',
    a: 'The standard flat rate is $0.005 per auto-reply. Larger recharges unlock a discounted per-message rate. You only spend wallet credit when a customer text is actually answered.'
  },
  {
    q: 'How do I add funds?',
    a: 'Send a manual recharge by Zelle, Venmo, or cash. Once we confirm payment, the balance is added to your store wallet in Cove.'
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
  }
];

const TIERS = [
  { amount: '$20', rate: '$0.005', note: 'Standard rate', tag: 'Start' },
  { amount: '$50', rate: 'Lower / msg', note: 'Volume discount', tag: 'Popular' },
  { amount: '$100', rate: 'Lower still', note: 'Larger recharge', tag: 'Save' },
  { amount: '$250+', rate: 'Best rate', note: 'Highest discount', tag: 'Best' }
];

const PAYMENTS = [
  { name: 'Zelle', hint: 'Instant bank' },
  { name: 'Venmo', hint: 'Peer pay' },
  { name: 'Cash', hint: 'In person' }
];

function CoveMark({ dark }) {
  return (
    <span className={`clu-mark ${dark ? 'clu-mark-dark' : ''}`}>
      <CoveLogo variant={dark ? 'gradient' : 'current'} size={32} />
    </span>
  );
}

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const nodes = document.querySelectorAll('.clu-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="clu-page">
      <header className="clu-nav">
        <a href="/" className="clu-brand">
          <CoveMark />
          Cove
        </a>
        <nav className="clu-nav-links">
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#privacy">Privacy</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button type="button" className="clu-nav-ghost" onClick={() => setIsModalOpen(true)}>
          Get the APK
        </button>
      </header>

      <section className="clu-hero">
        <svg className="clu-hero-bg" viewBox="0 0 820 900" preserveAspectRatio="xMinYMid slice" aria-hidden>
          <g className="clu-signal-drift" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2">
            <circle cx="300" cy="430" r="70" />
            <circle cx="300" cy="430" r="140" />
            <circle cx="300" cy="430" r="220" />
            <circle cx="300" cy="430" r="310" />
          </g>
          <circle cx="300" cy="430" r="18" fill="rgba(255,255,255,0.9)" />
          <circle cx="300" cy="430" r="8" fill="#1D4ED8" />
        </svg>

        <div className="clu-hero-copy">
          <h1>
            #1 AI Autoresponder
            <br />
            for customer SMS
          </h1>
          <p>
            Cove reads every incoming text and replies in your voice — 24/7,
            on-device, billed at $0.005 per message. Larger recharges unlock a better rate.
          </p>
          <div className="clu-hero-actions">
            <a href="#how" className="clu-btn-white">See how it works</a>
            <a href="#pricing" className="clu-btn-ghost">View pricing</a>
          </div>
        </div>

        <div className="clu-overlay clu-float" aria-hidden>
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
        <h2 className="clu-h2 clu-reveal">How Cove helps when a text arrives</h2>

        <div className="clu-split clu-reveal">
          <div>
            <h3 className="clu-h3">Cove listens to the conversation</h3>
            <p className="clu-lead">
              It picks up the customer’s question in real time, matches it against your store hours, products, and rules, then drafts a reply in your tone.
            </p>
          </div>
          <div className="clu-card clu-card-dark">
            <div className="clu-bubble clu-bubble-in">Do you have vegan sourdough today?</div>
            <div className="clu-meta">Customer · just now</div>
            <div className="clu-chip">Context: bakery FAQ · hours · diet filters</div>
          </div>
        </div>

        <div className="clu-split clu-split-flip clu-reveal">
          <div>
            <h3 className="clu-h3">When they need an answer, Cove sends it instantly</h3>
            <p className="clu-lead">
              Replies go out over the same Android SMS stack you already use. If a model is down, backup channels take over automatically. Each sent reply is $0.005 at the standard rate.
            </p>
          </div>
          <div className="clu-card clu-card-dark">
            <div className="clu-bubble clu-bubble-out">
              Yes — vegan sourdough is baked this morning and on the shelf until we sell out. We close at 6.
            </div>
            <div className="clu-meta">Cove · 1.2s · $0.005</div>
          </div>
        </div>
      </section>

      <section className="clu-band" id="pricing">
        <div className="clu-band-inner">
          <h2 className="clu-h2 clu-reveal">Simple flat rate. Better as you recharge.</h2>
          <p className="clu-sub clu-reveal">
            Standard pricing is $0.005 per auto-reply. Recharges are manual — Zelle, Venmo, or cash — and larger wallets unlock a discounted per-message rate.
          </p>

          <div className="clu-tier-grid">
            {TIERS.map((tier, i) => (
              <article
                key={tier.amount}
                className={`clu-card clu-tier clu-reveal ${i === 1 ? 'is-featured' : ''}`}
                style={{ '--d': `${i * 80}ms` }}
              >
                <span className="clu-tier-tag">{tier.tag}</span>
                <strong>{tier.amount}</strong>
                <em>{tier.rate}</em>
                <p>{tier.note}</p>
              </article>
            ))}
          </div>

          <div className="clu-pay clu-reveal">
            <h3 className="clu-h3">Manual recharges only</h3>
            <p className="clu-lead">
              There is no in-app checkout. Send payment with one of these, and we credit the store wallet after confirmation.
            </p>
            <div className="clu-pay-grid">
              {PAYMENTS.map((p) => (
                <div key={p.name} className="clu-card clu-pay-card">
                  <span>{p.name}</span>
                  <small>{p.hint}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="clu-section" id="privacy">
        <h2 className="clu-h2 clu-reveal">Private in every way</h2>
        <p className="clu-sub clu-reveal">A suite of controls so customer texts never have to leave the phone.</p>
        <div className="clu-feature-grid">
          <article className="clu-card clu-reveal" style={{ '--d': '0ms' }}>
            <h3>Stays on-device</h3>
            <p>Conversation history lives in local SQLite on the Android handset assigned to that store.</p>
          </article>
          <article className="clu-card clu-reveal" style={{ '--d': '90ms' }}>
            <h3>No extra numbers</h3>
            <p>Cove is not a hosted inbox. It replies from the same SIM customers already text.</p>
          </article>
          <article className="clu-card clu-reveal" style={{ '--d': '180ms' }}>
            <h3>Quiet hours</h3>
            <p>Pause auto-replies after close, send an after-hours note, and escalate emergencies only.</p>
          </article>
        </div>
      </section>

      <section className="clu-band">
        <div className="clu-band-inner">
          <h2 className="clu-h2 clu-reveal">Built for the moment, not the invoice</h2>
          <div className="clu-stats">
            <div className="clu-card clu-reveal" style={{ '--d': '0ms' }}>
              <strong>&lt; 95ms</strong>
              <span>Time from incoming SMS to the reply engine waking up.</span>
            </div>
            <div className="clu-card clu-reveal" style={{ '--d': '90ms' }}>
              <strong>$0.005</strong>
              <span>Flat rate per auto-reply, with discounts on larger recharges.</span>
            </div>
            <div className="clu-card clu-reveal" style={{ '--d': '180ms' }}>
              <strong>5 backups</strong>
              <span>Failover slots so one provider outage does not stall the store.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="clu-section" id="simulator">
        <h2 className="clu-h2 clu-reveal">Try a live reply</h2>
        <p className="clu-sub clu-reveal">Same $0.005 wallet math — tap a sample text or type your own.</p>
        <div className="clu-reveal">
          <InteractiveSimulatorCard />
        </div>
      </section>

      <section className="clu-section" id="faq">
        <h2 className="clu-h2 clu-reveal">Frequently asked questions</h2>
        <div className="clu-faq clu-reveal">
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div key={item.q} className={`clu-faq-item ${open ? 'is-open' : ''}`}>
                <button type="button" onClick={() => setOpenFaq(open ? -1 : idx)}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>
                <div className="clu-faq-body" hidden={!open}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="clu-endcta">
        <h2>SMS AI that replies during the shift, not after.</h2>
        <p>Recharge by Zelle, Venmo, or cash. $0.005 per message, with better rates as you add more.</p>
        <a href="#pricing" className="clu-btn-white">See recharge options</a>
      </section>

      <footer className="clu-footer">
        <div className="clu-footer-grid clu-footer-grid-3">
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
            <a href="#pricing">Pricing</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Download</h4>
            <button type="button" className="clu-apk-btn" onClick={() => setIsModalOpen(true)}>
              Get the APK
            </button>
            <span>Android 8.0+</span>
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
