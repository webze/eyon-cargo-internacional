import {
  Client,
  Trip,
  Vehicle,
  BankAccount,
  Debt,
  Payment,
  Partner,
  AppStateData,
} from '../types';

/**
 * ============================================================================
 * DATOS DE MUESTRA PRE-CARGADOS - EYON CARGO INTERNACIONAL
 * ============================================================================
 * @description
 * Proporciona un conjunto completo y realista de datos iniciales que simula
 * la operación diaria de una empresa de transporte pesado de carga internacional:
 * - Tráilers de alta capacidad (Volvo FH 500, Freightliner Cascadia, Scania)
 * - Documentación obligatoria con fechas de vencimiento reales (SOAT, SUTRAN, CITV, MTC)
 * - Cuentas bancarias (BCP, BBVA, Interbank, Detracciones SUNAT)
 * - Financiamientos vehiculares y cuotas bancarias cronometradas
 * - Clientes mineros y corporativos reales (RUC, límites de crédito)
 * - Fletes activos con rutas nacionales e internacionales
 * - Registro de recargas de combustible diésel y telemetría
 * ============================================================================
 */

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    nombre: 'MINERA YANACOCHA S.R.L.',
    ruc: '20100869622',
    telefono: '01-2114000',
    contacto: 'Ing. Carlos Mendoza (Logística)',
    email: 'logistica@yanacocha.pe',
    notas: 'Transporte de reactivos e insumos pesados con permiso SUTRAN especial.',
    fechaRegistro: '2026-01-15',
    estado: 'Activo',
    limiteCredito: 150000,
  },
  {
    id: 'cli_2',
    nombre: 'SOCIEDAD MINERA CERRO VERDE S.A.A.',
    ruc: '20132388081',
    telefono: '054-381500',
    contacto: 'Lic. Lucía Paredes (Despachos)',
    email: 'despacho@cerroverde.pe',
    notas: 'Fletes continuos en ruta Lima - Arequipa - Moquegua.',
    fechaRegistro: '2026-02-01',
    estado: 'Activo',
    limiteCredito: 200000,
  },
  {
    id: 'cli_3',
    nombre: 'SOUTHERN PERU COPPER CORPORATION',
    ruc: '20100147589',
    telefono: '052-412020',
    contacto: 'Ing. Fernando Rivas',
    email: 'compras@southernperu.com.pe',
    notas: 'Carga pesada de repuestos de molienda hacia Cuajone y Toquepala.',
    fechaRegistro: '2026-02-10',
    estado: 'Activo',
    limiteCredito: 300000,
  },
];

