/**
 * ============================================================================
 * ARCHIVO DE DEFINICIÓN DE TIPOS E INTERFACES - EYON CARGO INTERNACIONAL
 * ============================================================================
 * @file src/types/index.ts
 * @description
 * Define la estructura de datos central de toda la aplicación:
 * - Clientes y CRM
 * - Viajes, Fletes y Rutas
 * - Vehículos, Flota Pesada y Documentación Obligatoria (SUTRAN, MTC, SOAT)
 * - Finanzas, Cuentas Bancarias, Deudas y Reparto a Socios
 * - Eventos de Microservicios y Configuración Visual
 * 
 * Si necesitas añadir un nuevo campo a cualquier módulo del sistema,
 * edítalo aquí primero para mantener la seguridad de tipos en TypeScript.
 * ============================================================================
 */

/** Estados posibles de un viaje o flete internacional */
export type TripStatus = 'Programado' | 'En curso' | 'Completado' | 'Atrasado' | 'Cancelado';

/**
 * Interface para gestión de Clientes (CRM)
 */
export interface Client {
  /** Identificador único UUID del cliente */
  id: string;
  /** Nombre comercial o Razón Social */
  nombre: string;
  /** RUC del cliente (11 dígitos para SUNAT) */
  ruc: string;
  /** Teléfono de contacto directo */
  telefono: string;
  /** Persona de contacto designada */
  contacto: string;
  /** Correo electrónico corporativo */
  email: string;
  /** Notas e historial del cliente */
  notas: string;
  /** Fecha de registro en la plataforma */
  fechaRegistro: string;
  /** Estado operativo del cliente en la empresa */
  estado?: 'Activo' | 'Inactivo';
  /** Límite de crédito otorgado en soles/dólares */
  limiteCredito?: number;
}

/**
 * Interface para Viajes y Control de Fletes de Carga Pesada
 */
export interface Trip {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  clienteId: string;
  vehiculoId: string;
  estado: TripStatus;
  conductor: string;
  monto: number;
  costoEstimado?: number;
  guiasRemision?: string;
  notas: string;
}

/**
 * Tipos de Documentos Oficiales para Flota Pesada y Ranfla
 */
export type DocumentType =
  | 'SOAT'
  | 'Revisión Técnica'
  | 'Tarjeta de Propiedad'
  | 'Permiso de Operación (SUTRAN)'
  | 'Certificado de Habilitación Vehicular (MTC)'
  | 'Póliza de Seguro'
  | 'Ficha RUC del vehículo (SUNAT)'
  | 'GPS / Rastreo satelital'
  | 'CITV Carretea / Ranfla'
  | 'Tarjeta Propiedad Ranfla'
  | 'Póliza Seguro Ranfla'
  | 'Habilitación Ranfla (SUTRAN/MTC)'
  | 'Otro';

/**
 * Interface para Documentos y Vencimientos de Flota y Ranfla
 */
export interface VehicleDocument {
  id: string;
  tipo: DocumentType;
  entidad?: string;
  fecha: string; // YYYY-MM-DD
  numeroDoc?: string;
  notas: string;
}

/**
 * Interface para Ranfla / Semirremolque / Carretea
 */
export interface Ranfla {
  placa: string;
  tipo: 'Plataforma 3 Ejes' | 'Furgón 3 Ejes' | 'Cama Baja' | 'Contenedora' | 'Cisterna' | 'Cortinero' | 'Otro';
  marca?: string;
  ejes?: number;
  notas?: string;
  documentos: VehicleDocument[];
}

/**
 * Control Preventivo y Tareas de Mantenimiento por Kilometraje
 */
export interface MaintenanceTask {
  id: string;
  tipo: 'Cambio de Aceite y Filtros' | 'Engrase General' | 'Rotación / Cambio de Llantas' | 'Frenos y Suspensión' | 'Filtro de Aire y Secador' | 'Mantenimiento Transmisión y Corona' | 'Otro';
  descripcion: string;
  kmUltimoCambio: number; // Odómetro cuando se realizó la última vez
  intervaloKm: number; // Cada cuántos Km le toca (ej. 10,000 km, 15,000 km, 40,000 km)
  fechaUltimoCambio?: string;
  costoUltimoCambio?: number;
}

/**
 * Registro de Gastos, Compras de Repuestos, Llantas y Accesorios para el Carro/Ranfla
 */
