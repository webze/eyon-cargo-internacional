import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Client,
  Trip,
  Vehicle,
  VehicleDocument,
  FuelLog,
  BankAccount,
  Debt,
  Payment,
  Partner,
  MicroserviceEvent,
  DashboardWidgetConfig,
  AppThemeConfig,
  DailyBackup,
  Ranfla,
  MaintenanceTask,
  VehicleExpense,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_TRIPS,
  INITIAL_VEHICLES,
  INITIAL_ACCOUNTS,
  INITIAL_DEBTS,
  INITIAL_PAYMENTS,
  INITIAL_PARTNERS,
} from '../data/initialData';
import * as api from '../services/api';
import { hashPassword } from '../utils/crypto';
import { initAuthListener, googleSignIn, googleLogout } from '../services/googleAuth';
import { findOrCreateSpreadsheet, syncAllDataToGoogleSheets, downloadOfflineExcelBackup } from '../services/googleSheetsService';
import { User } from 'firebase/auth';

const GOOGLE_SPREADSHEET_ID_KEY = 'eyon_google_spreadsheet_id';
const GOOGLE_AUTOSYNC_KEY = 'eyon_google_autosync_enabled';

const STORAGE_KEY = 'eyon_cargo_data_v3';
const PIN_KEY = 'eyon_cargo_pin';
const AUTH_USER_KEY = 'eyon_cargo_auth_user';
const AUTH_PASS_KEY = 'eyon_cargo_auth_pass_hash';
const SHEETS_URL_KEY = 'eyon_cargo_sheets_url';
const WIDGETS_KEY = 'eyon_cargo_widgets';
const THEME_KEY = 'eyon_cargo_theme';
const DAILY_BACKUPS_KEY = 'eyon_daily_backups';

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'stats_overview', title: 'Resumen Estadístico Operativo', visible: true, order: 1 },
  { id: 'financial_summary', title: 'Balance de Liquidez Disponible', visible: true, order: 2 },
  { id: 'charts_pie_overview', title: 'Análisis Gráficos Circulares de Operación y Fletes', visible: true, order: 3 },
  { id: 'compliance_alerts', title: 'Alertas de Vencimiento de Papeles (SUTRAN / MTC / SUNAT)', visible: true, order: 4 },
  { id: 'upcoming_trips', title: 'Próximos Viajes y Fletes Asignados', visible: true, order: 5 },
  { id: 'event_stream', title: 'Consola de Microservicios y Eventos en Tiempo Real', visible: true, order: 6 },
  { id: 'debt_alerts', title: 'Calendario de Vencimiento de Deudas', visible: true, order: 7 },
];

const DEFAULT_THEME: AppThemeConfig = {
  mode: 'dark',
  accentColor: 'amber',
  compactMode: false,
  showEventStreamBanner: false,
  autoSyncSheets: false,
  privacyMode: false,
};

interface AppContextType {
  // State
  clientes: Client[];
  viajes: Trip[];
  vehiculos: Vehicle[];
  cuentas: BankAccount[];
  deudas: Debt[];
  pagos: Payment[];
  socios: Partner[];
  events: MicroserviceEvent[];
  theme: AppThemeConfig;
  widgets: DashboardWidgetConfig[];
  isLoggedIn: boolean;
  hasConfiguredPin: boolean;
  hasConfiguredUser: boolean;
  configuredUsername: string;
  sheetsUrl: string;
  toast: string | null;
  syncing: boolean;
  lastSyncTime: string | null;

  // Sidebar & Layout State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Backups
  dailyBackups: DailyBackup[];
  restoreDailyBackup: (backupId: string) => Promise<void>;
  downloadDailyBackup: (backupId: string) => void;
  createManualBackup: () => void;

  // Actions
  login: (pin: string) => boolean;
  setupInitialPin: (pin: string) => void;
  setupInitialUser: (username: string, pass: string) => Promise<void>;
  loginWithCredentials: (username: string, pass: string) => Promise<boolean>;
  updatePassword: (currentPass: string, newPass: string) => Promise<boolean>;
  logout: () => void;
  updatePin: (newPin: string) => void;
  showToastMessage: (msg: string) => void;

  // Theme & Customization
  updateTheme: (newTheme: Partial<AppThemeConfig>) => void;
  togglePrivacyMode: () => void;
  anonymizeForGitHub: () => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resetWidgetLayout: () => void;

  // CRUD Client
  addClient: (client: Omit<Client, 'id' | 'fechaRegistro'>) => Promise<void>;
  editClient: (id: string, client: Partial<Client>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;

  // CRUD Trip
  addTrip: (trip: Omit<Trip, 'id'>) => Promise<void>;
  editTrip: (id: string, trip: Partial<Trip>) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;

  // CRUD Vehicle
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'documentos' | 'combustible'>) => Promise<void>;
  editVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;

  // Vehicle sub-items & Km / Ranfla / Mantenimiento / Gastos
  addVehicleDoc: (vehicleId: string, doc: Omit<VehicleDocument, 'id'>) => Promise<void>;
  editVehicleDoc: (vehicleId: string, docId: string, doc: Partial<VehicleDocument>) => Promise<void>;
  removeVehicleDoc: (vehicleId: string, docId: string) => Promise<void>;

  addFuelLog: (vehicleId: string, fuel: Omit<FuelLog, 'id'>) => Promise<void>;
  editFuelLog: (vehicleId: string, fuelId: string, fuel: Partial<FuelLog>) => Promise<void>;
  removeFuelLog: (vehicleId: string, fuelId: string) => Promise<void>;

  updateVehicleKm: (vehicleId: string, km: number) => Promise<void>;
  updateRanfla: (vehicleId: string, ranflaData: Ranfla) => Promise<void>;
  addRanflaDoc: (vehicleId: string, docData: Omit<VehicleDocument, 'id'>) => Promise<void>;
  removeRanflaDoc: (vehicleId: string, docId: string) => Promise<void>;

  addMaintenanceTask: (vehicleId: string, taskData: Omit<MaintenanceTask, 'id'>) => Promise<void>;
  updateMaintenanceTask: (vehicleId: string, taskId: string, taskData: Partial<MaintenanceTask>) => Promise<void>;
  removeMaintenanceTask: (vehicleId: string, taskId: string) => Promise<void>;

