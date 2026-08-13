import React, { useState } from 'react';
import { Send, RefreshCw, Sparkles, Zap, Wallet, CheckCircle2, Sliders } from 'lucide-react';

export default function InteractiveSimulatorCard() {
  const [walletBalance, setWalletBalance] = useState(20.00);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('bakery');

  const personas = {
    bakery: {
      name: "Artisanal Bakery",
      icon: "🥖",
      rules: "Open 7AM-6PM Mon-Sat. Bulk orders require 24h advance notice.",
      samples: [
        "What time do you open tomorrow morning?",
        "Do you have vegan sourdough bread today?",
        "Can I order 30 croissants for this Friday?"
      ]
    },
    services: {
      name: "Consulting & Intake",
      icon: "💼",
      rules: "Mon-Fri 9AM-5PM. Emergency outage hotline: 1-800-555-COVE.",
      samples: [
        "How do I schedule a 30-min strategy session?",
        "What is your pricing for quarterly bookkeeping?",
        "Our payment gateway is returning error 503!"
      ]
    },
    realestate: {
      name: "Real Estate Broker",
      icon: "🏡",
      rules: "Showings Saturday 1PM-4PM. Collect buyer email and preferred budget.",
      samples: [
        "Is 402 Ocean Drive open for viewing this weekend?",
        "Can you send the floor plan and HOA details?",
        "Are you available for a phone call today?"
      ]
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Customer",
      text: "What time do you open tomorrow morning?",
      time: "Just now",
      isUser: true
    },
    {
      id: 2,
      sender: "Cove Engine",
      text: "Hello! Cove Bakery opens at 7:00 AM tomorrow. Fresh warm sourdough and pastries are ready right from the oven at 7:30 AM!",
      time: "Responded in 78ms",
      isUser: false,
      cost: 0.00018,
      tokens: 46
    }
  ]);

  const current = personas[selectedPersona];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "Customer",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let reply = "";
      if (selectedPersona === 'bakery') {
        if (text.toLowerCase().includes('open') || text.toLowerCase().includes('time') || text.toLowerCase().includes('tomorrow')) {
          reply = "Hello! Cove Bakery opens at 7:00 AM tomorrow. Fresh warm sourdough and pastries are ready right from the oven at 7:30 AM!";
        } else if (text.toLowerCase().includes('croissant') || text.toLowerCase().includes('order') || text.toLowerCase().includes('bulk')) {
          reply = "We'd love to prepare your order! For 20+ items, please place orders 24 hours ahead so our head baker can prepare them fresh for you.";
        } else {
          reply = "Thank you for contacting Cove Bakery! All our breads and pastries are organic and baked fresh daily. Let us know how we can help you!";
        }
      } else if (selectedPersona === 'services') {
        if (text.toLowerCase().includes('error') || text.toLowerCase().includes('503') || text.toLowerCase().includes('outage')) {
          reply = "[URGENT] If your production service is experiencing downtime, please call our 24/7 emergency line at 1-800-555-COVE immediately.";
        } else if (text.toLowerCase().includes('schedule') || text.toLowerCase().includes('session')) {
          reply = "You can book a 30-min strategy session directly via our live calendar at https://cove.internal/book or reply with your preferred day.";
        } else {
          reply = "Thank you for reaching out to our advisory team. Our standard consultation fee is $150/hr. Reply with your project scope to get started!";
        }
      } else {
        if (text.toLowerCase().includes('viewing') || text.toLowerCase().includes('weekend') || text.toLowerCase().includes('ocean')) {
          reply = "Yes! 402 Ocean Drive has private walkthroughs this Saturday between 1:00 PM and 4:00 PM. Would you like me to reserve a 30-min slot?";
        } else {
          reply = "Thank you for contacting Coastal Real Estate. Please reply with your email and desired budget, and our lead broker will contact you shortly.";
        }
      }

      const cost = 0.00018;
      setWalletBalance(prev => Math.max(0, +(prev - cost).toFixed(5)));

      const autoReplyMsg = {
        id: Date.now() + 1,
        sender: "Cove Engine",
        text: reply,
        time: `Responded in ${Math.floor(Math.random() * 30 + 65)}ms`,
        isUser: false,
        cost: cost,
        tokens: Math.floor(Math.random() * 20 + 35)
      };

      setMessages(prev => [...prev, autoReplyMsg]);
      setIsProcessing(false);
    }, 650);
  };

  return (
    <div className="elite-card simulator-full-card">
      
      {/* Header */}
      <div className="simulator-card-header">
        <div>
          <span className="pill-tag">INTERACTIVE PLAYGROUND</span>
          <h2 className="section-card-title">Test the Live Token & Response Simulator</h2>
          <p className="section-card-desc">
            Type incoming customer inquiries or pick sample texts. Watch Cove execute auto-replies while deducting exact micro-tokens from your live wallet balance.
          </p>
        </div>

        {/* Live Wallet Balance Pill */}
        <div className="simulator-wallet-badge">
          <div className="wallet-badge-icon">
            <Wallet size={16} className="text-blue-400" />
          </div>
          <div className="wallet-badge-text">
            <span className="badge-sub">Live Wallet Balance</span>
            <span className="badge-amount">${walletBalance.toFixed(5)} USD</span>
          </div>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="simulator-main-grid">
        
        {/* Left Config Column */}
        <div className="sim-config-col">
          
          <div className="sim-box-panel">
            <span className="sim-box-title">
              <Sliders size={14} className="text-blue-400 inline mr-1" />
              Select Industry Persona
            </span>

            <div className="persona-btn-group">
              {Object.keys(personas).map((key) => {
                const p = personas[key];
                const isSelected = selectedPersona === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedPersona(key); setMessages([]); }}
                    className={`persona-btn ${isSelected ? 'persona-btn-active' : ''}`}
                  >
                    <span className="persona-emoji">{p.icon}</span>
                    <div className="persona-info">
                      <span className="persona-name">{p.name}</span>
                      <span className="persona-rule-preview">{p.rules}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="sim-box-panel">
            <span className="sim-box-title">Click to Test Inquiries:</span>
            <div className="sample-prompts-list">
              {current.samples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="sample-prompt-item"
                >
                  <span>"{s}"</span>
                  <Send size={12} className="text-blue-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Chat Terminal */}
        <div className="sim-terminal-col">
          <div className="sim-terminal-frame">
            
            {/* Terminal Header */}
            <div className="sim-terminal-top">
              <div className="terminal-status-dot"></div>
              <span className="terminal-title">Cove Auto-Response Console</span>
              <button 
                onClick={() => setMessages([])}
                className="btn-clear-sim"
              >
                <RefreshCw size={12} /> Clear
              </button>
            </div>

            {/* Messages Area */}
            <div className="sim-terminal-body">
              {messages.length === 0 ? (
                <div className="sim-empty-state">
                  <Sparkles size={24} className="text-slate-600 mb-2 animate-bounce" />
                  <span>Send a test SMS to simulate instant token deduction and auto-reply.</span>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`sim-msg-row ${m.isUser ? 'msg-user' : 'msg-cove'}`}>
                    <span className="msg-meta">{m.sender} • {m.time}</span>
                    <div className={`msg-bubble ${m.isUser ? 'bubble-in' : 'bubble-out'}`}>
                      {m.text}
                    </div>
                    {!m.isUser && (
                      <div className="msg-token-telemetry">
                        <span className="telemetry-cost">-${m.cost} USD</span>
                        <span>•</span>
                        <span>{m.tokens} tokens</span>
                        <span>•</span>
                        <span className="telemetry-badge">
                          <CheckCircle2 size={10} className="inline mr-1 text-emerald-400" />
                          On-Device Filtered
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isProcessing && (
                <div className="sim-processing-indicator">
                  <Zap size={14} className="animate-spin text-blue-400" />
                  <span>Processing incoming text & matching rules...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="sim-terminal-input-bar">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type an incoming customer message..."
                className="sim-input"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isProcessing || !inputText.trim()}
                className="btn-sim-send"
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