export interface VehicleExpense {
  id: string;
  fecha: string;
  categoria: 'Llantas' | 'Aceite y Filtros' | 'Repuestos y Accesorios' | 'Mantenimiento Mecánico' | 'Planchado y Pintura' | 'Peajes y Lavado' | 'Otro';
  descripcion: string;
  monto: number;
  km: number;
  comprobante?: string;
  mecanicoOTaller?: string;
}

/**
 * Registro de Recarga de Combustible
 */
export interface FuelLog {
  id: string;
  fecha: string;
  galones: number;
  costo: number;
  km: number;
  nivel?: number; // Opcional o histórico
  grifo?: string;
}

/**
 * Interface de Vehículos / Unidades de Flota Pesada
 */
export interface Vehicle {
  id: string;
  placa: string;
  tipo: 'Tráiler' | 'Camión' | 'Furgón' | 'Camioneta' | 'Otro';
  marca: string;
  modelo: string;
  notas: string;
  documentos: VehicleDocument[];
  combustible: FuelLog[];
  estado?: 'Operativo' | 'Mantenimiento' | 'Inactivo';
  
  // Odómetro Actual y Detalle de la Ranfla
  kmActual?: number;
  ranfla?: Ranfla;
  mantenimientos?: MaintenanceTask[];
  gastos?: VehicleExpense[];
}

/**
 * Cuentas Bancarias y Tesorería
 */
export interface BankAccount {
  id: string;
  banco: string;
  tipo: 'Cuenta corriente' | 'Cuenta de ahorros' | 'Cuenta CTS' | 'CCI';
  saldo: number;
  reservado: number;
  numeroCuenta?: string;
  moneda?: 'PEN' | 'USD';
  notas: string;
}

/**
 * Deudas, Créditos y Financiamientos Vehiculares
 */
export interface Debt {
  id: string;
  entidad: string;
  tipo: 'Crédito vehicular' | 'Préstamo' | 'Línea de crédito' | 'Deuda con proveedor' | 'Otro';
  total: number;
  pendiente: number;
  cuota: number;
  fecha: string; // Fecha de vencimiento de la próxima cuota YYYY-MM-DD
  tasaInteres?: number;
  notas: string;
}

/**
 * Registro de Pagos, Ingresos y Egresos
 */
export interface Payment {
  id: string;
  tipo: 'Ingreso' | 'Egreso';
  estado: 'Pagado' | 'Pendiente';
  categoria: string;
  monto: number;
  fecha: string;
  cuentaId?: string;
  descripcion: string;
  comprobanteRef?: string;
}

/** Reparto de Utilidades a Socios */
export interface PartnerPayout {
  id: string;
  fecha: string;
  monto: number;
  concepto: string;
}

/** Socio Fundador o Dueño de Flota */
export interface Partner {
  id: string;
  nombre: string;
  pct: number;
  pagos: PartnerPayout[];
}

/** Nombres de los Microservicios Internos */
export type MicroserviceName =
  | 'ClientMicroservice'
  | 'TripMicroservice'
  | 'VehicleMicroservice'
  | 'FinanceMicroservice'
  | 'NotificationService'
  | 'AuditService';

/** Evento del Bus de Datos de Microservicios */
export interface MicroserviceEvent {
  id: string;
  timestamp: string;
  service: MicroserviceName;
  eventType: string;
  payload: Record<string, any>;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  description: string;
}

/** Configuración de Widgets en el Dashboard */
export interface DashboardWidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

/** Configuración de Tema e Interfaz Visual */
export interface AppThemeConfig {
  mode: 'dark' | 'light' | 'industrial';
  accentColor: 'amber' | 'blue' | 'emerald' | 'crimson';
  compactMode: boolean;
  privacyMode: boolean;
  showEventStreamBanner: boolean;
  autoSyncSheets?: boolean;
}

/** Copia de Seguridad Diaria Automática */
export interface DailyBackup {
  id?: string;
  dateKey?: string;
  date?: string; // YYYY-MM-DD
  formattedDate?: string;
  timestamp: string;
  recordsCount?: number | Record<string, number>;
  data: any;
}

/** Estado Completo de la Aplicación para exportación / respaldo */
export interface AppStateData {
  clientes: Client[];
  viajes: Trip[];
  vehiculos: Vehicle[];
  cuentas: BankAccount[];
  deudas: Debt[];
  pagos: Payment[];
  socios: Partner[];
}
