import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Lock, User, ShieldAlert, Eye, EyeOff, Loader2, Truck } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: LoginScreen (Inicio de Sesión Simple y Directo)
 * ============================================================================
 */
export default function LoginScreen() {
  const { authLoading, loginWithCredentials, configuredUsername } = useApp();

  const [username, setUsername] = useState(configuredUsername || 'EYON');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configuredUsername) {
      setUsername(configuredUsername);
    }
  }, [configuredUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      const success = await loginWithCredentials('EYON', password);
      if (!success) {
        setError('Contraseña incorrecta para la cuenta EYON.');
      }
    } catch (err: any) {
      setError('Error de inicio de sesión: ' + (err.message || 'Intenta nuevamente'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#14181c] flex items-center justify-center p-4 text-slate-100">
        <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#14181c] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Glow de fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-[#1b2127] border border-[#2e3944] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Logo EYON CARGO */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg shadow-amber-500/20 mb-3">
            E
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-slate-100">EYON CARGO</h1>
          <p className="text-[11px] text-amber-500 font-semibold uppercase tracking-widest mt-0.5">
            PLATAFORMA INTEGRAL
          </p>
        </div>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-slate-200">Iniciar Sesión</h2>
          <p className="text-xs text-slate-400 mt-1">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario Único Master */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Usuario Master</span>
              <span className="text-[10px] text-amber-400 font-bold">CUENTA ÚNICA</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value="EYON"
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-[#14181c] border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm cursor-not-allowed opacity-90"
              />
              <User className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#2e3944]/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            EYON Cargo v3.5
          </span>
          <span>Sincronización Central</span>
        </div>
      </div>
    </div>
  );
}
