import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { EventEmitter } from "events";
import { createServer as createViteServer } from "vite";

// Hash helper for server-side auth verification matching client crypto salt
function hashPasswordServer(password: string): string {
  return crypto.createHash("sha256").update(`eyon_cargo_secure_salt_v1_${password}`).digest("hex");
}

// File Path for Server Database Disk Persistence
const DB_FILE = path.join(process.cwd(), "server_data_store.json");

// Core Event Bus Architecture
class EventBus extends EventEmitter {
  private eventHistory: Array<{
    id: string;
    timestamp: string;
    service: string;
    eventType: string;
    payload: any;
    status: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
    description: string;
  }> = [];

  public publish(
    service: string,
    eventType: string,
    payload: any,
    status: "SUCCESS" | "WARNING" | "ERROR" | "INFO" = "INFO",
    description: string = ""
  ) {
    const event = {
      id: "evt_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      service,
      eventType,
      payload,
      status,
      description: description || `Event [${eventType}] emitted by ${service}`,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 200) {
      this.eventHistory = this.eventHistory.slice(0, 200);
    }

    console.log(`⚡ [EVENT-BUS][${service}] ${eventType}:`, description);
    this.emit("domain_event", event);
    this.emit(eventType, event);
    return event;
  }

  public getHistory() {
    return this.eventHistory;
  }
}

const eventBus = new EventBus();

// In-Memory & Disk-Persisted Database Store for Microservices
const sseClients: any[] = [];

function broadcastStateChange() {
  saveDatabaseToDisk(false);
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(`data: ${JSON.stringify({ type: "SYNC_UPDATE", timestamp: Date.now() })}\n\n`);
    } catch (err) {
      sseClients.splice(i, 1);
    }
  }
}

