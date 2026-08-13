import React, { useState } from 'react';
import TopHeroCard from './components/TopHeroCard';
import TopStatsCard from './components/TopStatsCard';
import BottomWalletCard from './components/BottomWalletCard';
import BottomUseCasesCard from './components/BottomUseCasesCard';
import PasswordModal from './components/PasswordModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="elite-canvas-wrapper">
      
      {/* Background Fluid Ambient Lights (Matching Reference Screenshot) */}
      <div className="ambient-blob blob-top-left"></div>
      <div className="ambient-blob blob-top-right"></div>
      <div className="ambient-blob blob-bottom-center"></div>

      {/* Main Grid Container */}
      <div className="elite-container">
        
        {/* Top Row: Hero Main Card (Left) + Stats Chart Card (Right) */}
        <div className="elite-row-top">
          <div className="col-top-hero">
            <TopHeroCard onOpenDownloadModal={() => setIsModalOpen(true)} />
          </div>
          <div className="col-top-stats">
            <TopStatsCard />
          </div>
        </div>

        {/* Bottom Row: Wallet Credit Card (Left) + Use Cases Card (Right) */}
        <div className="elite-row-bottom">
          <div className="col-bottom-half">
            <BottomWalletCard />
          </div>
          <div className="col-bottom-half">
            <BottomUseCasesCard onOpenDownloadModal={() => setIsModalOpen(true)} />
          </div>
        </div>

      </div>

      {/* Security Password Protected APK Download Modal */}
      <PasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}
