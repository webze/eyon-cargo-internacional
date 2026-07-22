import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="bg-[#262f3a] border border-amber-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