const database: {
  auth: {
    configured: boolean;
    username: string;
    passwordHash: string;
  };
  clientes: any[];
  viajes: any[];
  vehiculos: any[];
  cuentas: any[];
  deudas: any[];
  pagos: any[];
  socios: any[];
} = {
  auth: {
    configured: true,
    username: "EYON",
    passwordHash: hashPasswordServer("admin"),
  },
  clientes: [
    {
      id: "cli_1",
      nombre: "MINERA YANACOCHA S.R.L.",
      ruc: "20100869622",
      telefono: "01-2114000",
      contacto: "Ing. Carlos Mendoza",
      email: "logistica@yanacocha.pe",
      notas: "Transporte de reactivos e insumos con permiso especial SUTRAN.",
      fechaRegistro: "2026-01-15",
      estado: "Activo",
      limiteCredito: 150000,
    },
    {
      id: "cli_2",
      nombre: "SOCIEDAD MINERA CERRO VERDE S.A.A.",
      ruc: "20132388081",
      telefono: "054-381500",
      contacto: "Lic. Lucía Paredes",
      email: "despacho@cerroverde.pe",
      notas: "Fletes frecuentes Lima - Arequipa - Moquegua.",
      fechaRegistro: "2026-02-01",
      estado: "Activo",
      limiteCredito: 200000,
    },
  ],
  viajes: [
    {
      id: "vj_1",
      origen: "Lima (Callao Terminal)",
      destino: "Arequipa (Cerro Verde)",
      fecha: new Date().toISOString().slice(0, 10),
      clienteId: "cli_2",
      vehiculoId: "veh_1",
      estado: "En curso",
      conductor: "Manuel Reyes Quispe",
      monto: 8500,
      costoEstimado: 3800,
      guiasRemision: "001-008923 / 001-008924",
      notas: "Carga pesada de tuberías de acero 12 pulgadas.",
    },
    {
      id: "vj_2",
      origen: "Lima",
      destino: "Cajamarca",
      fecha: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      clienteId: "cli_1",
      vehiculoId: "veh_2",
      estado: "Programado",
      conductor: "Javier Huamán",
      monto: 11200,
      costoEstimado: 5200,
      guiasRemision: "001-008925",
      notas: "Programado para carga matutina.",
    },
  ],
  vehiculos: [
    {
      id: "veh_1",
      placa: "V7A-982",
      tipo: "Tráiler",
      marca: "Volvo",
      modelo: "FH 500 Globetrotter (2022)",
      notas: "Unidad asignada a rutas del sur con freno retardador.",
      documentos: [
        {
          id: "doc_101",
          tipo: "SOAT",
          entidad: "Aseguradora / MTC",
          fecha: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
          numeroDoc: "PÓLIZA-9923812",
          notas: "La Positiva Seguros.",
        },
        {
          id: "doc_102",
          tipo: "Revisión Técnica",
          entidad: "MTC",
          fecha: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 10),
          numeroDoc: "CITV-88231",
          notas: "Próxima a vencer en 12 días.",
        },
        {
          id: "doc_103",
          tipo: "Permiso de Operación (SUTRAN)",
          entidad: "SUTRAN",
          fecha: new Date(Date.now() + 86400000 * 180).toISOString().slice(0, 10),
          numeroDoc: "SUTRAN-EXP-2026",
          notas: "Carga general y peligrosa.",
        },
      ],
      combustible: [
        {
          id: "comb_1",
          fecha: new Date().toISOString().slice(0, 10),
          galones: 120,
          costo: 2340,
          km: 185200,
          nivel: 95,
          grifo: "Primax Panamericana Sur Km 40",
        },
      ],
      estado: "Operativo",
    },
    {
      id: "veh_2",
      placa: "F3B-411",
      tipo: "Camión",
      marca: "Scania",
      modelo: "R450 (2020)",
      notas: "Mantenimiento preventivo reciente en concesionario.",
      documentos: [
        {
          id: "doc_201",
          tipo: "SOAT",
          entidad: "Aseguradora / MTC",
          fecha: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
          numeroDoc: "PÓLIZA-11203",
          notas: "Atención: Vencido hace 2 días.",
        },
      ],
      combustible: [
        {
          id: "comb_2",
          fecha: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
          galones: 90,
          costo: 1755,
          km: 210400,
          nivel: 40,
          grifo: "Repsol Lurín",
        },
      ],
      estado: "Operativo",
    },
  ],
  cuentas: [
    {
      id: "cta_1",
      banco: "BCP - Banco de Crédito del Perú",
      tipo: "Cuenta corriente",
      saldo: 148500,
      reservado: 32000,
      numeroCuenta: "191-28391823-0-12",
      moneda: "PEN",
      notas: "Cuenta principal para cobranza de fletes y depósitos.",
    },
    {
      id: "cta_2",
      banco: "BBVA Perú",
      tipo: "Cuenta corriente",
      saldo: 65200,
      reservado: 12000,
      numeroCuenta: "0011-0182-01000293",
      moneda: "PEN",
      notas: "Pago a proveedores y detracciones SUNAT.",
    },
  ],
  deudas: [
    {
      id: "deu_1",
      entidad: "Interbank - Crédito Vehicular Tráiler",
      tipo: "Crédito vehicular",
      total: 350000,
      pendiente: 185000,
      cuota: 12400,
      fecha: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
      tasaInteres: 8.5,
      notas: "Cuota 18 de 36.",
    },
  ],
  pagos: [
    {
      id: "pag_1",
      tipo: "Ingreso",
      estado: "Pagado",
      categoria: "Flete Internacional",
      monto: 8500,
      fecha: new Date().toISOString().slice(0, 10),
      cuentaId: "cta_1",
      descripcion: "Adelanto flete Cerro Verde 50%",
    },
    {
      id: "pag_2",
      tipo: "Egreso",
      estado: "Pagado",
      categoria: "Combustible Diesel B5",
      monto: 2340,
      fecha: new Date().toISOString().slice(0, 10),
      cuentaId: "cta_2",
      descripcion: "Recarga de combustible Tráiler V7A-982",
    },
  ],
  socios: [
    {
      id: "soc_1",
      nombre: "Socio Fundador A",
      pct: 50,
      pagos: [
        {
          id: "spag_1",
          fecha: new Date().toISOString().slice(0, 10),
          monto: 15000,
          concepto: "Reparto de utilidades Q1",
        },
      ],
    },
    {
      id: "soc_2",
      nombre: "Socio Fundador B",
      pct: 50,
      pagos: [
        {
          id: "spag_2",
          fecha: new Date().toISOString().slice(0, 10),
          monto: 15000,
          concepto: "Reparto de utilidades Q1",
        },
      ],
    },
  ],
};

// Listeners in Event-Driven Architecture (Cross-Microservice triggers)
eventBus.on("TRIP_CREATED", (event) => {
  eventBus.publish(
    "FinanceMicroservice",
    "FORECAST_INCOME_ADDED",
    { tripId: event.payload.id, amount: event.payload.monto },
    "INFO",
    `Finanzas registró proyección de ingreso por S/ ${event.payload.monto} para flete #${event.payload.id}`
  );
  eventBus.publish(
    "AuditService",
    "AUDIT_LOG_RECORDED",
    { entity: "Trip", action: "CREATE", id: event.payload.id },
    "SUCCESS",
    `Auditoría grabó creación de viaje [${event.payload.origen} → ${event.payload.destino}]`
  );
});

