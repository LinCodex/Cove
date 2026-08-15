import React, { useState } from 'react';
import { Send, RefreshCw, Sparkles, Zap, Wallet } from 'lucide-react';

const RATE = 0.005;

export default function InteractiveSimulatorCard() {
  const [walletBalance, setWalletBalance] = useState(20.00);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('bakery');

  const personas = {
    bakery: {
      name: 'Artisanal Bakery',
      icon: '🥖',
      rules: 'Open 7AM–6PM Mon–Sat. Bulk orders need 24h notice.',
      samples: [
        'What time do you open tomorrow morning?',
        'Do you have vegan sourdough bread today?',
        'Can I order 30 croissants for this Friday?'
      ]
    },
    services: {
      name: 'Consulting & Intake',
      icon: '💼',
      rules: 'Mon–Fri 9AM–5PM. Emergency line: 1-800-555-COVE.',
      samples: [
        'How do I schedule a 30-min strategy session?',
        'What is your pricing for quarterly bookkeeping?',
        'Our payment gateway is returning error 503!'
      ]
    },
    realestate: {
      name: 'Real Estate Broker',
      icon: '🏡',
      rules: 'Showings Saturday 1–4PM. Collect email and budget.',
      samples: [
        'Is 402 Ocean Drive open for viewing this weekend?',
        'Can you send the floor plan and HOA details?',
        'Are you available for a phone call today?'
      ]
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Customer',
      text: 'What time do you open tomorrow morning?',
      time: 'Just now',
      isUser: true
    },
    {
      id: 2,
      sender: 'Cove',
      text: 'Hello! Cove Bakery opens at 7:00 AM tomorrow. Fresh sourdough and pastries are ready from 7:30 AM.',
      time: '78ms',
      isUser: false,
      cost: RATE
    }
  ]);

  const current = personas[selectedPersona];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, {
      id: Date.now(),
      sender: 'Customer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    }]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let reply = '';
      if (selectedPersona === 'bakery') {
        if (text.toLowerCase().includes('open') || text.toLowerCase().includes('time') || text.toLowerCase().includes('tomorrow')) {
          reply = 'Hello! Cove Bakery opens at 7:00 AM tomorrow. Fresh sourdough and pastries are ready from 7:30 AM.';
        } else if (text.toLowerCase().includes('croissant') || text.toLowerCase().includes('order') || text.toLowerCase().includes('bulk')) {
          reply = "We'd love to prepare that. For 20+ items, please order 24 hours ahead so we can bake them fresh.";
        } else {
          reply = 'Thank you for contacting Cove Bakery. Everything is organic and baked daily — how can we help?';
        }
      } else if (selectedPersona === 'services') {
        if (text.toLowerCase().includes('error') || text.toLowerCase().includes('503') || text.toLowerCase().includes('outage')) {
          reply = 'If production is down, call our 24/7 line at 1-800-555-COVE immediately.';
        } else if (text.toLowerCase().includes('schedule') || text.toLowerCase().includes('session')) {
          reply = 'Book a 30-minute strategy session or reply with your preferred day.';
        } else {
          reply = 'Thanks for reaching out. Consultations are $150/hr — reply with your project scope to start.';
        }
      } else if (text.toLowerCase().includes('viewing') || text.toLowerCase().includes('weekend') || text.toLowerCase().includes('ocean')) {
        reply = 'Yes — 402 Ocean Drive has walkthroughs Saturday 1:00–4:00 PM. Want a 30-minute slot?';
      } else {
        reply = 'Thanks for contacting Coastal Real Estate. Reply with your email and budget and a broker will follow up.';
      }

      setWalletBalance((prev) => Math.max(0, +(prev - RATE).toFixed(3)));
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'Cove',
        text: reply,
        time: `${Math.floor(Math.random() * 30 + 65)}ms`,
        isUser: false,
        cost: RATE
      }]);
      setIsProcessing(false);
    }, 650);
  };

  return (
    <div className="clu-card clu-sim">
      <div className="clu-sim-head">
        <div>
          <p className="clu-kicker">Playground</p>
          <h3 className="clu-h3">Live response simulator</h3>
          <p className="clu-lead">Send a sample SMS. Cove drafts a reply and deducts $0.005 from the demo wallet.</p>
        </div>
        <div className="clu-wallet-pill">
          <Wallet size={16} />
          <div>
            <small>Demo wallet</small>
            <strong>${walletBalance.toFixed(3)}</strong>
          </div>
        </div>
      </div>

      <div className="clu-sim-grid">
        <div className="clu-sim-side">
          <div className="clu-card clu-card-inset">
            <span className="clu-label">Industry</span>
            <div className="clu-persona-list">
              {Object.keys(personas).map((key) => {
                const p = personas[key];
                const on = selectedPersona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setSelectedPersona(key); setMessages([]); }}
                    className={`clu-persona ${on ? 'is-on' : ''}`}
                  >
                    <span>{p.icon}</span>
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.rules}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="clu-card clu-card-inset">
            <span className="clu-label">Sample texts</span>
            <div className="clu-sample-list">
              {current.samples.map((s) => (
                <button key={s} type="button" onClick={() => handleSend(s)} className="clu-sample">
                  <span>“{s}”</span>
                  <Send size={12} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="clu-card clu-card-dark clu-terminal">
          <div className="clu-terminal-top">
            <span className="clu-dot" />
            <span>Auto-reply</span>
            <button type="button" onClick={() => setMessages([])} className="clu-clear">
              <RefreshCw size={12} /> Clear
            </button>
          </div>
          <div className="clu-terminal-body">
            {messages.length === 0 ? (
              <div className="clu-empty">
                <Sparkles size={22} />
                <span>Send a test SMS to see a $0.005 deduction.</span>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`clu-msg ${m.isUser ? 'is-in' : 'is-out'}`}>
                  <small>{m.sender} · {m.time}</small>
                  <p>{m.text}</p>
                  {!m.isUser && <em>−${m.cost.toFixed(3)}</em>}
                </div>
              ))
            )}
            {isProcessing && (
              <div className="clu-thinking">
                <Zap size={14} />
                Matching rules…
              </div>
            )}
          </div>
          <div className="clu-terminal-bar">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Incoming customer message…"
            />
            <button type="button" onClick={() => handleSend()} disabled={isProcessing || !inputText.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
