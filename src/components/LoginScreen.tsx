import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Truck, KeyRound, Lock, User, ShieldAlert, CheckCircle2, Key, Info, Eye, EyeOff, Loader2 } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: LoginScreen (Pantalla de Autenticación Única Administrador)
 * ============================================================================
 * @description
 * Administra el acceso seguro y centralizado a la plataforma EYON Cargo.
 * Permite ingresar con el usuario y contraseña del Administrador único desde
 * cualquier celular, computadora o dispositivo.
 * ============================================================================
 */
export default function LoginScreen() {
  const { authLoading, hasConfiguredUser, setupInitialUser, loginWithCredentials, configuredUsername } = useApp();

  // Estados locales
  const [username, setUsername] = useState(configuredUsername || 'admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (configuredUsername) {
      setUsername(configuredUsername);
    }
  }, [configuredUsername]);

  useEffect(() => {
    if (!hasConfiguredUser && !authLoading) {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [hasConfiguredUser, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('Por favor ingresa un nombre de usuario.');
      return;
    }
    if (!password) {
      setError('Por favor ingresa la contraseña.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas de confirmación no coinciden.');
        return;
      }

      setLoading(true);
      try {
        await setupInitialUser(cleanUser, password);
      } catch (err: any) {
        setError('Error al guardar credenciales: ' + (err.message || 'Intente nuevamente'));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const success = await loginWithCredentials(cleanUser, password);
        if (!success) {
          setError('Usuario o contraseña incorrectos. Verifica que sean idénticos a los guardados.');
        }
      } catch (err: any) {
        setError('Error al ingresar: ' + (err.message || 'Intente nuevamente'));
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#14181c] flex items-center justify-center p-4 text-slate-100">
        <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <div>
            <h2 className="text-base font-bold text-slate-200 mb-1">Verificando Seguridad...</h2>
            <p className="text-xs text-slate-400">Sincronizando cuenta del servidor central</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#14181c] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Luces decorativas de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1b2127] border border-[#2e3944] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Isotipo y Marca */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/20">
            E
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-slate-100">EYON CARGO</div>
            <div className="text-xs text-amber-500 font-semibold uppercase tracking-widest">
              INTERNACIONAL
            </div>
          </div>
        </div>

        {/* Encabezado e Indicadores */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Un Solo Administrador Central (Acceso Multidispositivo)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            {mode === 'login' ? 'Iniciar Sesión' : 'Configurar Cuenta Admin Única'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {mode === 'login'
              ? 'Ingresa con tu usuario y contraseña. La misma cuenta funciona en tu celular, computadora y cualquier navegador.'
              : 'Configura el usuario y contraseña principales para proteger el sistema en todos tus dispositivos.'}
          </p>
        </div>

        {/* Banner Informativo de Credenciales Predeterminadas */}
        {mode === 'login' && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Acceso de Fábrica del Sistema:</span>
            </div>
            <div className="font-mono text-[11px] text-amber-200/90 pl-5">
              Usuario: <strong className="text-amber-300">{configuredUsername || 'admin'}</strong> | Clave inicial: <strong className="text-amber-300">admin</strong>
            </div>
            <p className="text-[11px] text-slate-400 pl-5">
              (Si cambiaste la clave previamente desde Configuración, usa tu nueva clave)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre de Usuario */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Usuario Administrador
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Ej. admin"
                className="w-full pl-10 pr-4 py-3 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-medium"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Contraseña (Solo en registro) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-medium"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando Credenciales...</span>
              </>
            ) : mode === 'register' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Credenciales de Administrador</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Alternar modo de inicio/registro si es necesario */}
        <div className="mt-4 pt-4 border-t border-[#2e3944]/60 flex items-center justify-between text-xs">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer underline underline-offset-2"
            >
              ¿Deseas cambiar o recrear la cuenta Administrador?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer underline underline-offset-2"
            >
              Volver al inicio de sesión habitual
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#2e3944]/40 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Hash Encriptado Central
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-500" />
            EYON Cargo v3.5
          </span>
        </div>
      </div>
    </div>
  );
}