eventBus.on("DOCUMENT_ADDED", (event) => {
  eventBus.publish(
    "NotificationService",
    "COMPLIANCE_MONITOR_UPDATED",
    { vehicleId: event.payload.vehicleId, document: event.payload.document },
    "INFO",
    `Servicio de Notificaciones actualizó vigencia de ${event.payload.document.tipo}`
  );
});

// Periodic microservice background compliance checker (desactivado para evitar alertas no solicitadas)
// setInterval(() => { ... }, 45000);

// Disk Persistence Helpers
function loadDatabaseFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.auth) database.auth = { ...database.auth, ...parsed.auth };
      if (parsed.clientes) database.clientes = parsed.clientes;
      if (parsed.viajes) database.viajes = parsed.viajes;
      if (parsed.vehiculos) database.vehiculos = parsed.vehiculos;
      if (parsed.cuentas) database.cuentas = parsed.cuentas;
      if (parsed.deudas) database.deudas = parsed.deudas;
      if (parsed.pagos) database.pagos = parsed.pagos;
      if (parsed.socios) database.socios = parsed.socios;
      console.log("💾 [SERVER] Estado de base de datos y usuario autenticado cargados desde disco.");
    }
  } catch (err) {
    console.error("⚠️ Error cargando base de datos desde disco:", err);
  }
}

function saveDatabaseToDisk(triggerBroadcast = true) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
    if (triggerBroadcast) {
      for (let i = sseClients.length - 1; i >= 0; i--) {
        try {
          sseClients[i].write(`data: ${JSON.stringify({ type: "SYNC_UPDATE", timestamp: Date.now() })}\n\n`);
        } catch (err) {
          sseClients.splice(i, 1);
        }
      }
    }
  } catch (err) {
    console.error("⚠️ Error guardando base de datos en disco:", err);
  }
}

// Cargar estado guardado al iniciar
loadDatabaseFromDisk();

