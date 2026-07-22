import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

// Views
import DashboardView from './components/Dashboard/DashboardView';
import ClientsView from './components/Clients/ClientsView';
import TripsView from './components/Trips/TripsView';
import VehiclesView from './components/Vehicles/VehiclesView';
import FinanceView from './components/Finance/FinanceView';
import EventMonitorView from './components/EventMonitor/EventMonitorView';
import SettingsView from './components/Settings/SettingsView';

// Modals
import ClientModal from './components/Modals/ClientModal';
import TripModal from './components/Modals/TripModal';
import VehicleModal from './components/Modals/VehicleModal';
import VehDetailModal from './components/Modals/VehDetailModal';
import AccountModal from './components/Modals/AccountModal';
import DebtModal from './components/Modals/DebtModal';
import PaymentModal from './components/Modals/PaymentModal';
import { PartnerModal, PartnerPayoutModal } from './components/Modals/PartnerModal';
import WidgetCustomizerModal from './components/Modals/WidgetCustomizerModal';

function MainAppShell() {
  const { isLoggedIn, theme } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');

  // Modal control states
  const [clientModalId, setClientModalId] = useState<string | null | undefined>(undefined);
  const [tripModalId, setTripModalId] = useState<string | null | undefined>(undefined);
  const [tripPreClient, setTripPreClient] = useState<string | null>(null);
  const [vehicleModalId, setVehicleModalId] = useState<string | null | undefined>(undefined);
  const [vehDetailId, setVehDetailId] = useState<string | null>(null);
  const [vehDetailTab, setVehDetailTab] = useState<'mantenimiento' | 'ranfla' | 'gastos' | 'docs' | 'combustible' | undefined>(undefined);

  const handleOpenVehDetail = (id: string, initialTab?: 'mantenimiento' | 'ranfla' | 'gastos' | 'docs' | 'combustible') => {
    setVehDetailId(id);
    setVehDetailTab(initialTab);
  };

  const [accountModalId, setAccountModalId] = useState<string | null | undefined>(undefined);
  const [debtModalId, setDebtModalId] = useState<string | null | undefined>(undefined);
  const [paymentModalId, setPaymentModalId] = useState<string | null | undefined>(undefined);
  const [partnerModalId, setPartnerModalId] = useState<string | null | undefined>(undefined);
  const [partnerPayoutId, setPartnerPayoutId] = useState<string | null>(null);

  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // Theme styling background class
  const themeBgClass =
    theme.mode === 'industrial'
      ? 'bg-[#101720] text-slate-100 font-sans'
      : theme.mode === 'light'
      ? 'bg-[#f4f6f8] text-slate-900 font-sans'
      : 'bg-[#14181c] text-slate-100 font-sans';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${themeBgClass} ${theme.mode === 'light' ? 'light-mode' : ''} overflow-x-hidden w-full relative`}>
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Container */}
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <Header
          currentView={currentView}
          onOpenTripModal={() => {
            setTripPreClient(null);
            setTripModalId(null);
          }}
          onOpenWidgetModal={() => setShowWidgetCustomizer(true)}
          onOpenVehDetail={handleOpenVehDetail}
        />

        {/* View Router */}
        {currentView === 'dashboard' && (
          <DashboardView
            onOpenTripModal={(id) => {
              setTripPreClient(null);
              setTripModalId(id ?? null);
            }}
            onOpenVehicleModal={(id) => setVehicleModalId(id ?? null)}
            onViewChange={setCurrentView}
          />
        )}

        {currentView === 'clientes' && (
          <ClientsView
            onOpenClientModal={(id) => setClientModalId(id ?? null)}
            onOpenTripForClient={(clientId) => {
              setTripPreClient(clientId);
              setTripModalId(null);
            }}
          />
        )}

        {currentView === 'viajes' && (
          <TripsView
            onOpenTripModal={(id) => {
              setTripPreClient(null);
              setTripModalId(id ?? null);
            }}
          />
        )}

        {currentView === 'vehiculos' && (
          <VehiclesView
            onOpenVehicleModal={(id) => setVehicleModalId(id ?? null)}
            onOpenVehDetail={handleOpenVehDetail}
          />
        )}

        {currentView === 'finanzas' && (
          <FinanceView
            onOpenAccountModal={(id) => setAccountModalId(id ?? null)}
            onOpenDebtModal={(id) => setDebtModalId(id ?? null)}
            onOpenPaymentModal={(id) => setPaymentModalId(id ?? null)}
            onOpenPartnerModal={(id) => setPartnerModalId(id ?? null)}
            onOpenPartnerPayoutModal={(partnerId) => setPartnerPayoutId(partnerId)}
          />
        )}

        {currentView === 'events' && <EventMonitorView />}

        {currentView === 'config' && <SettingsView />}
      </main>

      {/* Modals Stack */}
      {clientModalId !== undefined && (
        <ClientModal clientId={clientModalId} onClose={() => setClientModalId(undefined)} />
      )}

      {tripModalId !== undefined && (
        <TripModal
          tripId={tripModalId}
          preSelectedClientId={tripPreClient}
          onClose={() => {
            setTripModalId(undefined);
            setTripPreClient(null);
          }}
        />
      )}

      {vehicleModalId !== undefined && (
        <VehicleModal vehicleId={vehicleModalId} onClose={() => setVehicleModalId(undefined)} />
      )}

      {vehDetailId !== null && (
        <VehDetailModal
          vehicleId={vehDetailId}
          initialTab={vehDetailTab}
          onClose={() => {
            setVehDetailId(null);
            setVehDetailTab(undefined);
          }}
        />
      )}

      {accountModalId !== undefined && (
        <AccountModal accountId={accountModalId} onClose={() => setAccountModalId(undefined)} />
      )}

      {debtModalId !== undefined && (
        <DebtModal debtId={debtModalId} onClose={() => setDebtModalId(undefined)} />
      )}

      {paymentModalId !== undefined && (
        <PaymentModal paymentId={paymentModalId} onClose={() => setPaymentModalId(undefined)} />
      )}

      {partnerModalId !== undefined && (
        <PartnerModal partnerId={partnerModalId} onClose={() => setPartnerModalId(undefined)} />
      )}

      {partnerPayoutId !== null && (
        <PartnerPayoutModal partnerId={partnerPayoutId} onClose={() => setPartnerPayoutId(null)} />
      )}

      {showWidgetCustomizer && (
        <WidgetCustomizerModal onClose={() => setShowWidgetCustomizer(false)} />
      )}

      {/* Floating Toast Notification */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
