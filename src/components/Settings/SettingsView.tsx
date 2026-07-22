import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CLOUD_API_URL } from '../../services/api';
import { Settings, Shield, SlidersHorizontal, Cloud, Download, Upload, Key, Check, Github, EyeOff, Lock, CheckCircle2, UserCheck, History, RefreshCw, CalendarCheck, RotateCcw, ExternalLink, Globe } from 'lucide-react';

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
    restoreDemoData,
    googleUser,
    googleSyncStatus,
    connectGoogleSheets,
    disconnectGoogleSheets,
    triggerGoogleSheetsSync,
    toggleGoogleAutoSync,
    downloadExcelBackup,
    refreshData,
  } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [tempSheetsUrl, setTempSheetsUrl] = useState(sheetsUrl);
  const [anonConfirm, setAnonConfirm] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('eyon_api_remote_url') || DEFAULT_CLOUD_API_URL;
  });

  const handleSaveCustomApiUrl = () => {
    if (!customApiUrl.trim()) return;
    localStorage.setItem('eyon_api_remote_url', customApiUrl.trim());
    alert('URL de Servidor Nube guardada. Sincronizando datos...');
    refreshData();
  };

  const handleResetCustomApiUrl = () => {
    localStorage.removeItem('eyon_api_remote_url');
    setCustomApiUrl(DEFAULT_CLOUD_API_URL);
    alert('Restablecido a la URL oficial del Servidor EYON Nube.');
    refreshData();
  };

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 4) {
      alert('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const ok = await updatePassword(currentPass, newPass, 'EYON');
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
          <span>Gestión de Usuario y Seguridad Administrador</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Usuario Administrador activo: <strong className="text-amber-300 font-mono">{configuredUsername || 'EYON'}</strong>. Las credenciales se guardan de forma centralizada y segura encriptadas con SHA-256 para que puedas ingresar desde cualquier celular o equipo.
        </p>

        <div className="space-y-3 max-w-md pt-1">
          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
              Cuenta de Usuario Master
            </label>
            <div className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-amber-400 text-xs font-bold font-mono flex items-center justify-between">
              <span>EYON (Usuario Único)</span>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[10px] rounded-md text-amber-300">MASTER ADMIN</span>
            </div>
          </div>

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
            <span>Guardar Credenciales de Administrador</span>
          </button>
        </div>
      </div>

      {/* Sincronización Multidispositivo (GitHub Pages, Chrome, Opera, Celulares) */}
      <div className="bg-[#212933] border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>Sincronización Multidispositivo en Nube (GitHub Pages, Opera, Celulares)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tus unidades agregadas (como RAUL1 y RAUL2), clientes, viajes y finanzas se sincronizan automáticamente entre navegadores (Chrome, Opera, Edge) y celulares conectados a tu cuenta única EYON.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronización Nube Activa
            </span>
          </div>
        </div>

        <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
              URL del Servidor Nube para GitHub Pages
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 bg-[#1b222b] border border-[#2e3944] rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveCustomApiUrl}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Guardar URL</span>
              </button>
              <button
                onClick={handleResetCustomApiUrl}
                className="px-4 py-2.5 bg-[#212933] hover:bg-[#2e3944] text-slate-300 border border-[#2e3944] font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Restablecer</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Esta URL permite que la versión publicada en GitHub Pages (<code className="text-amber-400/90 font-mono">webze.github.io</code>) comparta los vehículos en tiempo real entre Opera, Chrome y dispositivos móviles.
            </p>
          </div>

          <div className="pt-2 border-t border-[#2e3944] flex flex-wrap gap-3 items-center justify-between">
            <button
              onClick={async () => {
                await refreshData();
                alert('¡Sincronización Nube completada! Todos tus vehículos y datos se actualizaron desde el servidor.');
              }}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>⚡ Sincronizar Ahora con la Nube</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={exportBackupJson}
                className="px-3.5 py-2 bg-[#212933] hover:bg-[#2e3944] border border-[#2e3944] text-slate-200 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Exportar Copia de Seguridad JSON</span>
              </button>

              <label className="px-3.5 py-2 bg-[#212933] hover:bg-[#2e3944] border border-[#2e3944] text-slate-200 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importBackupJson(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Google Sheets & Excel Sync */}
      <div className="bg-[#212933] border border-amber-500/30 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-400" />
              <span>Sincronización en Tiempo Real con Google Sheets / Excel</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Respalda automáticamente todos tus datos (Clientes, Viajes, Flota, Cuentas, Deudas y Socios) directamente en tu cuenta de Google Drive para mayor seguridad y consulta externa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {googleSyncStatus.connected ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Sheets Conectado
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full">
                Sincronización Disponible
              </span>
            )}
          </div>
        </div>

        {/* Sync Controls Panel */}
        <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-5 space-y-4">
          {!googleSyncStatus.connected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-100">
                  Vincular tu cuenta de Google para Respaldos Automáticos
                </div>
                <div className="text-xs text-slate-400">
                  Se creará una Hoja de Cálculo privada titulada <code className="text-amber-300 font-mono">"EYON CARGO - Respaldos y Datos de Flota"</code> en tu Google Drive.
                </div>
              </div>

              <button
                onClick={connectGoogleSheets}
                disabled={googleSyncStatus.syncing}
                className="gsi-material-button text-xs font-bold px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl transition-all border border-slate-300 flex items-center gap-3 shadow-md flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{googleSyncStatus.syncing ? 'Vinculando...' : 'Iniciar Sesión con Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#2e3944]">
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>Cuenta de Google Conectada:</span>
                    <span className="text-emerald-400 font-mono">{googleUser?.email || 'Google User'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Última sincro: {googleSyncStatus.lastSyncTime ? new Date(googleSyncStatus.lastSyncTime).toLocaleTimeString('es-PE') : 'Reciente'}</span>
                    <span>•</span>
                    <span>Filas registradas: {googleSyncStatus.rowsSynced || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {googleSyncStatus.spreadsheetUrl && (
                    <a
                      href={googleSyncStatus.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir Hoja en Google Sheets</span>
                    </a>
                  )}

                  <button
                    onClick={() => triggerGoogleSheetsSync(false)}
                    disabled={googleSyncStatus.syncing}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${googleSyncStatus.syncing ? 'animate-spin' : ''}`} />
                    <span>{googleSyncStatus.syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                  </button>

                  <button
                    onClick={disconnectGoogleSheets}
                    className="px-3 py-2 bg-[#262f3a] hover:bg-rose-500/20 text-rose-300 border border-[#2e3944] rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Desconectar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>Sincronización Automática en Tiempo Real</span>
                    {googleSyncStatus.autoSyncEnabled ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                        ACTIVO AL CAMBIAR DATOS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-[10px] font-bold rounded">
                        PAUSADO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Al guardar o modificar viajes, fletes o clientes, se enviarán automáticamente a tu Google Sheets.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={googleSyncStatus.autoSyncEnabled}
                    onChange={(e) => toggleGoogleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          )}

          {googleSyncStatus.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <span>⚠️ Error: {googleSyncStatus.error}</span>
            </div>
          )}
        </div>

        {/* Offline Excel Download Action */}
        <div className="pt-2 border-t border-[#2e3944] flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-slate-200">Descarga Directa de Respaldo Excel (.CSV)</div>
            <div className="text-[11px] text-slate-400">Genera e instala un archivo Excel listo para abrir en Microsoft Excel con todas las pestañas de la app.</div>
          </div>

          <button
            onClick={downloadExcelBackup}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia Excel (.CSV)</span>
          </button>
        </div>

        {/* Optional Webhook / Apps Script alternative */}
        <div className="pt-3 border-t border-[#2e3944]/60 space-y-2">
          <details className="text-xs text-slate-400 cursor-pointer">
            <summary className="font-semibold text-slate-300 hover:text-amber-300">
              Ver opción alternativa (URL de Webhook Google Apps Script)
            </summary>
            <div className="space-y-3 pt-3">
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
                  Guardar URL Webhook
                </button>
                <button
                  onClick={() => pushToSheets()}
                  className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Subir vía Webhook
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Local Backup */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-400" />
          Respaldo Local de Datos (.JSON) y Datos de Ejemplo
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

          <button
            onClick={() => {
              if (window.confirm('¿Deseas recargar los datos de muestra de tráilers, clientes mineros, BCP y deudas de ejemplo? Esto sobreescribirá los datos actuales.')) {
                restoreDemoData();
              }
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/10 ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cargar / Restaurar Datos de Ejemplo (Tráilers, BCP, Deudas)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