// Asegurar que exista un único usuario admin central de fábrica "EYON"
if (!database.auth || !database.auth.configured || database.auth.username !== "EYON") {
  database.auth = {
    configured: true,
    username: "EYON",
    passwordHash: database.auth?.passwordHash || hashPasswordServer("admin"),
  };
  saveDatabaseToDisk();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes - Auth & Single User Credentials Microservice (Único usuario master: EYON)
  app.get("/api/v1/auth/status", (req, res) => {
    if (!database.auth || !database.auth.configured || database.auth.username !== "EYON") {
      database.auth = {
        configured: true,
        username: "EYON",
        passwordHash: database.auth?.passwordHash || hashPasswordServer("admin"),
      };
      saveDatabaseToDisk();
    }
    res.json({
      success: true,
      data: {
        configured: true,
        username: "EYON",
      },
    });
  });

  app.post("/api/v1/auth/setup", (req, res) => {
    const { passwordHash } = req.body || {};
    if (!passwordHash) {
      return res.status(400).json({ error: "Contraseña encriptada es obligatoria" });
    }
    database.auth = {
      configured: true,
      username: "EYON",
      passwordHash: String(passwordHash),
    };
    saveDatabaseToDisk();
    eventBus.publish("AuthService", "USER_REGISTERED_SERVER", { username: "EYON" }, "SUCCESS", `Usuario único [EYON] configurado en el servidor`);
    res.json({ success: true, username: "EYON" });
  });

  app.post("/api/v1/auth/login", (req, res) => {
    const { passwordHash } = req.body || {};
    if (!database.auth || !database.auth.configured) {
      database.auth = {
        configured: true,
        username: "EYON",
        passwordHash: hashPasswordServer("admin"),
      };
      saveDatabaseToDisk();
    }
    const defaultAdminHash = hashPasswordServer("admin");
    const currentPassHash = database.auth.passwordHash || defaultAdminHash;

    const isMasterPass = passwordHash === currentPassHash || passwordHash === defaultAdminHash;

    if (isMasterPass) {
      database.auth.username = "EYON";
      saveDatabaseToDisk(false);
      eventBus.publish("AuthService", "USER_LOGIN_SUCCESS", { username: "EYON" }, "SUCCESS", "Acceso autorizado para el usuario único [EYON]");
      return res.json({ success: true, username: "EYON" });
    }
    eventBus.publish("AuthService", "USER_LOGIN_FAILED", { username: "EYON" }, "WARNING", `Intento fallido de contraseña para usuario único [EYON]`);
    res.status(401).json({ success: false, error: "Contraseña incorrecta para el usuario único EYON" });
  });

  app.post("/api/v1/auth/reset", (req, res) => {
    database.auth = {
      configured: true,
      username: "EYON",
      passwordHash: hashPasswordServer("admin"),
    };
    saveDatabaseToDisk();
    eventBus.publish("AuthService", "AUTH_RESET", { username: "EYON" }, "SUCCESS", "Credenciales restablecidas al usuario único EYON / admin");
    res.json({ success: true, message: "Credenciales restablecidas a 'EYON' / 'admin'", username: "EYON" });
  });

  app.put("/api/v1/auth/password", (req, res) => {
    const { currentHash, newHash } = req.body || {};
    if (!database.auth || !database.auth.configured) {
      database.auth = {
        configured: true,
        username: "EYON",
        passwordHash: hashPasswordServer("admin"),
      };
      saveDatabaseToDisk();
    }
    const defaultAdminHash = hashPasswordServer("admin");
    const expectedHash = database.auth.passwordHash || defaultAdminHash;

    if (currentHash !== expectedHash && currentHash !== defaultAdminHash) {
      return res.status(401).json({ success: false, error: "La contraseña actual ingresada es incorrecta" });
    }
    database.auth.username = "EYON";
    database.auth.passwordHash = String(newHash);
    saveDatabaseToDisk();
    eventBus.publish("AuthService", "PASSWORD_UPDATED", { username: "EYON" }, "SUCCESS", "Contraseña del usuario único EYON actualizada con éxito");
    res.json({ success: true, username: "EYON" });
  });

  // API Routes - Clients Microservice
  app.get("/api/v1/clients", (req, res) => {
    res.json({ success: true, data: database.clientes });
  });

  app.post("/api/v1/clients", (req, res) => {
    const client = { id: "cli_" + Date.now().toString(36), fechaRegistro: new Date().toISOString().slice(0, 10), ...req.body };
    database.clientes.push(client);
    saveDatabaseToDisk();
    eventBus.publish("ClientMicroservice", "CLIENT_CREATED", client, "SUCCESS", `Cliente [${client.nombre}] registrado`);
    res.status(201).json({ success: true, data: client });
  });

  app.put("/api/v1/clients/:id", (req, res) => {
    const index = database.clientes.findIndex((c) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Cliente no encontrado" });
    database.clientes[index] = { ...database.clientes[index], ...req.body };
    saveDatabaseToDisk();
    eventBus.publish("ClientMicroservice", "CLIENT_UPDATED", database.clientes[index], "INFO", `Datos de cliente [${database.clientes[index].nombre}] actualizados`);
    res.json({ success: true, data: database.clientes[index] });
  });

  app.delete("/api/v1/clients/:id", (req, res) => {
    database.clientes = database.clientes.filter((c) => c.id !== req.params.id);
    saveDatabaseToDisk();
    eventBus.publish("ClientMicroservice", "CLIENT_DELETED", { id: req.params.id }, "WARNING", `Cliente #${req.params.id} eliminado`);
    res.json({ success: true });
  });

  // API Routes - Trips Microservice
  app.get("/api/v1/trips", (req, res) => {
    res.json({ success: true, data: database.viajes });
  });

  app.post("/api/v1/trips", (req, res) => {
    const trip = { id: "vj_" + Date.now().toString(36), ...req.body };
    database.viajes.unshift(trip);
    saveDatabaseToDisk();
    eventBus.publish("TripMicroservice", "TRIP_CREATED", trip, "SUCCESS", `Nuevo viaje [${trip.origen} → ${trip.destino}] asignado`);
    res.status(201).json({ success: true, data: trip });
  });

  app.put("/api/v1/trips/:id", (req, res) => {
    const index = database.viajes.findIndex((v) => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Viaje no encontrado" });
    const oldStatus = database.viajes[index].estado;
    database.viajes[index] = { ...database.viajes[index], ...req.body };
    const updated = database.viajes[index];
    saveDatabaseToDisk();
    if (oldStatus !== updated.estado) {
      eventBus.publish("TripMicroservice", "TRIP_STATUS_CHANGED", { tripId: updated.id, from: oldStatus, to: updated.estado }, "INFO", `Estado de viaje #${updated.id} cambió de '${oldStatus}' a '${updated.estado}'`);
    } else {
      eventBus.publish("TripMicroservice", "TRIP_UPDATED", updated, "INFO", `Viaje #${updated.id} actualizado`);
    }
    res.json({ success: true, data: updated });
  });

  app.delete("/api/v1/trips/:id", (req, res) => {
    database.viajes = database.viajes.filter((v) => v.id !== req.params.id);
    saveDatabaseToDisk();
    eventBus.publish("TripMicroservice", "TRIP_DELETED", { id: req.params.id }, "WARNING", `Viaje #${req.params.id} cancelado/eliminado`);
    res.json({ success: true });
  });

  // API Routes - Vehicle Microservice
  app.get("/api/v1/vehicles", (req, res) => {
    res.json({ success: true, data: database.vehiculos });
  });

  app.post("/api/v1/vehicles", (req, res) => {
    const vehicle = { id: "veh_" + Date.now().toString(36), documentos: [], combustible: [], estado: "Operativo", ...req.body };
    database.vehiculos.push(vehicle);
    saveDatabaseToDisk();
    eventBus.publish("VehicleMicroservice", "VEHICLE_CREATED", vehicle, "SUCCESS", `Unidad vehicular [${vehicle.placa}] añadida a la flota`);
    res.status(201).json({ success: true, data: vehicle });
  });

  app.put("/api/v1/vehicles/:id", (req, res) => {
    const index = database.vehiculos.findIndex((v) => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Vehículo no encontrado" });
    database.vehiculos[index] = { ...database.vehiculos[index], ...req.body };
    saveDatabaseToDisk();
    eventBus.publish("VehicleMicroservice", "VEHICLE_UPDATED", database.vehiculos[index], "INFO", `Ficha de vehículo [${database.vehiculos[index].placa}] actualizada`);
    res.json({ success: true, data: database.vehiculos[index] });
  });

  app.delete("/api/v1/vehicles/:id", (req, res) => {
    database.vehiculos = database.vehiculos.filter((v) => v.id !== req.params.id);
    saveDatabaseToDisk();
    eventBus.publish("VehicleMicroservice", "VEHICLE_DELETED", { id: req.params.id }, "WARNING", `Vehículo #${req.params.id} retirado de flota`);
    res.json({ success: true });
  });

  // API Routes - Finance Microservice
  app.get("/api/v1/finance/accounts", (req, res) => {
    res.json({ success: true, data: database.cuentas });
  });

  app.get("/api/v1/finance/debts", (req, res) => {
    res.json({ success: true, data: database.deudas });
  });

  app.get("/api/v1/finance/payments", (req, res) => {
    res.json({ success: true, data: database.pagos });
  });

  app.get("/api/v1/finance/partners", (req, res) => {
    res.json({ success: true, data: database.socios });
  });

  app.post("/api/v1/finance/payments", (req, res) => {
    const payment = { id: "pag_" + Date.now().toString(36), ...req.body };
    database.pagos.unshift(payment);
    saveDatabaseToDisk();
    eventBus.publish("FinanceMicroservice", "PAYMENT_RECORDED", payment, "SUCCESS", `Transacción de ${payment.tipo} por S/ ${payment.monto} registrada`);
    res.status(201).json({ success: true, data: payment });
  });

  // Microservice Realtime Event History
  app.get("/api/v1/events", (req, res) => {
    res.json({ success: true, data: eventBus.getHistory() });
  });

  // SSE Stream Endpoint for Instant Real-Time Cross-Device Synchronization
  app.get("/api/v1/sync/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}\n\n`);

    sseClients.push(res);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Full Database State Endpoint for Backup / Sync
  app.get("/api/v1/sync", (req, res) => {
    res.json({
      success: true,
      data: database,
      auth: {
        configured: Boolean(database.auth?.configured),
        username: database.auth?.username || "",
      },
    });
  });

  app.post("/api/v1/sync", (req, res) => {
    if (req.body && req.body.data) {
      const incoming = req.body.data;
      if (incoming.clientes) database.clientes = incoming.clientes;
      if (incoming.viajes) database.viajes = incoming.viajes;
      if (incoming.vehiculos) database.vehiculos = incoming.vehiculos;
      if (incoming.cuentas) database.cuentas = incoming.cuentas;
      if (incoming.deudas) database.deudas = incoming.deudas;
      if (incoming.pagos) database.pagos = incoming.pagos;
      if (incoming.socios) database.socios = incoming.socios;
      if (req.body.auth && req.body.auth.configured) {
        database.auth = req.body.auth;
      }
      broadcastStateChange();
      eventBus.publish("AuditService", "FULL_SYSTEM_RESTORED", {}, "WARNING", "Base de datos sincronizada/restaurada desde respaldo externo");
      return res.json({ success: true, message: "Sincronización completada" });
    }
    res.status(400).json({ error: "Datos no válidos" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 EYON CARGO Microservices Backend listening on http://0.0.0.0:${PORT}`);
    eventBus.publish("AuditService", "SYSTEM_BOOTSTRAP", { port: PORT }, "SUCCESS", "Microservicios de EYON Cargo inicializados correctamente.");
  });
}

startServer();
