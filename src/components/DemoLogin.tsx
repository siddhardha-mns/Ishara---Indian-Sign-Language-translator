import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

interface DemoLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

const DEMO_EMAIL = 'demo@ishara.app';
const DEMO_PASSWORD = 'ishara-demo';

export const DemoLogin: React.FC<DemoLoginProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Use the demo credentials shown below.');
      return;
    }
    onSuccess();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0e1117] px-5 py-10 text-[#fafafa]">
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_420px]">
        <div className="hidden space-y-6 lg:block">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-[#808495] transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to home</button>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ff7777]">Ishara demo workspace</p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tighter">Ready to give every <span className="relative inline-block text-[#ff7777]">gesture<svg className="absolute left-0 top-full mt-[-5px] w-full" viewBox="0 0 170 30" fill="none" aria-hidden="true"><path d="M2 9C32.8203 5.34032 108.769 -0.881146 166 3.51047" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg></span> a voice?</h1>
          <p className="max-w-md text-base leading-7 text-[#808495]">Use the demo account to explore live camera translation, practice mode, and the ISL sign catalog.</p>
        </div>
        <div className="w-full space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-[#808495] transition hover:text-white lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to home</button>
        <div className="rounded-2xl border border-[#31333f] bg-[#171a22] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-7 space-y-2">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF4B4B] text-xl font-bold">इ</div>
            <h1 className="text-2xl font-bold">Welcome to Ishara</h1>
            <p className="text-sm leading-6 text-[#808495]">Sign in to open the translator demo.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2 text-xs font-semibold text-[#c9cad0]">
              Email
              <span className="relative block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808495]" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" className="h-11 w-full rounded-lg border border-[#31333f] bg-[#0e1117] pl-10 pr-3 text-sm outline-none transition focus:border-[#FF4B4B]" /></span>
            </label>
            <label className="block space-y-2 text-xs font-semibold text-[#c9cad0]">
              Password
              <span className="relative block"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808495]" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="h-11 w-full rounded-lg border border-[#31333f] bg-[#0e1117] pl-10 pr-11 text-sm outline-none transition focus:border-[#FF4B4B]" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808495] hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
            </label>
            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
            <button type="submit" className="h-11 w-full rounded-lg bg-[#FF4B4B] text-sm font-bold text-white transition hover:bg-[#ff3333]">Login to demo</button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-[#543134] bg-[#241619] p-4 text-xs">
            <p className="font-bold text-[#ff9b9b]">Demo credentials</p>
            <p className="mt-2 text-[#c9a5a5]">Email: <code className="text-white">{DEMO_EMAIL}</code></p>
            <p className="mt-1 text-[#c9a5a5]">Password: <code className="text-white">{DEMO_PASSWORD}</code></p>
            <p className="mt-3 text-[10px] leading-4 text-[#a17c7c]">Demo-only client-side login. Do not use this pattern for production authentication.</p>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
};
