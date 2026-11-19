import React, { useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cn = (...inputs: Array<string | false | null | undefined>) => inputs.filter(Boolean).join(' ');

const LocalStyles = () => (
  <style>{`
    .hero-underline { position: absolute; left: 0; width: 100%; top: 100%; margin-top: -5px; pointer-events: none; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
    .animate-fade-in-up-delay-1 { animation-delay: 0.2s; }
    .animate-fade-in-up-delay-2 { animation-delay: 0.4s; }
    .btn-base { transition: none; display: inline-flex; align-items: center; justify-content: center; }
    @keyframes btn-bounce { 0% { transform: scale(1); } 50% { transform: scale(0.95); } 100% { transform: scale(1); } }
    .btn-bounce-anim { animation: btn-bounce 0.3s cubic-bezier(0.36, 0, 0.66, -0.56); }
    .focus-outline:focus-visible { outline: 2px solid #ff7777; outline-offset: 3px; }
  `}</style>
);

const buttonVariants = cva(
  'btn-base inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#FF4B4B] text-white',
        outline: 'border-2 border-[#fafafa] bg-transparent text-[#fafafa]',
        ghost: 'bg-transparent text-[#fafafa]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, onClick, ...props }, ref) => {
  const localRef = useRef<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    localRef.current?.classList.add('btn-bounce-anim');
    window.setTimeout(() => localRef.current?.classList.remove('btn-bounce-anim'), 300);
    onClick?.(event);
  };
  return (
    <button
      {...props}
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      onClick={handleClick}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  );
});
Button.displayName = 'Button';

interface ComponentProps {
  brand?: string;
  heroClassName?: string;
  onSignIn?: () => void;
  onTryForFree?: () => void;
}

const Navigation: React.FC<{ brand: string; onSignIn?: () => void }> = ({ brand, onSignIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'about', label: 'About' },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#31333f] bg-[#0e1117]/80 backdrop-blur-md" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2 text-xl font-bold tracking-tight focus-outline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4B4B] text-base">इ</span>{brand}
        </a>

        <div className="hidden items-center space-x-8 md:flex">
          {navItems.map((item) => <a key={item.id} href={`#${item.id}`} className="focus-outline text-sm font-medium text-[#808495] transition-colors hover:text-[#fafafa]">{item.label}</a>)}
          <Button size="sm" className="focus-outline" onClick={onSignIn}>Sign In</Button>
        </div>

        <div className="relative md:hidden">
          <Button size="sm" variant="ghost" className="focus-outline font-medium" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-menu" ref={triggerRef}>
            {menuOpen ? 'Close' : 'Menu'}
          </Button>
          {menuOpen && (
            <div id="mobile-menu" ref={menuRef} className="absolute right-0 mt-2 w-56 rounded-md border border-[#31333f] bg-[#171a22]/95 p-3 shadow-lg" role="menu">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)} className="focus-outline rounded px-3 py-2 text-sm font-medium text-[#808495] hover:bg-[#262730] hover:text-[#fafafa]" role="menuitem">{item.label}</a>)}
                <Button size="sm" className="mt-2 w-full focus-outline" onClick={() => { setMenuOpen(false); onSignIn?.(); }}>Sign In</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero: React.FC<{ heroClassName?: string; onTryForFree?: () => void }> = ({ heroClassName, onTryForFree }) => (
  <section id="top" className="flex min-h-screen items-center justify-center px-4 pb-24 pt-32 md:pb-32 md:pt-40" aria-labelledby="hero-heading">
    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
      <p className="mb-5 animate-fade-in-up text-xs font-semibold uppercase tracking-[0.25em] text-[#ff7777]">Indian Sign Language translator</p>
      <h1 id="hero-heading" className="mb-6 animate-fade-in-up text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl">
        Every gesture has a story.
        <br />
        <span className="relative inline-block">
          <span className={cn(heroClassName, 'font-normal text-[#ff7777]')}>Ishara</span>
          <svg className="hero-underline" viewBox="0 0 170 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 9C32.8203 5.34032 108.769 -0.881146 166 3.51047" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
          </svg>
        </span>{' '}gives it a voice.
      </h1>
      <p className="mb-9 max-w-2xl animate-fade-in-up animate-fade-in-up-delay-1 text-base leading-relaxed text-[#a5a8b5] sm:text-lg">
        Translate live Indian Sign Language gestures into text and speech with MediaPipe landmarks and the AI4Bharat INCLUDE model.
      </p>
      <div className="animate-fade-in-up animate-fade-in-up-delay-2">
        <Button size="lg" className="rounded-lg px-8 py-6 text-base focus-outline" onClick={onTryForFree}>Try the demo</Button>
      </div>
      <div id="features" className="mt-20 grid w-full gap-3 text-left sm:grid-cols-3">
        {[
          ['Live camera', 'Browser-based hand and pose landmarks.'],
          ['263 signs', 'Temporal recognition through INCLUDE.'],
          ['Text + speech', 'English and Hindi output for demos.'],
        ].map(([title, description]) => <div key={title} className="rounded-xl border border-[#31333f] bg-[#171a22] p-4"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#808495]">{description}</p></div>)}
      </div>
      <div id="how-it-works" className="sr-only">Camera landmarks are sent to the INCLUDE Transformer for sign recognition.</div>
      <div id="about" className="sr-only">Ishara is a demonstration project for Indian Sign Language accessibility.</div>
    </div>
  </section>
);

const UnderlineHeroSection: React.FC<ComponentProps> = ({ brand = 'Ishara', heroClassName, onSignIn, onTryForFree }) => (
  <div className="min-h-screen bg-[#0e1117] text-[#fafafa]"><LocalStyles /><Navigation brand={brand} onSignIn={onSignIn} /><Hero heroClassName={heroClassName} onTryForFree={onTryForFree} /></div>
);

export default UnderlineHeroSection;