const todayStr = new Date().toISOString().slice(0, 10);

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    placa: 'V7A-982',
    tipo: 'Tráiler',
    marca: 'Volvo',
    modelo: 'FH 500 Globetrotter 6x4 (2022)',
    notas: 'Unidad de cabecera para rutas de alta montaña con freno retardador.',
    estado: 'Operativo',
    documentos: [
      {
        id: 'doc_101',
        tipo: 'SOAT',
        entidad: 'La Positiva Seguros',
        fecha: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
        numeroDoc: 'PÓLIZA-9923812',
        notas: 'SOAT de carga pesada nacional activo.',
      },
      {
        id: 'doc_102',
        tipo: 'Revisión Técnica',
        entidad: 'MTC / Certificadora del Sur',
        fecha: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 10),
        numeroDoc: 'CITV-88231-MTC',
        notas: 'Próxima renovación de inspección técnica en 12 días.',
      },
      {
        id: 'doc_103',
        tipo: 'Permiso de Operación (SUTRAN)',
        entidad: 'SUTRAN',
        fecha: new Date(Date.now() + 86400000 * 180).toISOString().slice(0, 10),
        numeroDoc: 'SUTRAN-EXP-2026-99',
        notas: 'Permiso de carga general y mercancías especiales.',
      },
      {
        id: 'doc_104',
        tipo: 'Certificado de Habilitación Vehicular (MTC)',
        entidad: 'MTC Perú',
        fecha: new Date(Date.now() + 86400000 * 220).toISOString().slice(0, 10),
        numeroDoc: 'MTC-HAB-77312',
        notas: 'Habilitación para transporte de mercancías.',
      },
    ],
    combustible: [
      {
        id: 'comb_1',
        fecha: todayStr,
        galones: 120,
        costo: 2340,
        km: 185200,
        nivel: 95,
        grifo: 'Primax Panamericana Sur Km 40',
      },
      {
        id: 'comb_1b',
        fecha: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
        galones: 110,
        costo: 2145,
        km: 184100,
        nivel: 20,
        grifo: 'Pecsa Arequipa Yura',
      },
    ],
  },
  {
    id: 'veh_2',
    placa: 'T5C-741',
    tipo: 'Tráiler',
    marca: 'Freightliner',
    modelo: 'Cascadia 126 Heavy Duty (2023)',
    notas: 'Tráiler asignado a la ruta Callao - Cajamarca - Yanacocha.',
    estado: 'Operativo',
    documentos: [
      {
        id: 'doc_201',
        tipo: 'SOAT',
        entidad: 'Rímac Seguros',
        fecha: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10),
        numeroDoc: 'RIMAC-SOAT-44120',
        notas: 'SOAT renovado recientemente.',
      },
      {
        id: 'doc_202',
        tipo: 'Póliza de Seguro',
        entidad: 'Pacifico Seguros',
        fecha: new Date(Date.now() + 86400000 * 90).toISOString().slice(0, 10),
        numeroDoc: 'POL-CARGA-200K',
        notas: 'Cobertura de responsabilidad civil y carga hasta $200,000 USD.',
      },
    ],
    combustible: [
      {
        id: 'comb_2',
        fecha: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
        galones: 135,
        costo: 2632,
        km: 142000,
        nivel: 75,
        grifo: 'Repsol Trujillo Norte',
      },
    ],
  },
  {
    id: 'veh_3',
    placa: 'F3B-411',
    tipo: 'Camión',
    marca: 'Scania',
    modelo: 'R450 6x2 (2021)',
    notas: 'Camión plataforma para cargas intermedias de repuestos y tuberías.',
    estado: 'Operativo',
    documentos: [
      {
        id: 'doc_301',
        tipo: 'SOAT',
        entidad: 'Mapfre Perú',
        fecha: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
        numeroDoc: 'MAPFRE-88129',
        notas: 'Atención: Documento vencido hace 2 días, requiere renovación.',
      },
      {
        id: 'doc_302',
        tipo: 'Revisión Técnica',
        entidad: 'MTC Certificadora',
        fecha: new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 10),
        numeroDoc: 'CITV-SCANIA-2026',
        notas: 'CITV próximo a vencer en 8 días.',
      },
    ],
    combustible: [
      {
        id: 'comb_3',
        fecha: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
        galones: 90,
        costo: 1755,
        km: 210400,
        nivel: 40,
        grifo: 'Repsol Lurín Km 28',
      },
    ],
  },
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'vj_1',
    origen: 'Lima (Callao Terminal Puerto)',
    destino: 'Arequipa (Minera Cerro Verde)',
    fecha: todayStr,
    clienteId: 'cli_2',
    vehiculoId: 'veh_1',
    estado: 'En curso',
    conductor: 'Manuel Reyes Quispe',
    monto: 8500,
    costoEstimado: 3800,
    guiasRemision: '001-008923 / 001-008924',
    notas: 'Transporte pesado de tuberías de acero de 12 pulgadas con resguardo.',
  },
  {
    id: 'vj_2',
    origen: 'Lima (Zona Industrial Ate)',
    destino: 'Cajamarca (Yanacocha)',
    fecha: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    clienteId: 'cli_1',
    vehiculoId: 'veh_2',
    estado: 'Programado',
    conductor: 'Javier Huamán Flores',
    monto: 11200,
    costoEstimado: 5200,
    guiasRemision: '001-008925',
    notas: 'Salida de madrugada programada para evitar tráfico urbano.',
  },
  {
    id: 'vj_3',
    origen: 'Moquegua (Cuajone)',
    destino: 'Lima (Callao Puerto Exportación)',
    fecha: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    clienteId: 'cli_3',
    vehiculoId: 'veh_3',
    estado: 'Completado',
    conductor: 'Roberto Sánchez Prado',
    monto: 9400,
    costoEstimado: 4100,
    guiasRemision: '001-008890',
    notas: 'Flete entregado a tiempo sin novedades ni incidencias de carretera.',
  },
];

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'cta_1',
    banco: 'BCP - Banco de Crédito del Perú',
    tipo: 'Cuenta corriente',
    saldo: 148500,
    reservado: 32000,
    numeroCuenta: '191-28391823-0-12',
    moneda: 'PEN',
    notas: 'Cuenta principal de recaudación de fletes y depósitos de clientes.',
  },
  {
    id: 'cta_2',
    banco: 'BBVA Perú',
    tipo: 'Cuenta corriente',
    saldo: 65200,
    reservado: 12000,
    numeroCuenta: '0011-0182-01000293',
    moneda: 'PEN',
    notas: 'Pagos operativos, proveedores y liquidación de conductores.',
  },
  {
    id: 'cta_3',
    banco: 'Interbank',
    tipo: 'Cuenta corriente',
    saldo: 24500,
    reservado: 0,
    numeroCuenta: '200-300182940',
    moneda: 'USD',
    notas: 'Cuenta en dólares para fletes internacionales y repuestos importados.',
  },
  {
    id: 'cta_4',
    banco: 'Banco de la Nación (SUNAT)',
    tipo: 'Cuenta CTS',
    saldo: 18400,
    reservado: 18400,
    numeroCuenta: '00-011-082938',
    moneda: 'PEN',
    notas: 'Cuenta de Detracciones SUNAT intangibilizada para pago de impuestos.',
  },
];

