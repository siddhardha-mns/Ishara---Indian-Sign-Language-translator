import React from 'react';
import UnderlineHeroSection from './ui/underline-hero-section';

interface DemoLandingProps {
  onLogin: () => void;
}

export const DemoLanding: React.FC<DemoLandingProps> = ({ onLogin }) => (
  <UnderlineHeroSection brand="Ishara" onSignIn={onLogin} onTryForFree={onLogin} />
);
