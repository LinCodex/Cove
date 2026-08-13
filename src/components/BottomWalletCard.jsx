import React, { useState } from 'react';
import { Wallet, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function BottomWalletCard() {
  const [selectedDeposit, setSelectedDeposit] = useState(20);

  const tokenEstimates = {
    5: { replies: "25,000", costPer: "$0.0002", bonus: "Standard" },
    20: { replies: "105,000", costPer: "$0.00019", bonus: "+5% Bonus Tokens" },
    50: { replies: "275,000", costPer: "$0.00018", bonus: "+10% Bonus Tokens" }
  };

  const currentTier = tokenEstimates[selectedDeposit];

  return (
    <div className="elite-card bottom-card-wallet">
      
      <div className="bottom-card-grid">
        
        {/* Left Text Column */}
        <div className="bottom-text-col">
          <span className="pill-tag-orange">WHY COVE?</span>
          
          <h2 className="bottom-card-title">
            Manage your messaging with a smart credit wallet.
          </h2>

          <p className="bottom-card-desc">
            Zero monthly subscriptions. Simply deposit funds into your secure wallet and spend micro-fractions based strictly on real-time token consumption.
          </p>

          {/* Deposit Selector */}
          <div className="deposit-tiers-box">
            <span className="deposit-box-label">Select Deposit Amount:</span>
            <div className="tier-buttons-row">
              {[5, 20, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedDeposit(amt)}
                  className={`tier-btn ${selectedDeposit === amt ? 'tier-btn-active' : ''}`}
                >
                  ${amt} USD
                </button>
              ))}
            </div>

            <div className="tier-calc-result">
              <div className="calc-row">
                <span className="calc-label">Est. Auto-Replies:</span>
                <span className="calc-val text-blue-400 font-bold">{currentTier.replies} msgs</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Per Response:</span>
                <span className="calc-val text-emerald-400">{currentTier.costPer}</span>
              </div>
              <div className="calc-badge">{currentTier.bonus}</div>
            </div>
          </div>
        </div>

        {/* Right Interactive Mockup (Matching reference UI in bottom left) */}
        <div className="bottom-mockup-col">
          
          <div className="wallet-mockup-panel">
            
            {/* User Message Row */}
            <div className="mockup-user-bubble">
              <div className="bubble-avatar">L</div>
              <div className="bubble-lines">
                <div className="line-long"></div>
                <div className="line-short"></div>
              </div>
            </div>

            {/* Floating Purple Notification Pill (Exact match to reference bottom left pill) */}
            <div className="floating-notification-pill">
              <div className="notif-check-icon">
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div className="notif-text">
                <span className="notif-bold">USD ${selectedDeposit}.00 deposited</span>
                <span className="notif-sub">Cove Wallet • Balance active</span>
              </div>
            </div>

            {/* Micro Activity Box */}
            <div className="mockup-receipt-box">
              <div className="receipt-header">
                <Wallet size={14} className="text-blue-400" />
                <span>Live Token Meter</span>
              </div>
              <div className="receipt-row">
                <span>Inbound SMS:</span>
                <span className="text-slate-300">"What time do you close tonight?"</span>
              </div>
              <div className="receipt-row">
                <span>Token Deduction:</span>
                <span className="text-emerald-400 font-mono">-0.00018 USD (48 tokens)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
