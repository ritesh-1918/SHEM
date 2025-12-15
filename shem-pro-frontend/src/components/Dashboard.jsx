import { useNavigate } from 'react-router-dom';
import { useEnergyDataFetcher } from '../hooks/useEnergyDataFetcher';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast'; // Import toast for dismiss logic if needed
import { getEsp32LatestData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Neo Components (Eager Load Layout)
import Sidebar from './dashboard/neo/Sidebar';
import DashboardHeader from './dashboard/neo/DashboardHeader';
import MetricCards from './dashboard/neo/MetricCards';
import ShemChat from './dashboard/neo/ShemChat';
import AiInsights from './dashboard/neo/AiInsights';

// Lazy Load Heavy Widgets
const LivePowerChart = lazy(() => import('./dashboard/neo/LivePowerChart'));
const SensorTicker = lazy(() => import('./dashboard/neo/SensorTicker'));
const EnergyDistributionWidget = lazy(() => import('./dashboard/neo/EnergyDistributionWidget'));
const CostAnalysisWidget = lazy(() => import('./dashboard/neo/CostAnalysisWidget'));
const NeoDeviceControl = lazy(() => import('./dashboard/neo/NeoDeviceControl'));
const ProfileSettings = lazy(() => import('./dashboard/neo/ProfileSettings'));
const PeakHoursCard = lazy(() => import('./dashboard/neo/PeakHoursCard'));
const CostOptimizer = lazy(() => import('./dashboard/neo/CostOptimizer'));

// Simple widget loader
const WidgetLoader = () => (
  <div className="h-full w-full min-h-[200px] flex items-center justify-center bg-white/5 rounded-xl animate-pulse">
    <div className="text-gray-500 text-sm">Loading Widget...</div>
  </div>
);

const Dashboard = () => {
  const { liveData } = useEnergyDataFetcher();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [esp32Data, setEsp32Data] = useState(null);

  // Fetch ESP32 Data
  useEffect(() => {
    const fetchEsp32Data = async () => {
      try {
        const data = await getEsp32LatestData();
        setEsp32Data(data);
      } catch (err) {
        console.error('Error fetching ESP32 data:', err);
      }
    };

    fetchEsp32Data();
    const interval = setInterval(fetchEsp32Data, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Force Dark Mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Render Content specific to Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 fade-in">
            {/* Simple Metrics */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="lg:col-span-3">
                  <MetricCards data={esp32Data || liveData} />
                </div>
                <div className="lg:col-span-1">
                  <AiInsights data={esp32Data || liveData} />
                </div>
              </div>
            </section>

            {/* Live Chart & Quick Control */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LivePowerChart liveData={esp32Data || liveData} />
              </div>
              <div>
                <NeoDeviceControl />
              </div>
            </section>

            {/* Peak Hours & Savings */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHoursCard data={esp32Data || liveData} userId={user?.id || 'user123'} />
              <CostOptimizer userId={user?.id || 'user123'} onNavigateToControl={() => setActiveTab('control')} />
            </section>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Detailed Analytics</h2>
            {/* Scrolling Ticker for deep data */}
            <SensorTicker data={esp32Data || liveData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
              <EnergyDistributionWidget />
              <CostAnalysisWidget />
            </div>
          </div>
        );

      case 'control':
        return (
          <div className="max-w-4xl mx-auto mt-10 fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Device Management</h2>
            <NeoDeviceControl />
            {/* Add more controls/scheduling here later */}
            <div className="mt-8 p-6 bg-dashboard-card rounded-xl border border-white/5 text-center text-dashboard-textSecondary">
              <p>Advanced scheduling coming soon...</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8 fade-in pb-10">
            <ProfileSettings />
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-white font-sans selection:bg-accent/30 selection:text-accent flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#252836', color: '#fff', border: '1px solid #2d3142', padding: '16px' },
          success: {
            iconTheme: { primary: '#f7b529', secondary: '#1a1d29' },
          },
          // Custom render for close button ability (react-hot-toast standard doesn't always have X)
          // Extending duration to give users time to read or close
          duration: 5000,
        }}
      >
        {(t) => (
          <div className={`
              ${t.type === 'loading' ? 'bg-blue-900/80' : ''}
              ${t.type === 'success' ? 'bg-green-900/80' : ''}
              ${t.type === 'error' ? 'bg-red-900/80' : 'bg-[#252836]'}
              border border-white/10 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] backdrop-blur-md transition-all
              ${t.visible ? 'animate-enter' : 'animate-leave'}
           `}>
            <div className="flex-1">{t.message}</div>
            {t.type !== 'loading' && (
              <button onClick={() => toast.dismiss(t.id)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 opacity-70 hover:opacity-100" />
              </button>
            )}
          </div>
        )}
      </Toaster>

      {/* Sidebar (Fixed) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-20 flex flex-col min-h-screen">
        <DashboardHeader
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          onProfileClick={() => setActiveTab('settings')}
        />

        <main className="flex-1 p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
          <Suspense fallback={<WidgetLoader />}>
            {renderContent()}
          </Suspense>
        </main>

        {/* Floating Chat */}
        <ShemChat contextData={esp32Data || liveData} />
      </div>
    </div>
  );
};

export default Dashboard;