import React, { useState } from 'react';
import { ChevronLeft, Share2, Signal, Wifi, Battery, MessageSquare } from 'lucide-react';

export default function PhoneMockup() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="relative w-[320px] sm:w-[340px] select-none mx-auto">
      
      {/* 3D Floating Blue Bar Chart (Top Right of Phone - Matching Reference Image) */}
      <div className="absolute -top-5 -right-6 sm:-right-8 w-20 h-20 sm:w-24 sm:h-24 z-20 pointer-events-none drop-shadow-[0_12px_20px_rgba(29,97,255,0.45)]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="barLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#99C5FF" />
              <stop offset="100%" stopColor="#4D92FF" />
            </linearGradient>
            <linearGradient id="barDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D61FF" />
              <stop offset="100%" stopColor="#0B3CB8" />
            </linearGradient>
            <linearGradient id="barSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          {/* Bar 1 */}
          <polygon points="20,70 34,60 34,85 20,95" fill="url(#barSide)" />
          <polygon points="34,60 48,70 48,95 34,85" fill="url(#barDark)" />
          <polygon points="20,70 34,60 48,70 34,80" fill="url(#barLight)" />
          
          {/* Bar 2 (Medium) */}
          <polygon points="38,50 52,40 52,70 38,80" fill="url(#barSide)" />
          <polygon points="52,40 66,50 66,80 52,70" fill="url(#barDark)" />
          <polygon points="38,50 52,40 66,50 52,60" fill="url(#barLight)" />
          
          {/* Bar 3 (Tall) */}
          <polygon points="56,30 70,20 70,55 56,65" fill="url(#barSide)" />
          <polygon points="70,20 84,30 84,65 70,55" fill="url(#barDark)" />
          <polygon points="56,30 70,20 84,30 70,40" fill="url(#barLight)" />
        </svg>
      </div>

      {/* 3D Floating Silver Trophy (Bottom Left of Phone - Matching Reference Image) */}
      <div className="absolute -bottom-5 -left-6 sm:-left-8 w-24 h-24 sm:w-28 sm:h-28 z-20 pointer-events-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            <linearGradient id="silverChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#D8E2EC" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="trophyPedestal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1D61FF" />
              <stop offset="100%" stopColor="#0E38A8" />
            </linearGradient>
          </defs>
          
          {/* Cup handles */}
          <path d="M30 42 C18 42 16 64 34 68" fill="none" stroke="url(#silverChrome)" strokeWidth="6" strokeLinecap="round" />
          <path d="M90 42 C102 42 104 64 86 68" fill="none" stroke="url(#silverChrome)" strokeWidth="6" strokeLinecap="round" />
          
          {/* Main Cup Body */}
          <path d="M32 32 L88 32 C88 56 76 72 60 76 C44 72 32 56 32 32 Z" fill="url(#silverChrome)" />
          
          {/* Trophy Stem */}
          <rect x="55" y="76" width="10" height="14" fill="url(#silverChrome)" rx="2" />
          
          {/* Trophy Blue Base */}
          <path d="M42 90 L78 90 L84 104 L36 104 Z" fill="url(#trophyPedestal)" />
          <rect x="34" y="104" width="52" height="6" rx="2" fill="#0A1838" />
        </svg>
      </div>

      {/* Main Smartphone Shell (Exact match to reference dark phone frame) */}
      <div className="relative bg-[#090B10] border-[7px] border-[#1C202C] rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden text-white font-sans">
        
        {/* Status Bar */}
        <div className="px-6 pt-3.5 pb-2 flex items-center justify-between text-[11px] text-[#A0AEC0]">
          <span className="font-semibold text-white">9:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-16 h-3 bg-black rounded-full mx-auto"></div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-white" />
            <Wifi className="w-3 h-3 text-white" />
            <Battery className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Top App Header (Back, Name, Share) */}
        <div className="px-5 py-2.5 flex items-center justify-between text-slate-300">
          <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-white" />
          <span className="text-sm font-bold text-white tracking-tight">cove</span>
          <Share2 className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>

        {/* Profile Card Header */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-[#718096] font-medium">25 active rules • 30 following</p>
              <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">Pat</h3>
              <p className="text-xs text-[#718096]">@pat</p>
            </div>
            
            {/* Avatar matching reference photo style */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1D61FF] to-[#60A5FA] p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#111624] flex items-center justify-center font-bold text-sm text-white">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <span className="text-[10px] text-[#1D61FF] font-semibold mt-1">Edit</span>
            </div>
          </div>

          {/* Specialties / Mode Box (Exact match to reference) */}
          <div className="mt-3">
            <h4 className="text-xs font-bold text-white">Specialties</h4>
            <p className="text-xs text-[#718096] mt-0.5">
              You haven't selected any specialties yet!
            </p>
          </div>
        </div>

        {/* "At a glance" Section (Exact 3-box layout from reference) */}
        <div className="px-5 py-3 bg-[#0D1018] border-y border-white/5">
          <h4 className="text-xs font-bold text-white mb-2.5">At a glance</h4>
          
          <div className="grid grid-cols-3 gap-2">
            
            {/* Box 1 (Top league / 56 texts) */}
            <div className="bg-[#141824] p-2.5 rounded-xl text-center border border-white/5">
              <span className="text-[10px] text-[#718096] block font-medium">Top league</span>
              <div className="my-1.5 inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600/30 text-blue-400 font-bold text-[9px]">
                NBA
              </div>
              <span className="text-[10px] font-bold text-white block">56 bets</span>
            </div>

            {/* Box 2 (Top team / 8 bets) */}
            <div className="bg-[#141824] p-2.5 rounded-xl text-center border border-white/5">
              <span className="text-[10px] text-[#718096] block font-medium">Top team</span>
              <div className="my-1.5 inline-flex items-center justify-center w-6 h-6 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px]">
                DAL
              </div>
              <span className="text-[10px] font-bold text-white block">8 bets</span>
            </div>

            {/* Box 3 (Top player / 8 bets) */}
            <div className="bg-[#141824] p-2.5 rounded-xl text-center border border-white/5">
              <span className="text-[10px] text-[#718096] block font-medium">Top player</span>
              <div className="my-1.5 inline-flex items-center justify-center w-6 h-6 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px]">
                👤
              </div>
              <span className="text-[10px] font-bold text-white block">8 bets</span>
            </div>

          </div>
        </div>

        {/* Categories Section (Exact match to reference bottom row) */}
        <div className="px-5 py-4 bg-[#090B10]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#718096] font-medium">Categories</span>
            <span className="text-emerald-400 font-mono font-bold">380.00%</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141824] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#1D61FF] flex items-center justify-center text-[10px] font-bold text-white">
                G
              </div>
              <div>
                <span className="text-xs font-bold text-white block">GOLF</span>
                <span className="text-[10px] text-[#718096]">14 bets</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-200">Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