  addVehicleExpense: (vehicleId: string, expenseData: Omit<VehicleExpense, 'id'>) => Promise<void>;
  removeVehicleExpense: (vehicleId: string, expenseId: string) => Promise<void>;

  // CRUD Finance
  addAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  editAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;

  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  editDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  removeDebt: (id: string) => Promise<void>;
  payDebtInstalment: (debtId: string) => Promise<void>;

  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  editPayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  removePayment: (id: string) => Promise<void>;

  addPartner: (partner: Omit<Partner, 'id' | 'pagos'>) => Promise<void>;
  editPartner: (id: string, partner: Partial<Partner>) => Promise<void>;
  removePartner: (id: string) => Promise<void>;
  addPartnerPayout: (partnerId: string, payout: { fecha: string; monto: number; concepto: string }) => Promise<void>;

  // External Sync & Demo
  googleUser: User | null;
  googleToken: string | null;
  googleSyncStatus: {
    connected: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSyncTime?: number;
    autoSyncEnabled: boolean;
    syncing: boolean;
    rowsSynced?: number;
    error?: string;
  };
  connectGoogleSheets: () => Promise<boolean>;
  disconnectGoogleSheets: () => Promise<void>;
  triggerGoogleSheetsSync: (silent?: boolean) => Promise<boolean>;
  toggleGoogleAutoSync: (enabled: boolean) => void;
  downloadExcelBackup: () => void;

  setSheetsUrl: (url: string) => void;
  pushToSheets: (silent?: boolean) => Promise<void>;
  pullFromSheets: () => Promise<void>;
  exportBackupJson: () => void;
  importBackupJson: (file: File) => Promise<void>;
  restoreDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [viajes, setViajes] = useState<Trip[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  const [cuentas, setCuentas] = useState<BankAccount[]>([]);
  const [deudas, setDeudas] = useState<Debt[]>([]);
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [socios, setSocios] = useState<Partner[]>([]);
  const [events, setEvents] = useState<MicroserviceEvent[]>([]);

  const [theme, setTheme] = useState<AppThemeConfig>(DEFAULT_THEME);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasConfiguredPin, setHasConfiguredPin] = useState<boolean>(false);
  const [hasConfiguredUser, setHasConfiguredUser] = useState<boolean>(false);
  const [configuredUsername, setConfiguredUsername] = useState<string>('');
  const [sheetsUrl, setSheetsUrlState] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Sidebar & Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('eyon_sidebar_collapsed') === '1';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Daily Backups State
  const [dailyBackups, setDailyBackups] = useState<DailyBackup[]>([]);

