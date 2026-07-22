import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Truck, KeyRound, Lock, User, ShieldAlert, CheckCircle2, Key, Info } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: LoginScreen (Pantalla de Autenticación y Registro Único)
 * ============================================================================
 * @description
 * Administra el acceso seguro a la plataforma EYON Cargo Internacional.
 * Lógica de comportamiento:
 * 1. Si NO existe un usuario registrado en el navegador (`hasConfiguredUser === false`),
 *    muestra el formulario de REGISTRO ÚNICO INICIAL (Usuario + Clave + Confirmación).
 * 2. Una vez guardado el usuario, esa pantalla NUNCA MÁS vuelve a aparecer.
 * 3. En accesos posteriores, muestra únicamente el inicio de sesión estándar.
 * ============================================================================
 */
export default function LoginScreen() {
  const { hasConfiguredUser, setupInitialUser, loginWithCredentials, configuredUsername } = useApp();

  // Estados locales para el formulario
  const [username, setUsername] = useState(configuredUsername || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Procesa el envío del formulario según el modo (Registro Único vs Login)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasConfiguredUser) {
      // ----------------- MODO 1: REGISTRO ÚNICO INICIAL -----------------
      if (!username.trim()) {
        setError('Por favor ingresa un nombre de usuario.');
        return;
      }
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true);
      try {
        await setupInitialUser(username, password);
      } catch (err: any) {
        setError('Error al registrar usuario: ' + (err.message || 'Intente nuevamente'));
      } finally {
        setLoading(false);
      }
    } else {
      // ----------------- MODO 2: INICIO DE SESIÓN ESTÁNDAR -----------------
      if (!username.trim() || !password) {
        setError('Por favor ingresa usuario y contraseña.');
        return;
      }

      setLoading(true);
      try {
        const success = await loginWithCredentials(username, password);
        if (!success) {
          setError('Usuario o contraseña incorrectos.');
        }
      } catch (err: any) {
        setError('Error al iniciar sesión: ' + (err.message || 'Intente nuevamente'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#14181c] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Luces decorativas de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1b2127] border border-[#2e3944] rounded-2xl p-8 shadow-2xl relative z-10">
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

        {/* Banners Informativos */}
        {!hasConfiguredUser ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Registro Único Inicial (Paso 1 de 1)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Crear Usuario y Clave Encriptada</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Esta pantalla de registro se muestra <strong className="text-slate-200">una sola vez</strong> al iniciar por primera vez. Tu contraseña se guardará encriptada con tecnología SHA-256 en tu navegador.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Autenticación Encriptada (SHA-256)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Iniciar Sesión</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ingresa tus credenciales registradas para acceder a la gestión de flota y finanzas.
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre de Usuario */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nombre de Usuario
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
                autoFocus={!hasConfiguredUser}
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {!hasConfiguredUser ? 'Crear Contraseña Privada' : 'Contraseña'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm tracking-widest"
                autoFocus={hasConfiguredUser}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Campo Confirmar Contraseña (Solo en primer registro) */}
          {!hasConfiguredUser && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm tracking-widest"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium leading-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {!hasConfiguredUser ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Creando Usuario Encriptado...' : 'Guardar Usuario e Iniciar'}
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                {loading ? 'Verificando Hash...' : 'Ingresar al Sistema'}
              </>
            )}
          </button>
        </form>

        {!hasConfiguredUser && (
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[11px] text-amber-300/80 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Importante:</strong> Esta cuenta de usuario es única y personal. Guarda tus credenciales en un lugar seguro.
            </span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#2e3944]/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Seguridad Local Crypto
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