export const INITIAL_DEBTS: Debt[] = [
  {
    id: 'deu_1',
    entidad: 'Interbank - Crédito Vehicular Tráiler Volvo',
    tipo: 'Crédito vehicular',
    total: 350000,
    pendiente: 185000,
    cuota: 12400,
    fecha: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    tasaInteres: 8.5,
    notas: 'Financiamiento del Volvo FH 500 (Cuota 18 de 36). Vence en 5 días.',
  },
  {
    id: 'deu_2',
    entidad: 'BCP - Financiamiento Semirremolque Randon',
    tipo: 'Préstamo',
    total: 180000,
    pendiente: 92000,
    cuota: 6800,
    fecha: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
    tasaInteres: 9.2,
    notas: 'Cuota de semirremolque de 3 ejes con suspensión neumática.',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pag_1',
    tipo: 'Ingreso',
    estado: 'Pagado',
    categoria: 'Flete Carga Pesada',
    monto: 8500,
    fecha: todayStr,
    cuentaId: 'cta_1',
    descripcion: 'Adelanto 50% flete Cerro Verde Arequipa (Volvo V7A-982)',
  },
  {
    id: 'pag_2',
    tipo: 'Egreso',
    estado: 'Pagado',
    categoria: 'Combustible Diesel B5',
    monto: 2340,
    fecha: todayStr,
    cuentaId: 'cta_2',
    descripcion: 'Recarga 120 galones Diésel en Grifo Primax Panamericana Sur',
  },
  {
    id: 'pag_3',
    tipo: 'Egreso',
    estado: 'Pagado',
    categoria: 'Peajes SUTRAN / Concesión',
    monto: 480,
    fecha: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    cuentaId: 'cta_2',
    descripcion: 'Peajes tramo Lima - Ica - Arequipa para tráiler de 6 ejes',
  },
  {
    id: 'pag_4',
    tipo: 'Egreso',
    estado: 'Pendiente',
    categoria: 'Mantenimiento Preventivo Volvo',
    monto: 3200,
    fecha: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    cuentaId: 'cta_2',
    descripcion: 'Cambio de aceite, filtros y revisión de frenos de disco',
  },
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'soc_1',
    nombre: 'Ing. Carlos E. Yovera (Socio Fundador)',
    pct: 50,
    pagos: [
      {
        id: 'payout_1',
        fecha: new Date(Date.now() - 86400000 * 20).toISOString().slice(0, 10),
        monto: 15000,
        concepto: 'Reparto de Utilidades Trimestre Q1 2026',
      },
    ],
  },
  {
    id: 'soc_2',
    nombre: 'Don Orlando Navarro (Socio Operativo)',
    pct: 50,
    pagos: [
      {
        id: 'payout_2',
        fecha: new Date(Date.now() - 86400000 * 20).toISOString().slice(0, 10),
        monto: 15000,
        concepto: 'Reparto de Utilidades Trimestre Q1 2026',
      },
    ],
  },
];

export const INITIAL_APP_STATE: AppStateData = {
  clientes: INITIAL_CLIENTS,
  viajes: INITIAL_TRIPS,
  vehiculos: INITIAL_VEHICLES,
  cuentas: INITIAL_ACCOUNTS,
  deudas: INITIAL_DEBTS,
  pagos: INITIAL_PAYMENTS,
  socios: INITIAL_PARTNERS,
};
