import React, { useState, useEffect } from 'react';
import TopHeroCard from './components/TopHeroCard';
import TopStatsCard from './components/TopStatsCard';
import BottomWalletCard from './components/BottomWalletCard';
import BottomUseCasesCard from './components/BottomUseCasesCard';
import InteractiveSimulatorCard from './components/InteractiveSimulatorCard';
import ComparisonCard from './components/ComparisonCard';
import TechSpecsCard from './components/TechSpecsCard';
import FaqCard from './components/FaqCard';
import BottomCtaCard from './components/BottomCtaCard';
import FooterCard from './components/FooterCard';
import PasswordModal from './components/PasswordModal';
import MasterControlPanel from './components/MasterControlPanel';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMasterControl, setViewMasterControl] = useState(
    typeof window !== 'undefined' && 
    (window.location.pathname.includes('mastercontrol') || window.location.hash.includes('mastercontrol'))
  );

  useEffect(() => {
    const checkRoute = () => {
      if (window.location.pathname.includes('mastercontrol') || window.location.hash.includes('mastercontrol')) {
        setViewMasterControl(true);
      }
    };
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  if (viewMasterControl) {
    return (
      <MasterControlPanel 
        onBackToHome={() => {
          setViewMasterControl(false);
          if (window.history.pushState) {
            window.history.pushState('', '/', '/');
          }
        }} 
      />
    );
  }

  return (
    <div className="elite-canvas-wrapper">
      
      {/* Background Fluid Ambient Lights (Matching Reference Screenshot) */}
      <div className="ambient-blob blob-top-left"></div>
      <div className="ambient-blob blob-top-right"></div>
      <div className="ambient-blob blob-bottom-center"></div>

      {/* Main Grid Container */}
      <div className="elite-container">
        
        {/* Row 1: Hero Main Card (Left) + Stats Chart Card (Right) */}
        <div className="elite-row-top">
          <div className="col-top-hero">
            <TopHeroCard onOpenDownloadModal={() => setIsModalOpen(true)} />
          </div>
          <div className="col-top-stats">
            <TopStatsCard />
          </div>
        </div>

        {/* Row 2: Wallet Credit Card (Left) + Use Cases Card (Right) */}
        <div className="elite-row-bottom" id="wallet">
          <div className="col-bottom-half">
            <BottomWalletCard />
          </div>
          <div className="col-bottom-half" id="usecases">
            <BottomUseCasesCard onOpenDownloadModal={() => setIsModalOpen(true)} />
          </div>
        </div>

        {/* Row 3: Live Interactive Simulator & Token Counter */}
        <div className="elite-row-full" id="simulator">
          <InteractiveSimulatorCard />
        </div>

        {/* Row 4: Comparison Table (Left) + Tech Performance Specs (Right) */}
        <div className="elite-row-bottom">
          <div className="col-bottom-half">
            <ComparisonCard />
          </div>
          <div className="col-bottom-half">
            <TechSpecsCard />
          </div>
        </div>

        {/* Row 5: FAQ Accordion */}
        <div className="elite-row-full" id="faq">
          <FaqCard />
        </div>

        {/* Row 6: Bottom Download CTA + Mobile QR Scanner */}
        <div className="elite-row-full">
          <BottomCtaCard onOpenDownloadModal={() => setIsModalOpen(true)} />
        </div>

        {/* Row 7: Footer */}
        <div className="elite-row-full">
          <FooterCard onOpenDownloadModal={() => setIsModalOpen(true)} />
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