  // Google OAuth & Realtime Sheets Sync State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleSyncStatus, setGoogleSyncStatus] = useState<{
    connected: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSyncTime?: number;
    autoSyncEnabled: boolean;
    syncing: boolean;
    rowsSynced?: number;
    error?: string;
  }>(() => {
    const savedSheetId = localStorage.getItem(GOOGLE_SPREADSHEET_ID_KEY) || undefined;
    const autoSyncVal = localStorage.getItem(GOOGLE_AUTOSYNC_KEY);
    return {
      connected: false,
      spreadsheetId: savedSheetId,
      spreadsheetUrl: savedSheetId ? `https://docs.google.com/spreadsheets/d/${savedSheetId}` : undefined,
      autoSyncEnabled: autoSyncVal === null ? true : autoSyncVal === 'true',
      syncing: false,
    };
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('eyon_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  // Initialize
  useEffect(() => {
    // PIN & User Configuration check
    const savedPin = localStorage.getItem(PIN_KEY);
    setHasConfiguredPin(!!savedPin);

    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    const savedPassHash = localStorage.getItem(AUTH_PASS_KEY);
    if (savedUser && savedPassHash) {
      setHasConfiguredUser(true);
      setConfiguredUsername(savedUser);
    }

    // Session login
    if (sessionStorage.getItem('eyon_logged') === '1') {
      setIsLoggedIn(true);
    }

    // Saved PIN & Sheets URL & Settings
    const savedSheetsUrl = localStorage.getItem(SHEETS_URL_KEY) || '';
    setSheetsUrlState(savedSheetsUrl);

    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) setTheme(JSON.parse(savedTheme));

      const savedWidgets = localStorage.getItem(WIDGETS_KEY);
      if (savedWidgets) setWidgets(JSON.parse(savedWidgets));

      const savedBackups = localStorage.getItem(DAILY_BACKUPS_KEY);
      if (savedBackups) setDailyBackups(JSON.parse(savedBackups));
    } catch {
      // ignore
    }

    // Initial fetch from backend API
    loadAllData();

    // Poll live events every 5 seconds
    const interval = setInterval(() => {
      api.fetchEvents().then((evs) => {
        if (evs && evs.length) setEvents(evs);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Automatic Daily Backup Check
  const checkAutoDailyBackup = (
    c: Client[],
    v: Trip[],
    veh: Vehicle[],
    cta: BankAccount[],
    d: Debt[],
    p: Payment[],
    s: Partner[]
  ) => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const existingRaw = localStorage.getItem(DAILY_BACKUPS_KEY);
      let list: DailyBackup[] = existingRaw ? JSON.parse(existingRaw) : [];

      const hasToday = list.some((b) => b.dateKey === todayKey);

      if (!hasToday) {
        const newBackup: DailyBackup = {
          id: `backup-${Date.now()}`,
          dateKey: todayKey,
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          recordsCount: {
            clientes: c.length,
            viajes: v.length,
            vehiculos: veh.length,
            cuentas: cta.length,
            deudas: d.length,
            pagos: p.length,
            socios: s.length,
          },
          data: {
            clientes: c,
            viajes: v,
            vehiculos: veh,
            cuentas: cta,
            deudas: d,
            pagos: p,
            socios: s,
            events: [],
            theme,
            widgets,
          },
        };

        const updatedList = [newBackup, ...list].slice(0, 30); // Keep last 30
        setDailyBackups(updatedList);
        localStorage.setItem(DAILY_BACKUPS_KEY, JSON.stringify(updatedList));
      } else {
        setDailyBackups(list);
      }
    } catch (e) {
      console.error('Error handling auto daily backup', e);
    }
  };

  const loadAllData = async () => {
    setSyncing(true);
    let loadedClientes: Client[] = [];
    let loadedViajes: Trip[] = [];
    let loadedVehiculos: Vehicle[] = [];
    let loadedCuentas: BankAccount[] = [];
    let loadedDeudas: Debt[] = [];
    let loadedPagos: Payment[] = [];
    let loadedSocios: Partner[] = [];

    try {
      // Sync auth status with backend server so all devices share the same single user setup
      const authStatus = await api.fetchAuthStatus();
      if (authStatus && authStatus.configured) {
        setHasConfiguredUser(true);
        setConfiguredUsername(authStatus.username);
        localStorage.setItem(AUTH_USER_KEY, authStatus.username);
      } else {
        const savedUser = localStorage.getItem(AUTH_USER_KEY);
        const savedPassHash = localStorage.getItem(AUTH_PASS_KEY);
        if (savedUser && savedPassHash) {
          setHasConfiguredUser(true);
          setConfiguredUsername(savedUser);
          api.setupAuthServer(savedUser, savedPassHash).catch(() => {});
        }
      }

      // First try full server state
      const serverState = await api.fetchFullSyncState();
      if (serverState) {
        if (serverState.clientes) loadedClientes = serverState.clientes;
        if (serverState.viajes) loadedViajes = serverState.viajes;
        if (serverState.vehiculos) loadedVehiculos = serverState.vehiculos;
        if (serverState.cuentas) loadedCuentas = serverState.cuentas;
        if (serverState.deudas) loadedDeudas = serverState.deudas;
        if (serverState.pagos) loadedPagos = serverState.pagos;
        if (serverState.socios) loadedSocios = serverState.socios;
      } else {
        // Fallback to local storage
        const rawLocal = localStorage.getItem(STORAGE_KEY);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          loadedClientes = parsed.clientes || [];
          loadedViajes = parsed.viajes || [];
          loadedVehiculos = parsed.vehiculos || [];
          loadedCuentas = parsed.cuentas || [];
          loadedDeudas = parsed.deudas || [];
          loadedPagos = parsed.pagos || [];
          loadedSocios = parsed.socios || [];
        }
      }

      // If empty (e.g. first run or GitHub Pages SPA), populate with rich pre-filled demo data
      if (
        loadedClientes.length === 0 &&
        loadedVehiculos.length === 0 &&
        loadedCuentas.length === 0
      ) {
        loadedClientes = INITIAL_CLIENTS;
        loadedViajes = INITIAL_TRIPS;
        loadedVehiculos = INITIAL_VEHICLES;
        loadedCuentas = INITIAL_ACCOUNTS;
        loadedDeudas = INITIAL_DEBTS;
        loadedPagos = INITIAL_PAYMENTS;
        loadedSocios = INITIAL_PARTNERS;

        const initialDataSet = {
          clientes: INITIAL_CLIENTS,
          viajes: INITIAL_TRIPS,
          vehiculos: INITIAL_VEHICLES,
          cuentas: INITIAL_ACCOUNTS,
          deudas: INITIAL_DEBTS,
          pagos: INITIAL_PAYMENTS,
          socios: INITIAL_PARTNERS,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDataSet));
        api.syncFullState(initialDataSet).catch(() => {});
      }

      setClientes(loadedClientes);
      setViajes(loadedViajes);
      setVehiculos(loadedVehiculos);
      setCuentas(loadedCuentas);
      setDeudas(loadedDeudas);
      setPagos(loadedPagos);
      setSocios(loadedSocios);

      // Perform Auto Daily Backup check
      checkAutoDailyBackup(
        loadedClientes,
        loadedViajes,
        loadedVehiculos,
        loadedCuentas,
        loadedDeudas,
        loadedPagos,
        loadedSocios
      );

      const evs = await api.fetchEvents();
      setEvents(evs || []);

      setLastSyncTime(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setSyncing(false);
    }
  };

  // Save to local & server sync
  const saveState = async (updated?: {
    clientes?: Client[];
    viajes?: Trip[];
    vehiculos?: Vehicle[];
    cuentas?: BankAccount[];
    deudas?: Debt[];
    pagos?: Payment[];
    socios?: Partner[];
  }) => {
    const c = updated?.clientes ?? clientes;
    const v = updated?.viajes ?? viajes;
    const veh = updated?.vehiculos ?? vehiculos;
    const cta = updated?.cuentas ?? cuentas;
    const d = updated?.deudas ?? deudas;
    const p = updated?.pagos ?? pagos;
    const s = updated?.socios ?? socios;

    const fullData = { clientes: c, viajes: v, vehiculos: veh, cuentas: cta, deudas: d, pagos: p, socios: s };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));

    // Async push to server
    api.syncFullState(fullData).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      api.fetchEvents().then((evs) => setEvents(evs || []));
    });
  };

  // Auth & User Credentials Management (Single Account Server Sync)
  const setupInitialUser = async (username: string, pass: string) => {
    const hash = await hashPassword(pass);
    const cleanUser = username.trim();
    localStorage.setItem(AUTH_USER_KEY, cleanUser);
    localStorage.setItem(AUTH_PASS_KEY, hash);
    setHasConfiguredUser(true);
    setConfiguredUsername(cleanUser);

    // Guardar credenciales en el servidor para que cualquier otro dispositivo se conecte a esta cuenta
    await api.setupAuthServer(cleanUser, hash);

    sessionStorage.setItem('eyon_logged', '1');
    setIsLoggedIn(true);
    showToastMessage(`Usuario "${cleanUser}" registrado exitosamente en el servidor con clave encriptada.`);
  };

  const loginWithCredentials = async (username: string, pass: string): Promise<boolean> => {
    const hash = await hashPassword(pass);
    const cleanUser = username.trim();

    // 1. Intentar validar autenticación contra el servidor central
    const serverOk = await api.loginAuthServer(cleanUser, hash);
    if (serverOk) {
      localStorage.setItem(AUTH_USER_KEY, cleanUser);
      localStorage.setItem(AUTH_PASS_KEY, hash);
      sessionStorage.setItem('eyon_logged', '1');
      setIsLoggedIn(true);
      showToastMessage(`Bienvenido de nuevo, ${cleanUser}`);
      return true;
    }

    // 2. Comprobación de respaldo local en navegador
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    const savedPassHash = localStorage.getItem(AUTH_PASS_KEY);

    if (savedUser && savedPassHash && cleanUser.toLowerCase() === savedUser.trim().toLowerCase() && hash === savedPassHash) {
      sessionStorage.setItem('eyon_logged', '1');
      setIsLoggedIn(true);
      showToastMessage(`Bienvenido de nuevo, ${savedUser}`);
      return true;
    }

    return false;
  };

  const updatePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    const currentHash = await hashPassword(currentPass);
    const newHash = await hashPassword(newPass);

    const serverOk = await api.updatePasswordServer(currentHash, newHash);
    if (!serverOk) {
      const savedPassHash = localStorage.getItem(AUTH_PASS_KEY);
      if (savedPassHash && currentHash !== savedPassHash) {
        showToastMessage('La contraseña actual ingresada es incorrecta');
        return false;
      }
    }

    localStorage.setItem(AUTH_PASS_KEY, newHash);
    showToastMessage('Contraseña encriptada actualizada correctamente en el servidor');
    return true;
  };

  const setupInitialPin = (pin: string) => {
    localStorage.setItem(PIN_KEY, pin);
    setHasConfiguredPin(true);
    sessionStorage.setItem('eyon_logged', '1');
    setIsLoggedIn(true);
    showToastMessage('Código PIN de seguridad creado e iniciado correctamente.');
  };

  const login = (pin: string) => {
    const savedPin = localStorage.getItem(PIN_KEY);
    if (!savedPin) {
      setupInitialPin(pin);
      return true;
    }
    if (pin === savedPin) {
      sessionStorage.setItem('eyon_logged', '1');
      setIsLoggedIn(true);
      showToastMessage('Bienvenido a EYON Cargo Internacional');
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('eyon_logged');
    setIsLoggedIn(false);
  };

  const updatePin = (newPin: string) => {
    localStorage.setItem(PIN_KEY, newPin);
    setHasConfiguredPin(true);
    showToastMessage('Código de acceso actualizado correctamente');
  };

  // Backups Management
  const createManualBackup = () => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const newBackup: DailyBackup = {
        id: `backup-${Date.now()}`,
        dateKey: todayKey,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        recordsCount: {
          clientes: clientes.length,
          viajes: viajes.length,
          vehiculos: vehiculos.length,
          cuentas: cuentas.length,
          deudas: deudas.length,
          pagos: pagos.length,
          socios: socios.length,
        },
        data: {
          clientes,
          viajes,
          vehiculos,
          cuentas,
          deudas,
          pagos,
          socios,
          events: [],
          theme,
          widgets,
        },
      };

      const updated = [newBackup, ...dailyBackups.filter((b) => b.id !== newBackup.id)].slice(0, 30);
      setDailyBackups(updated);
      localStorage.setItem(DAILY_BACKUPS_KEY, JSON.stringify(updated));
      showToastMessage(`Copia de respaldo manual creada con éxito (${newBackup.formattedDate})`);
    } catch {
      showToastMessage('Error al crear copia de respaldo');
    }
  };

  const restoreDailyBackup = async (backupId: string) => {
    const backup = dailyBackups.find((b) => b.id === backupId);
    if (!backup || !backup.data) {
      showToastMessage('No se encontró el respaldo seleccionado');
      return;
    }

    try {
      const d = backup.data;
      setClientes(d.clientes || []);
      setViajes(d.viajes || []);
      setVehiculos(d.vehiculos || []);
      setCuentas(d.cuentas || []);
      setDeudas(d.deudas || []);
      setPagos(d.pagos || []);
      setSocios(d.socios || []);

      await saveState({
        clientes: d.clientes,
        viajes: d.viajes,
        vehiculos: d.vehiculos,
        cuentas: d.cuentas,
        deudas: d.deudas,
        pagos: d.pagos,
        socios: d.socios,
      });

      showToastMessage(`Sistema restaurado al estado del ${backup.formattedDate}`);
    } catch {
      showToastMessage('Error al restaurar respaldo seleccionado');
    }
  };

  const downloadDailyBackup = (backupId: string) => {
    const backup = dailyBackups.find((b) => b.id === backupId);
    if (!backup) {
      showToastMessage('Respaldo no encontrado');
      return;
    }
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyon_backup_${backup.dateKey}_${backup.id.slice(-6)}.json`;
    a.click();
    showToastMessage(`Descargando respaldo del ${backup.formattedDate}`);
  };

  // Customization
  const updateTheme = (newTheme: Partial<AppThemeConfig>) => {
    const merged = { ...theme, ...newTheme };
    setTheme(merged);
    localStorage.setItem(THEME_KEY, JSON.stringify(merged));
    showToastMessage('Preferencias de interfaz guardadas');
  };

  const togglePrivacyMode = () => {
    const nextVal = !theme.privacyMode;
    const merged = { ...theme, privacyMode: nextVal };
    setTheme(merged);
    localStorage.setItem(THEME_KEY, JSON.stringify(merged));
    showToastMessage(nextVal ? 'Modo Oculto / Privacidad ACTIVADO (MASCARADO DE DATOS)' : 'Modo Privacidad Desactivado (Datos visibles)');
  };

  const anonymizeForGitHub = async () => {
    const anonClients: Client[] = clientes.map((c, i) => ({
      ...c,
      nombre: `CLIENTE DEMO CORPORATIVO #${i + 1}`,
      ruc: `20${Math.floor(100000000 + Math.random() * 90000000)}1`,
      telefono: '999-000-111',
      contacto: 'Contacto Representante',
      email: `contacto@democliente${i + 1}.pe`,
    }));

    const anonVehicles: Vehicle[] = vehiculos.map((v, i) => ({
      ...v,
      placa: v.tipo === 'Tráiler' ? 'V7A-982' : `ABC-${100 + i}`,
      notas: 'Unidad tráiler de carga pesada asignada a operaciones.',
    }));

    setClientes(anonClients);
    setVehiculos(anonVehicles);
    await saveState({ clientes: anonClients, vehiculos: anonVehicles });
    showToastMessage('Datos anonimizados para publicación segura en GitHub');
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w));
    setWidgets(updated);
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(updated));
    showToastMessage('Módulo de dashboard actualizado');
  };

  const resetWidgetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(DEFAULT_WIDGETS));
    showToastMessage('Diseño de dashboard restaurado');
  };

  // CRUD Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'fechaRegistro'>) => {
    const newClient = await api.createClient(clientData);
    const updated = [...clientes, newClient];
    setClientes(updated);
    saveState({ clientes: updated });
    showToastMessage('Cliente registrado con éxito');
  };

  const editClient = async (id: string, clientData: Partial<Client>) => {
    const updatedClient = await api.updateClient(id, clientData);
    const updated = clientes.map((c) => (c.id === id ? updatedClient : c));
    setClientes(updated);
    saveState({ clientes: updated });
    showToastMessage('Cliente actualizado');
  };

  const removeClient = async (id: string) => {
    await api.deleteClient(id);
    const updated = clientes.filter((c) => c.id !== id);
    setClientes(updated);
    saveState({ clientes: updated });
    showToastMessage('Cliente eliminado');
  };

  // CRUD Trips
  const addTrip = async (tripData: Omit<Trip, 'id'>) => {
    const newTrip = await api.createTrip(tripData);
    const updated = [newTrip, ...viajes];
    setViajes(updated);
    saveState({ viajes: updated });
    showToastMessage('Viaje registrado y emitido al bus de eventos');
  };

  const editTrip = async (id: string, tripData: Partial<Trip>) => {
    const updatedTrip = await api.updateTrip(id, tripData);
    const updated = viajes.map((v) => (v.id === id ? updatedTrip : v));
    setViajes(updated);
    saveState({ viajes: updated });
    showToastMessage('Viaje modificado');
  };

  const removeTrip = async (id: string) => {
    await api.deleteTrip(id);
    const updated = viajes.filter((v) => v.id !== id);
    setViajes(updated);
    saveState({ viajes: updated });
    showToastMessage('Viaje cancelado/eliminado');
  };

  // CRUD Vehicles
  const addVehicle = async (vehData: Omit<Vehicle, 'id' | 'documentos' | 'combustible'>) => {
    const newVeh = await api.createVehicle(vehData);
    const updated = [...vehiculos, newVeh];
    setVehiculos(updated);
    saveState({ vehiculos: updated });
    showToastMessage('Vehículo añadido a la flota');
  };

  const editVehicle = async (id: string, vehData: Partial<Vehicle>) => {
    const updatedVeh = await api.updateVehicle(id, vehData);
    const updated = vehiculos.map((v) => (v.id === id ? updatedVeh : v));
    setVehiculos(updated);
    saveState({ vehiculos: updated });
    showToastMessage('Datos de vehículo actualizados');
  };

  const removeVehicle = async (id: string) => {
    await api.deleteVehicle(id);
    const updated = vehiculos.filter((v) => v.id !== id);
    setVehiculos(updated);
    saveState({ vehiculos: updated });
    showToastMessage('Vehículo eliminado');
  };

  // Vehicle sub-items
  const addVehicleDoc = async (vehicleId: string, docData: Omit<VehicleDocument, 'id'>) => {
    const newDoc: VehicleDocument = { id: 'doc_' + Date.now().toString(36), ...docData };
    const updatedVehicles = vehiculos.map((v) =>
      v.id === vehicleId ? { ...v, documentos: [...(v.documentos || []), newDoc] } : v
    );
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Documento adjuntado a la unidad');
  };

  const editVehicleDoc = async (vehicleId: string, docId: string, docData: Partial<VehicleDocument>) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      const docs = (v.documentos || []).map((d) => (d.id === docId ? { ...d, ...docData } : d));
      return { ...v, documentos: docs };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Documento actualizado');
  };

  const removeVehicleDoc = async (vehicleId: string, docId: string) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, documentos: (v.documentos || []).filter((d) => d.id !== docId) };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Documento eliminado');
  };

  const addFuelLog = async (vehicleId: string, fuelData: Omit<FuelLog, 'id'>) => {
    const newFuel: FuelLog = { id: 'comb_' + Date.now().toString(36), ...fuelData };
    const updatedVehicles = vehiculos.map((v) =>
      v.id === vehicleId ? { ...v, combustible: [newFuel, ...(v.combustible || [])] } : v
    );
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Carga de combustible registrada');
  };

  const editFuelLog = async (vehicleId: string, fuelId: string, fuelData: Partial<FuelLog>) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      const logs = (v.combustible || []).map((c) => (c.id === fuelId ? { ...c, ...fuelData } : c));
      return { ...v, combustible: logs };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Registro de combustible actualizado');
  };

  const removeFuelLog = async (vehicleId: string, fuelId: string) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, combustible: (v.combustible || []).filter((c) => c.id !== fuelId) };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Registro de combustible eliminado');
  };

  // Actualización de Kilometraje (Odómetro)
  const updateVehicleKm = async (vehicleId: string, km: number) => {
    const updatedVehicles = vehiculos.map((v) => (v.id === vehicleId ? { ...v, kmActual: km } : v));
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage(`Odómetro actualizado a ${km.toLocaleString('es-PE')} km`);
  };

  // Gestión de Ranfla / Carretea
  const updateRanfla = async (vehicleId: string, ranflaData: Ranfla) => {
    const updatedVehicles = vehiculos.map((v) => (v.id === vehicleId ? { ...v, ranfla: ranflaData } : v));
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Datos de la Ranfla / Carretea guardados con éxito');
  };

  const addRanflaDoc = async (vehicleId: string, docData: Omit<VehicleDocument, 'id'>) => {
    const newDoc: VehicleDocument = { id: 'doc_r' + Date.now().toString(36), ...docData };
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      const ranfla = v.ranfla || { placa: 'SIN-PLACA', tipo: 'Plataforma 3 Ejes', documentos: [] };
      return {
        ...v,
        ranfla: {
          ...ranfla,
          documentos: [...(ranfla.documentos || []), newDoc],
        },
      };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Documento de Ranfla registrado');
  };

  const removeRanflaDoc = async (vehicleId: string, docId: string) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId || !v.ranfla) return v;
      return {
        ...v,
        ranfla: {
          ...v.ranfla,
          documentos: (v.ranfla.documentos || []).filter((d) => d.id !== docId),
        },
      };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Documento de Ranfla eliminado');
  };

  // Mantenimiento Preventivo por Kilometraje
  const addMaintenanceTask = async (vehicleId: string, taskData: Omit<MaintenanceTask, 'id'>) => {
    const newTask: MaintenanceTask = { id: 'maint_' + Date.now().toString(36), ...taskData };
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, mantenimientos: [...(v.mantenimientos || []), newTask] };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Tarea de mantenimiento preventivo agregada');
  };

  const updateMaintenanceTask = async (vehicleId: string, taskId: string, taskData: Partial<MaintenanceTask>) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      const tasks = (v.mantenimientos || []).map((t) => (t.id === taskId ? { ...t, ...taskData } : t));
      return { ...v, mantenimientos: tasks };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Mantenimiento actualizado (Km registrado)');
  };

  const removeMaintenanceTask = async (vehicleId: string, taskId: string) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, mantenimientos: (v.mantenimientos || []).filter((t) => t.id !== taskId) };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Tarea de mantenimiento eliminada');
  };

  // Gastos / Repuestos / Llantas de Vehículo
  const addVehicleExpense = async (vehicleId: string, expenseData: Omit<VehicleExpense, 'id'>) => {
    const newExpense: VehicleExpense = { id: 'exp_' + Date.now().toString(36), ...expenseData };
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, gastos: [newExpense, ...(v.gastos || [])] };
    });
    setVehiculos(updatedVehicles);

    // Opcionalmente registrar como egreso en pagos para balance de liquidez
    const newPayment: Payment = {
      id: 'pag_' + Date.now().toString(36),
      tipo: 'Egreso',
      estado: 'Pagado',
      categoria: `Mantenimiento - ${expenseData.categoria}`,
      monto: expenseData.monto,
      fecha: expenseData.fecha,
      descripcion: `Gasto de Vehículo: ${expenseData.descripcion} (${expenseData.km} km)`,
    };
    const updatedPagos = [newPayment, ...pagos];
    setPagos(updatedPagos);

    saveState({ vehiculos: updatedVehicles, pagos: updatedPagos });
    showToastMessage('Gasto de vehículo registrado y descontado en finanzas');
  };

  const removeVehicleExpense = async (vehicleId: string, expenseId: string) => {
    const updatedVehicles = vehiculos.map((v) => {
      if (v.id !== vehicleId) return v;
      return { ...v, gastos: (v.gastos || []).filter((g) => g.id !== expenseId) };
    });
    setVehiculos(updatedVehicles);
    saveState({ vehiculos: updatedVehicles });
    showToastMessage('Gasto de vehículo eliminado');
  };

  // CRUD Finance
  const addAccount = async (accData: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = { id: 'cta_' + Date.now().toString(36), ...accData };
    const updated = [...cuentas, newAcc];
    setCuentas(updated);
    saveState({ cuentas: updated });
    showToastMessage('Cuenta bancaria registrada');
  };

  const editAccount = async (id: string, accData: Partial<BankAccount>) => {
    const updated = cuentas.map((c) => (c.id === id ? { ...c, ...accData } : c));
    setCuentas(updated);
    saveState({ cuentas: updated });
    showToastMessage('Cuenta bancaria actualizada');
  };

  const removeAccount = async (id: string) => {
    const updated = cuentas.filter((c) => c.id !== id);
    setCuentas(updated);
    saveState({ cuentas: updated });
    showToastMessage('Cuenta bancaria eliminada');
  };

  const addDebt = async (debtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = { id: 'deu_' + Date.now().toString(36), ...debtData };
    const updated = [...deudas, newDebt];
    setDeudas(updated);
    saveState({ deudas: updated });
    showToastMessage('Deuda o crédito vehicular registrado');
  };

  const editDebt = async (id: string, debtData: Partial<Debt>) => {
    const updated = deudas.map((d) => (d.id === id ? { ...d, ...debtData } : d));
    setDeudas(updated);
    saveState({ deudas: updated });
    showToastMessage('Registro de deuda actualizado');
  };

  const removeDebt = async (id: string) => {
    const updated = deudas.filter((d) => d.id !== id);
    setDeudas(updated);
    saveState({ deudas: updated });
    showToastMessage('Deuda eliminada');
  };

  const payDebtInstalment = async (debtId: string) => {
    const updated = deudas.map((d) => {
      if (d.id !== debtId) return d;
      const newPendiente = Math.max(0, d.pendiente - d.cuota);
      let newFecha = d.fecha;
      if (d.fecha) {
        const dt = new Date(d.fecha + 'T00:00:00');
        dt.setMonth(dt.getMonth() + 1);
        newFecha = dt.toISOString().slice(0, 10);
      }
      return { ...d, pendiente: newPendiente, fecha: newFecha };
    });
    setDeudas(updated);
    saveState({ deudas: updated });
    showToastMessage('Cuota de deuda registrada — Próximo pago reprogramado');
  };

  const addPayment = async (payData: Omit<Payment, 'id'>) => {
    const newPayment = await api.createPayment(payData);
    const updated = [newPayment, ...pagos];
    setPagos(updated);
    saveState({ pagos: updated });
    showToastMessage('Transacción financiera registrada');
  };

  const editPayment = async (id: string, payData: Partial<Payment>) => {
    const updated = pagos.map((p) => (p.id === id ? { ...p, ...payData } : p));
    setPagos(updated);
    saveState({ pagos: updated });
    showToastMessage('Pago actualizado');
  };

  const removePayment = async (id: string) => {
    const updated = pagos.filter((p) => p.id !== id);
    setPagos(updated);
    saveState({ pagos: updated });
    showToastMessage('Pago eliminado');
  };

  const addPartner = async (partnerData: Omit<Partner, 'id' | 'pagos'>) => {
    const newPartner: Partner = { id: 'soc_' + Date.now().toString(36), pagos: [], ...partnerData };
    const updated = [...socios, newPartner];
    setSocios(updated);
    saveState({ socios: updated });
    showToastMessage('Socio / dueño registrado');
  };

  const editPartner = async (id: string, partnerData: Partial<Partner>) => {
    const updated = socios.map((s) => (s.id === id ? { ...s, ...partnerData } : s));
    setSocios(updated);
    saveState({ socios: updated });
    showToastMessage('Ficha de socio actualizada');
  };

  const removePartner = async (id: string) => {
    const updated = socios.filter((s) => s.id !== id);
    setSocios(updated);
    saveState({ socios: updated });
    showToastMessage('Socio eliminado');
  };

  const addPartnerPayout = async (partnerId: string, payout: { fecha: string; monto: number; concepto: string }) => {
    const updated = socios.map((s) => {
      if (s.id !== partnerId) return s;
      const newPayout = { id: 'spag_' + Date.now().toString(36), ...payout };
      return { ...s, pagos: [newPayout, ...(s.pagos || [])] };
    });
    setSocios(updated);
    saveState({ socios: updated });
    showToastMessage('Pago a socio registrado correctamente');
  };

  // Google Sheets
  const setSheetsUrl = (url: string) => {
    setSheetsUrlState(url);
    localStorage.setItem(SHEETS_URL_KEY, url);
    showToastMessage(url ? 'URL de Google Sheets Web App guardada' : 'Sincronización con Google Sheets desactivada');
  };

  const pushToSheets = async (silent = false) => {
    if (!sheetsUrl) {
      if (!silent) showToastMessage('Primero ingresa la URL de tu Google Apps Script');
      return;
    }
    try {
      let cleanUrl = sheetsUrl.trim();
      if (cleanUrl.endsWith('/edit')) {
        cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
      } else if (cleanUrl.endsWith('/dev')) {
        cleanUrl = cleanUrl.replace(/\/dev$/, '/exec');
      }

      if (!cleanUrl.includes('script.google.com')) {
        if (!silent) showToastMessage('La URL debe comenzar con https://script.google.com/...');
        return;
      }

      const payload = {
        action: 'replaceAll',
        clientes,
        viajes,
        vehiculos,
        cuentas,
        deudas,
        pagos,
        socios,
      };

      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json && json.ok) {
        if (!silent) showToastMessage('¡Éxito! Todos los datos fueron guardados en Google Sheets');
      } else if (json && json.error) {
        if (!silent) showToastMessage(`Apps Script Error: ${json.error}`);
      } else {
        if (!silent) showToastMessage('Error en el script. Crea una NUEVA VERSIÓN en Apps Script');
      }
    } catch (err) {
      console.error('Error pushToSheets:', err);
      if (!silent) {
        showToastMessage('Error de conexión con Sheets. Asegúrate de publicar como "Cualquiera" (Anyone)');
      }
    }
  };

  const pullFromSheets = async () => {
    if (!sheetsUrl) {
      showToastMessage('Ingresa la URL del Web App de Sheets');
      return;
    }
    try {
      let cleanUrl = sheetsUrl.trim();
      if (cleanUrl.endsWith('/edit')) cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
      if (cleanUrl.endsWith('/dev')) cleanUrl = cleanUrl.replace(/\/dev$/, '/exec');

      const res = await fetch(`${cleanUrl}?action=getAll`);
      const json = await res.json();
      if (json && json.ok) {
        if (json.clientes) setClientes(json.clientes);
        if (json.viajes) setViajes(json.viajes);
        if (json.vehiculos) setVehiculos(json.vehiculos);
        if (json.cuentas) setCuentas(json.cuentas);
        if (json.deudas) setDeudas(json.deudas);
        if (json.pagos) setPagos(json.pagos);
        if (json.socios) setSocios(json.socios);
        saveState({
          clientes: json.clientes,
          viajes: json.viajes,
          vehiculos: json.vehiculos,
          cuentas: json.cuentas,
          deudas: json.deudas,
          pagos: json.pagos,
          socios: json.socios,
        });
        showToastMessage('Datos actualizados exitosamente desde Google Sheets');
      } else {
        showToastMessage('No se pudo traer datos. Verifica el permiso "Cualquiera" en Google Apps Script');
      }
    } catch {
      showToastMessage('Error de red al conectar con Google Sheets');
    }
  };

  const exportBackupJson = () => {
    const data = { clientes, viajes, vehiculos, cuentas, deudas, pagos, socios };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyon_cargo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToastMessage('Respaldo JSON descargado');
  };

  const importBackupJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.clientes || !parsed.viajes) {
        throw new Error('Estructura inválida');
      }
      setClientes(parsed.clientes || []);
      setViajes(parsed.viajes || []);
      setVehiculos(parsed.vehiculos || []);
      setCuentas(parsed.cuentas || []);
      setDeudas(parsed.deudas || []);
      setPagos(parsed.pagos || []);
      setSocios(parsed.socios || []);
      saveState(parsed);
      showToastMessage('Respaldo JSON restaurado con éxito');
    } catch {
      showToastMessage('El archivo no es un respaldo válido de EYON Cargo');
    }
  };

  const restoreDemoData = async () => {
    setClientes(INITIAL_CLIENTS);
    setViajes(INITIAL_TRIPS);
    setVehiculos(INITIAL_VEHICLES);
    setCuentas(INITIAL_ACCOUNTS);
    setDeudas(INITIAL_DEBTS);
    setPagos(INITIAL_PAYMENTS);
    setSocios(INITIAL_PARTNERS);

    const demoState = {
      clientes: INITIAL_CLIENTS,
      viajes: INITIAL_TRIPS,
      vehiculos: INITIAL_VEHICLES,
      cuentas: INITIAL_ACCOUNTS,
      deudas: INITIAL_DEBTS,
      pagos: INITIAL_PAYMENTS,
      socios: INITIAL_PARTNERS,
    };
    await saveState(demoState);
    showToastMessage('Datos de muestra completados (Tráilers, BCP, Deudas) cargados con éxito');
  };

  // Google Auth Listener
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setGoogleSyncStatus((prev) => ({ ...prev, connected: true }));
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setGoogleSyncStatus((prev) => ({ ...prev, connected: false }));
      }
    );
    return () => unsubscribe();
  }, []);

  const connectGoogleSheets = async (): Promise<boolean> => {
    try {
      setGoogleSyncStatus((prev) => ({ ...prev, syncing: true, error: undefined }));
      const res = await googleSignIn();
      if (!res) throw new Error('No se completó la autenticación con Google');

      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);

      // Find or create Google Spreadsheet
      const sheetId = await findOrCreateSpreadsheet(res.accessToken, googleSyncStatus.spreadsheetId);
      localStorage.setItem(GOOGLE_SPREADSHEET_ID_KEY, sheetId);

      // Initial Sync
      const payload = { clientes, viajes, vehiculos, cuentas, deudas, socios, username: configuredUsername };
      const syncRes = await syncAllDataToGoogleSheets(res.accessToken, sheetId, payload);

      if (syncRes.success) {
        setGoogleSyncStatus({
          connected: true,
          spreadsheetId: sheetId,
          spreadsheetUrl: syncRes.spreadsheetUrl,
          lastSyncTime: syncRes.timestamp,
          autoSyncEnabled: true,
          syncing: false,
          rowsSynced: syncRes.rowsSynced,
        });
        showToastMessage('🟢 Google Sheets vinculado y datos sincronizados con éxito');
        return true;
      } else {
        throw new Error(syncRes.error || 'Error en sincronización inicial');
      }
    } catch (err: any) {
      console.error('Error al conectar Google Sheets:', err);
      setGoogleSyncStatus((prev) => ({
        ...prev,
        syncing: false,
        error: err?.message || 'Falló la vinculación con Google Sheets',
      }));
      showToastMessage(`Error vinculando Google Sheets: ${err?.message || 'Error de conexión'}`);
      return false;
    }
  };

  const disconnectGoogleSheets = async () => {
    await googleLogout();
    setGoogleUser(null);
    setGoogleToken(null);
    setGoogleSyncStatus((prev) => ({ ...prev, connected: false, syncing: false }));
    showToastMessage('Google Sheets desconectado');
  };

  const triggerGoogleSheetsSync = async (silent: boolean = false): Promise<boolean> => {
    if (!googleToken || !googleSyncStatus.spreadsheetId) {
      if (!silent) showToastMessage('Primero debes vincular tu cuenta de Google Sheets');
      return false;
    }
    try {
      if (!silent) setGoogleSyncStatus((prev) => ({ ...prev, syncing: true }));
      const payload = { clientes, viajes, vehiculos, cuentas, deudas, socios, username: configuredUsername };
      const syncRes = await syncAllDataToGoogleSheets(googleToken, googleSyncStatus.spreadsheetId, payload);

      if (syncRes.success) {
        setGoogleSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: syncRes.timestamp,
          syncing: false,
          rowsSynced: syncRes.rowsSynced,
          error: undefined,
        }));
        if (!silent) showToastMessage('🟢 Sincronizado en tiempo real con Google Sheets');
        return true;
      } else {
        setGoogleSyncStatus((prev) => ({ ...prev, syncing: false, error: syncRes.error }));
        if (!silent) showToastMessage(`Error al sincronizar: ${syncRes.error}`);
        return false;
      }
    } catch (err: any) {
      setGoogleSyncStatus((prev) => ({ ...prev, syncing: false, error: err?.message }));
      return false;
    }
  };

  const toggleGoogleAutoSync = (enabled: boolean) => {
    localStorage.setItem(GOOGLE_AUTOSYNC_KEY, enabled ? 'true' : 'false');
    setGoogleSyncStatus((prev) => ({ ...prev, autoSyncEnabled: enabled }));
    showToastMessage(enabled ? 'Sincronización en tiempo real ACTIVADA' : 'Sincronización automática PAUSADA');
  };

  const downloadExcelBackup = () => {
    downloadOfflineExcelBackup({ clientes, viajes, vehiculos, cuentas, deudas, socios });
    showToastMessage('🟢 Archivo Excel (CSV) de respaldo descargado');
  };

  // Debounced auto-sync trigger on data change
  useEffect(() => {
    if (googleSyncStatus.connected && googleSyncStatus.autoSyncEnabled && googleToken && googleSyncStatus.spreadsheetId) {
      const timer = setTimeout(() => {
        triggerGoogleSheetsSync(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clientes, viajes, vehiculos, cuentas, deudas, socios, googleSyncStatus.connected, googleSyncStatus.autoSyncEnabled, googleToken]);

  return (
    <AppContext.Provider
      value={{
        clientes,
        viajes,
        vehiculos,
        cuentas,
        deudas,
        pagos,
        socios,
        events,
        theme,
        widgets,
        isLoggedIn,
        hasConfiguredPin,
        hasConfiguredUser,
        configuredUsername,
        sheetsUrl,
        toast,
        syncing,
        lastSyncTime,
        sidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        dailyBackups,
        restoreDailyBackup,
        downloadDailyBackup,
        createManualBackup,
        googleUser,
        googleToken,
        googleSyncStatus,
        connectGoogleSheets,
        disconnectGoogleSheets,
        triggerGoogleSheetsSync,
        toggleGoogleAutoSync,
        downloadExcelBackup,
        login,
        setupInitialPin,
        setupInitialUser,
        loginWithCredentials,
        updatePassword,
        logout,
        updatePin,
        showToastMessage,
        updateTheme,
        togglePrivacyMode,
        anonymizeForGitHub,
        toggleWidgetVisibility,
        resetWidgetLayout,
        addClient,
        editClient,
        removeClient,
        addTrip,
        editTrip,
        removeTrip,
        addVehicle,
        editVehicle,
        removeVehicle,
        addVehicleDoc,
        editVehicleDoc,
        removeVehicleDoc,
        addFuelLog,
        editFuelLog,
        removeFuelLog,
        updateVehicleKm,
        updateRanfla,
        addRanflaDoc,
        removeRanflaDoc,
        addMaintenanceTask,
        updateMaintenanceTask,
        removeMaintenanceTask,
        addVehicleExpense,
        removeVehicleExpense,
        addAccount,
        editAccount,
        removeAccount,
        addDebt,
        editDebt,
        removeDebt,
        payDebtInstalment,
        addPayment,
        editPayment,
        removePayment,
        addPartner,
        editPartner,
        removePartner,
        addPartnerPayout,
        setSheetsUrl,
        pushToSheets,
        pullFromSheets,
        exportBackupJson,
        importBackupJson,
        restoreDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
