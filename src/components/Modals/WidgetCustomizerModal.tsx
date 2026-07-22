import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Eye, EyeOff, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface WidgetCustomizerModalProps {
  onClose: () => void;
}

export default function WidgetCustomizerModal({ onClose }: WidgetCustomizerModalProps) {
  const { widgets, toggleWidgetVisibility, resetWidgetLayout } = useApp();

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            Personalizar Módulos del Dashboard
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Activa o desactiva los bloques de información en tu panel principal para adaptar la vista a tu flujo de trabajo.
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {widgets.map((w) => (
            <div
              key={w.id}
              onClick={() => toggleWidgetVisibility(w.id)}
              className="p-3 bg-[#14181c] border border-[#2e3944] hover:border-amber-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all"
            >
              <span className="text-xs font-semibold text-slate-200">{w.title}</span>
              <button
                type="button"
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  w.visible
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-[#262f3a] text-slate-500'
                }`}
              >
                {w.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
          <button
            onClick={resetWidgetLayout}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Diseño Inicial
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
