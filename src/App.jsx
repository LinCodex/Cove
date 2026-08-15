import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MasterControlPanel from './components/MasterControlPanel';

export default function App() {
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
    <LandingPage
      onOpenMasterControl={() => {
        setViewMasterControl(true);
        if (window.history.pushState) {
          window.history.pushState({}, '', '/mastercontrol');
        }
      }}
    />
  );
}
