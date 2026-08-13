import React, { useState } from 'react';
import { Send, Sliders, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function SmsSimulator() {
  const personas = {
    bakery: {
      name: "Cove Artisanal Bakery",
      icon: "🥖",
      hours: "7:00 AM – 6:00 PM (Mon-Sat)",
      rule: "Auto-reply store hours & custom order notice (24h in advance)",
      samples: [
        "What time do you open tomorrow morning?",
        "Do you have gluten-free cupcakes in stock?",
        "Can I place an order for 40 bagels this weekend?"
      ]
    },
    tech: {
      name: "Apex Tech Consulting",
      icon: "⚡",
      hours: "9:00 AM – 5:00 PM (Mon-Fri)",
      rule: "Direct urgent outages to emergency line; send portal reset links",
      samples: [
        "My database is down with error 502!",
        "How do I reset my account password?",
        "Are you open on Sundays for IT support?"
      ]
    },
    realestate: {
      name: "Coastal Real Estate",
      icon: "🏡",
      hours: "Open Daily 8:00 AM – 7:00 PM",
      rule: "Schedule property walkthroughs & record contact details",
      samples: [
        "Is 402 Ocean Drive open for viewing this Saturday?",
        "What are the listing details for the 3-bedroom villa?",
        "Can I speak with an agent regarding property valuation?"
      ]
    }
  };

  const [selectedPersonaKey, setSelectedPersonaKey] = useState('bakery');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Incoming SMS",
      text: "What time do you open tomorrow morning?",
      time: "Just now",
      isUser: true
    },
    {
      id: 2,
      sender: "Cove Autoresponder",
      text: "Hello! Cove Bakery is open Monday through Saturday from 7:00 AM to 6:00 PM. Fresh breads are ready at 7:30 AM daily!",
      time: "Responded in 72ms",
      isUser: false,
      ruleMatched: "STORE_HOURS_RULE",
      channel: "Slot #1 Active"
    }
  ]);

  const currentPersona = personas[selectedPersonaKey];

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "Incoming SMS",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let replyText = "";
      let matchedRule = "DEFAULT_BIZ_PROFILE";

      if (selectedPersonaKey === 'bakery') {
        if (text.toLowerCase().includes('open') || text.toLowerCase().includes('time') || text.toLowerCase().includes('tomorrow')) {
          replyText = "Hello! Cove Bakery is open Monday through Saturday from 7:00 AM to 6:00 PM. Fresh breads are ready at 7:30 AM daily!";
          matchedRule = "STORE_HOURS_RULE";
        } else if (text.toLowerCase().includes('order') || text.toLowerCase().includes('bagel') || text.toLowerCase().includes('cake')) {
          replyText = "Thank you for reaching out! For bulk orders or custom catering (over 20 items), please place your order 24 hours in advance so our head baker can prepare them fresh.";
          matchedRule = "CATERING_ORDER_RULE";
        } else {
          replyText = "Thank you for contacting Cove Bakery! We bake fresh organic pastries and sourdough daily. Reply with your question and we'll assist you right away.";
          matchedRule = "GENERAL_GREETING_RULE";
        }
      } else if (selectedPersonaKey === 'tech') {
        if (text.toLowerCase().includes('down') || text.toLowerCase().includes('error') || text.toLowerCase().includes('urgent')) {
          replyText = "[CRITICAL ALERT] If you are experiencing a production system outage, please dial our emergency hotline immediately at 1-800-555-APEX. On-call engineer alerted.";
          matchedRule = "EMERGENCY_ESCALATION_RULE";
        } else if (text.toLowerCase().includes('password') || text.toLowerCase().includes('reset')) {
          replyText = "To reset your corporate credentials, visit https://auth.apex.internal/reset or reply 'UNLOCK' for direct verification.";
          matchedRule = "CREDENTIAL_HELPER_RULE";
        } else {
          replyText = "Thank you for contacting Apex Tech Support. Our team operates Mon-Fri 9AM-5PM. Your support ticket has been created (#4192).";
          matchedRule = "SUPPORT_HOURS_RULE";
        }
      } else {
        if (text.toLowerCase().includes('viewing') || text.toLowerCase().includes('saturday') || text.toLowerCase().includes('house')) {
          replyText = "Yes! 402 Ocean Drive is open for private viewings this Saturday from 1:00 PM to 4:00 PM. Reply with your preferred 30-min window to confirm your booking.";
          matchedRule = "SHOWING_SCHEDULE_RULE";
        } else {
          replyText = "Thank you for contacting Coastal Real Estate. Please reply with your desired neighborhood and price range, and a licensed broker will follow up shortly.";
          matchedRule = "LEAD_CAPTURE_RULE";
        }
      }

      const autoReplyMsg = {
        id: Date.now() + 1,
        sender: "Cove Autoresponder",
        text: replyText,
        time: `Responded in ${Math.floor(Math.random() * 40 + 60)}ms`,
        isUser: false,
        ruleMatched: matchedRule,
        channel: "Slot #1 Active"
      };

      setMessages(prev => [...prev, autoReplyMsg]);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <section id="simulator" className="py-20 bg-[#06080E] relative border-t border-white/5">
      <div className="cove-container">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#70A8FF] uppercase tracking-wider mb-2 block">
            Live Interactive Simulator
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Test the Response Engine
          </h2>
          <p className="text-[#8E96A4] text-base mt-3">
            Choose a business profile below or send custom incoming texts to experience instantaneous rule-based auto-replies.
          </p>
        </div>

        {/* Simulator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Configuration Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-[#0A0D15] border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#70A8FF]" />
                Select Business Profile
              </h3>

              <div className="space-y-3">
                {Object.keys(personas).map((key) => {
                  const p = personas[key];
                  const isSelected = selectedPersonaKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedPersonaKey(key);
                        setMessages([]);
                      }}
                      className={`w-full text-left p-4 rounded-2xl transition-all border flex items-start gap-3.5 ${
                        isSelected 
                          ? 'bg-[#141824] border-[#1D61FF] shadow-lg shadow-blue-500/10' 
                          : 'bg-[#0E111B] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl select-none">{p.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{p.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1D61FF]" />}
                        </div>
                        <p className="text-xs text-[#8E96A4] mt-1">{p.hours}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Rules Info */}
              <div className="mt-5 p-3.5 rounded-2xl bg-[#0E111B] border border-white/10 text-xs">
                <span className="text-[#70A8FF] font-semibold block mb-1">Active Rule Definition:</span>
                <p className="text-slate-300 font-mono text-[11px]">{currentPersona.rule}</p>
              </div>
            </div>

            {/* Quick Samples */}
            <div className="p-5 rounded-3xl bg-[#0A0D15] border border-white/10">
              <span className="text-xs font-bold text-[#8E96A4] uppercase tracking-wider block mb-3">
                Test Incoming Inquiries:
              </span>
              <div className="flex flex-col gap-2">
                {currentPersona.samples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sample)}
                    className="text-left text-xs text-slate-300 hover:text-white p-3 rounded-xl bg-[#0E111B] hover:bg-[#141824] border border-white/5 transition-all flex items-center justify-between group"
                  >
                    <span>"{sample}"</span>
                    <Send className="w-3.5 h-3.5 text-[#8E96A4] group-hover:text-[#70A8FF] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Console Display */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0A0D15] border border-white/10 flex flex-col h-[520px] overflow-hidden">
              
              {/* Header */}
              <div className="px-6 py-4 bg-[#0E111B] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Cove Response Monitor
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-[#70A8FF] font-mono font-semibold">Active</span>
                    </h4>
                    <p className="text-xs text-[#8E96A4]">{currentPersona.name}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setMessages([])}
                  className="text-xs text-[#8E96A4] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                >
                  <RefreshCw className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#07090F]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#8E96A4] text-xs">
                    <Zap className="w-8 h-8 mb-2 text-slate-600" />
                    <span>Send a test SMS to watch Cove execute rule-based auto-replies in real time.</span>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-[#8E96A4]">
                        <span>{m.sender}</span>
                        <span>•</span>
                        <span>{m.time}</span>
                      </div>
                      
                      <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                        m.isUser 
                          ? 'bg-[#1D61FF] text-white rounded-tr-xs shadow-md' 
                          : 'bg-[#121622] text-slate-100 rounded-tl-xs border border-white/10 shadow-md'
                      }`}>
                        {m.text}
                      </div>

                      {!m.isUser && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#8E96A4] font-mono">
                          <span className="text-[#70A8FF]">[{m.ruleMatched}]</span>
                          <span>•</span>
                          <span className="text-emerald-400">{m.channel}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-[#70A8FF] bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 w-fit">
                    <span className="w-2 h-2 rounded-full bg-[#1D61FF] animate-ping"></span>
                    <span>Processing incoming SMS via matching rule filter...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-[#0E111B] border-t border-white/10 flex items-center gap-3">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type an incoming customer text..."
                  className="flex-1 bg-[#07090F] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-[#8E96A4] focus:outline-none focus:border-[#1D61FF] transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isProcessing || !inputText.trim()}
                  className="btn-blue-pill py-3 px-6 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
