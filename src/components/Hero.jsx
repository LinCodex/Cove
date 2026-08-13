import React from 'react';
import confetti from 'canvas-confetti';
import PhoneMockup from './PhoneMockup';

export default function Hero() {
  const handleDownload = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.25 }
    });
  };

  return (
    <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden bg-black">
      <div className="cove-container">
        
        {/* Main 2-Column Hero Flex Container */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Left Text Container */}
          <div className="w-full max-w-xl text-center lg:text-left space-y-6">
            
            {/* Top Rating Badges (Exact match to App Store ★ 4.8  Google Play ★ 4.8) */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-[#8A92A6] font-medium tracking-wide">
              <span>Android APK <strong className="text-white">★ 4.8</strong></span>
              <span>Direct Build <strong className="text-white">★ 4.8</strong></span>
            </div>

            {/* Main Headline (Clean 3-line layout) */}
            <h1 className="hero-headline">
              The Ultimate<br />
              SMS Autoresponder<br />
              <span className="text-highlight-blue">Tool</span>
            </h1>

            {/* Action Button (Exact outline pill button) */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <a 
                href="/cove-app.apk" 
                download="cove-autoresponder-v1.0.apk"
                onClick={handleDownload}
                className="btn-outline-pill"
              >
                Get the App
              </a>
            </div>

          </div>

          {/* Right Phone Mockup Container */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <PhoneMockup />
          </div>

        </div>

        {/* Bottom Curved Banner (Exact match to reference bottom banner) */}
        <div className="mt-16 md:mt-24 pt-10 pb-8 px-6 sm:px-12 rounded-t-[36px] sm:rounded-t-[48px] bg-[#0A0D15] border-t border-x border-white/10 text-center">
          <p className="text-base sm:text-lg md:text-xl font-medium text-white/90 max-w-2xl mx-auto leading-relaxed">
            We are <span className="text-[#70A8FF] font-semibold">backed</span> by a team of dedicated developers who share our passion for fast, reliable, and private SMS automation.
          </p>
        </div>

      </div>
    </section>
  );
}
