import {
  Client,
  Trip,
  Vehicle,
  BankAccount,
  Debt,
  Payment,
  Partner,
  MicroserviceEvent,
  AppStateData,
} from '../types';

const API_BASE = '/api/v1';

export async function fetchClients(): Promise<Client[]> {
  try {
    const res = await fetch(`${API_BASE}/clients`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Backend API unavailable, using client fallback', err);
    return [];
  }
}

export async function createClient(client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  const json = await res.json();
  return json.data;
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteClient(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const res = await fetch(`${API_BASE}/trips`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createTrip(trip: Partial<Trip>): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip),
  });
  const json = await res.json();
  return json.data;
}

export async function updateTrip(id: string, trip: Partial<Trip>): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createVehicle(veh: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(veh),
  });
  const json = await res.json();
  return json.data;
}

export async function updateVehicle(id: string, veh: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(veh),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function fetchAccounts(): Promise<BankAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/finance/accounts`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchDebts(): Promise<Debt[]> {
  try {
    const res = await fetch(`${API_BASE}/finance/debts`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  try {
    const res = await fetch(`${API_BASE}/finance/payments`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchPartners(): Promise<Partner[]> {
  try {
    const res = await fetch(`${API_BASE}/finance/partners`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const res = await fetch(`${API_BASE}/finance/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  const json = await res.json();
  return json.data;
}

export async function fetchEvents(): Promise<MicroserviceEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function syncFullState(stateData: Partial<AppStateData>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: stateData }),
    });
    const json = await res.json();
    return json.success;
  } catch {
    return false;
  }
}

export async function fetchFullSyncState(): Promise<AppStateData | null> {
  try {
    const res = await fetch(`${API_BASE}/sync`);
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}
