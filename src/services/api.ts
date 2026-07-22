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

export const DEFAULT_CLOUD_API_URL = 'https://ais-pre-yqlgkzykor3syr3mtm5sxu-390166740574.us-west2.run.app/api/v1';

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('eyon_api_remote_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
    // Si la aplicación se está ejecutando desde GitHub Pages u otro host estático
    if (window.location.hostname.includes('github.io') || window.location.hostname.includes('github.com')) {
      return DEFAULT_CLOUD_API_URL;
    }
  }
  return '/api/v1';
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const res = await fetch(`${getApiBase()}/clients`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Backend API unavailable, using client fallback', err);
    return [];
  }
}

export async function createClient(client: Partial<Client>): Promise<Client | null> {
  try {
    const res = await fetch(`${getApiBase()}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('createClient API error:', e);
    return null;
  }
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client | null> {
  try {
    const res = await fetch(`${getApiBase()}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('updateClient API error:', e);
    return null;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/clients/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success === true;
  } catch (e) {
    console.warn('deleteClient API error:', e);
    return false;
  }
}

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const res = await fetch(`${getApiBase()}/trips`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createTrip(trip: Partial<Trip>): Promise<Trip | null> {
  try {
    const res = await fetch(`${getApiBase()}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('createTrip API error:', e);
    return null;
  }
}

export async function updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | null> {
  try {
    const res = await fetch(`${getApiBase()}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('updateTrip API error:', e);
    return null;
  }
}

export async function deleteTrip(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/trips/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success === true;
  } catch (e) {
    console.warn('deleteTrip API error:', e);
    return false;
  }
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(`${getApiBase()}/vehicles`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createVehicle(veh: Partial<Vehicle>): Promise<Vehicle | null> {
  try {
    const res = await fetch(`${getApiBase()}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veh),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('createVehicle API error:', e);
    return null;
  }
}

export async function updateVehicle(id: string, veh: Partial<Vehicle>): Promise<Vehicle | null> {
  try {
    const res = await fetch(`${getApiBase()}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veh),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('updateVehicle API error:', e);
    return null;
  }
}

export async function deleteVehicle(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/vehicles/${id}`, { method: 'DELETE' });
    const json = await res.json();
    return json.success === true;
  } catch (e) {
    console.warn('deleteVehicle API error:', e);
    return false;
  }
}

export async function fetchAccounts(): Promise<BankAccount[]> {
  try {
    const res = await fetch(`${getApiBase()}/finance/accounts`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchDebts(): Promise<Debt[]> {
  try {
    const res = await fetch(`${getApiBase()}/finance/debts`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  try {
    const res = await fetch(`${getApiBase()}/finance/payments`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchPartners(): Promise<Partner[]> {
  try {
    const res = await fetch(`${getApiBase()}/finance/partners`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const res = await fetch(`${getApiBase()}/finance/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  const json = await res.json();
  return json.data;
}

export async function fetchEvents(): Promise<MicroserviceEvent[]> {
  try {
    const res = await fetch(`${getApiBase()}/events`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function syncFullState(stateData: Partial<AppStateData>): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/sync`, {
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
    const res = await fetch(`${getApiBase()}/sync`);
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export interface AuthStatusResponse {
  configured: boolean;
  username: string;
}

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch(`${getApiBase()}/auth/status`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return { configured: false, username: '' };
  } catch {
    return { configured: false, username: '' };
  }
}

export async function setupAuthServer(username: string, passwordHash: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwordHash }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

export async function loginAuthServer(username: string, passwordHash: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwordHash }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

export async function updatePasswordServer(currentHash: string, newHash: string, newUsername?: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentHash, newHash, newUsername }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}
