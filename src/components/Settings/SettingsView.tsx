import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Shield, SlidersHorizontal, Cloud, Download, Upload, Key, Check, Github, EyeOff, Lock, CheckCircle2, UserCheck, History, RefreshCw, CalendarCheck, RotateCcw } from 'lucide-react';

export default function SettingsView() {
  const {
    theme,
    updateTheme,
    updatePassword,
    configuredUsername,
    sheetsUrl,
    setSheetsUrl,
    pushToSheets,
    pullFromSheets,
    exportBackupJson,
    importBackupJson,
    anonymizeForGitHub,
    togglePrivacyMode,
    dailyBackups,
    restoreDailyBackup,
    downloadDailyBackup,
    createManualBackup,
  } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [tempSheetsUrl, setTempSheetsUrl] = useState(sheetsUrl);
  const [anonConfirm, setAnonConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 4) {
      alert('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const ok = await updatePassword(currentPass, newPass);
    if (ok) {
      setCurrentPass('');
      setNewPass('');
    }
  };

  const handleSaveSheets = () => {
    setSheetsUrl(tempSheetsUrl.trim());
  };

  const handleAnonymize = () => {
    if (window.confirm('¿Seguro que deseas reemplazar los nombres de clientes y placas reales por nombres demo para publicar en GitHub? Esta acción guardará datos ficticios.')) {
      anonymizeForGitHub();
      setAnonConfirm(true);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* GitHub Security & Privacy Inspector Panel */}
      <div className="bg-gradient-to-br from-[#1b222b] to-[#14181c] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Github className="w-5 h-5 text-amber-400" />
            <span>Seguridad para Publicación en GitHub</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full">
              AUDITADO SAFE
            </span>
          </h3>

          <button
            onClick={togglePrivacyMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              theme.privacyMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>{theme.privacyMode ? 'Modo Oculto / Privacidad ACTIVO' : 'Activar Modo Privacidad'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Esta aplicación ha sido verificada para su publicación en repositorios públicos de GitHub. No contiene claves API ni credenciales expuestas en el código fuente. Los datos de la empresa viven de forma local en tu navegador y/o en tu Google Sheet personal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-[#212933]/80 border border-[#2e3944] rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero API Keys / Secrets expuestos en código</span>
          </div>
          <div className="bg-[#212933]/80 border border-[#2e3944] rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Base de Datos local y desacoplada en contenedor</span>
          </div>
          <div className="bg-[#212933]/80 border border-[#2e3944] rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Mascarado automático de RUCs, teléfonos y montos</span>
          </div>
          <div className="bg-[#212933]/80 border border-[#2e3944] rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Protección PIN personalizable en navegador</span>
          </div>
        </div>

        {/* Anonymize Button */}
        <div className="pt-3 border-t border-[#2e3944] flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-slate-200">Anonimizar Datos de la Empresa</div>
            <div className="text-[11px] text-slate-400">Transforma RUCs y nombres reales en datos genéricos para demos en GitHub.</div>
          </div>
          <button
            onClick={handleAnonymize}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Anonimizar para GitHub</span>
          </button>
        </div>
      </div>

      {/* Automatic Daily Backups System */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>Respaldo Automático Diario (Últimas 30 Fotos)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cada día que abres la app, guarda una "foto" automática de todos tus datos con fecha. Además, si tienes Google Sheets conectado, ese ya es tu respaldo en tiempo real.
            </p>
          </div>

          <button
            onClick={createManualBackup}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/10"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Crear Foto de Respaldo Ahora</span>
          </button>
        </div>

        <div className="pt-2">
          {dailyBackups.length === 0 ? (
            <div className="p-4 bg-[#14181c] border border-[#2e3944] rounded-xl text-xs text-slate-400 text-center">
              No hay fotos de respaldo acumuladas aún. Se creará una automáticamente.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {dailyBackups.map((backup) => (
                <div
                  key={backup.id}
                  className="bg-[#14181c] border border-[#2e3944] hover:border-slate-600 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{backup.formattedDate}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({backup.dateKey})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{backup.recordsCount.viajes} viajes</span>
                        <span>•</span>
                        <span>{backup.recordsCount.clientes} clientes</span>
                        <span>•</span>
                        <span>{backup.recordsCount.vehiculos} veh</span>
                        <span>•</span>
                        <span>{backup.recordsCount.cuentas} cuentas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreDailyBackup(backup.id)}
                      className="px-3 py-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-amber-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-[#2e3944] transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      onClick={() => downloadDailyBackup(backup.id)}
                      className="px-3 py-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-[#2e3944] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Customization */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          Personalización Visual & Tema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-semibold mb-2">
              Modo de Color de Interfaz
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark Zenith' },
                { id: 'industrial', label: 'Industrial Sky' },
                { id: 'light', label: 'Light Clean' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateTheme({ mode: m.id as any })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    theme.mode === m.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#1b2127] border-[#2e3944] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs text-slate-400 uppercase font-semibold">
              Opciones de la Barra
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.showEventStreamBanner}
                onChange={(e) => updateTheme({ showEventStreamBanner: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[#1b2127] border-[#2e3944]"
              />
              <span className="text-xs text-slate-200">Mostrar Ticker de Microservicios en la cabecera</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span>Credenciales y Seguridad (SHA-256 Encriptado)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Usuario activo: <strong className="text-amber-300 font-mono">{configuredUsername || 'Configurado'}</strong>. La contraseña vive encriptada en tu navegador de forma local.
        </p>

        <div className="space-y-3 max-w-md pt-1">
          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Nueva clave (mínimo 4 caracteres)"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/10"
          >
            <Lock className="w-4 h-4" />
            <span>Actualizar Contraseña Encriptada</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Sync */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Cloud className="w-5 h-5 text-amber-400" />
          Sincronización Externa con Google Sheets
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pega la URL de tu Google Apps Script (Web App) para respaldar automáticamente clientes, viajes, flota y finanzas en tu hoja de cálculo compartida.
        </p>

        <div className="space-y-3 pt-1">
          <input
            type="text"
            value={tempSheetsUrl}
            onChange={(e) => setTempSheetsUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSaveSheets}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Guardar URL
            </button>
            <button
              onClick={() => pushToSheets()}
              className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Subir a Sheets
            </button>
            <button
              onClick={() => pullFromSheets()}
              className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Traer de Sheets
            </button>
          </div>
        </div>
      </div>

      {/* Local Backup */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-400" />
          Respaldo Local de Datos (.JSON)
        </h3>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            onClick={exportBackupJson}
            className="px-4 py-2.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-[#2e3944]"
          >
            <Download className="w-4 h-4" /> Exportar Copia JSON
          </button>

          <label className="px-4 py-2.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-[#2e3944] relative">
            <Upload className="w-4 h-4" />
            <span>Restaurar Copia JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importBackupJson(file);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
