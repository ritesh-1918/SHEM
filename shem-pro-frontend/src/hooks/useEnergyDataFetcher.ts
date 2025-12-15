import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { getLiveSensorData, getHistoryData, getSevenDayHistoryData, getEsp32LatestData } from '../services/api';
import toast from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext'; // NEW

interface LiveData {
  power: number;
  voltage: number;
  current: number;
  energy: number;
  timestamp: string;
}

interface HistoricalDataPoint {
  time: string;
  power: string;
  energy: number;
}

interface EnergyDataFetcherHook {
  liveData: LiveData | null;
  historicalData: HistoricalDataPoint[];
  sevenDayHistoricalData: HistoricalDataPoint[];
  status: string;
  isOnline: boolean;
  isLoading: boolean;
}

export const useEnergyDataFetcher = (): EnergyDataFetcherHook => {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [sevenDayHistoricalData, setSevenDayHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [status, setStatus] = useState('Connecting...');
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addNotification } = useNotification(); // NEW

  useEffect(() => {
    const isDemoMode = sessionStorage.getItem('demoUser') !== null;

    if (isDemoMode) {
      const fetchDemoRealData = async () => {
        try {
          const esp32Data = await getEsp32LatestData();
          // Map backend data to frontend interface
          // Backend: { voltage, current, power, energy_kWh, cost_rs, timestamp }
          // Frontend: { power, voltage, current, energy, timestamp }
          const mappedData: LiveData = {
            power: esp32Data.power || 0,
            voltage: esp32Data.voltage || 0,
            current: esp32Data.current || 0,
            energy: esp32Data.energy_kWh || 0,
            timestamp: esp32Data.timestamp || new Date().toISOString()
          };

          setLiveData(mappedData);
          setHistoricalData(prevData => {
            const updatedData = [...prevData, {
              time: new Date(mappedData.timestamp).toLocaleTimeString(),
              power: mappedData.power.toFixed(1),
              energy: mappedData.energy,
            }];
            if (updatedData.length > 30) {
              return updatedData.slice(updatedData.length - 30);
            }
            return updatedData;
          });

          setStatus('Demo Live (Real Data)');
          setIsOnline(true);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch ESP32 data in demo mode", error);
          // Fallback or just log? For now let's just keep trying.
        }
      };

      const generateMockSevenDayHistoricalData = (): HistoricalDataPoint[] => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          data.push({
            time: date.toLocaleDateString(),
            power: (Math.random() * (2000 - 1000) + 1000).toFixed(1),
            energy: parseFloat((Math.random() * 20).toFixed(2)),
          });
        }
        return data;
      };

      // Initial Call
      fetchDemoRealData();
      setSevenDayHistoricalData(generateMockSevenDayHistoricalData());

      const interval = setInterval(() => {
        fetchDemoRealData();
        // seven day history remains mock for now as backend might not have it populated
        setSevenDayHistoricalData(generateMockSevenDayHistoricalData());
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    } else {
      const fetchLiveSensorData = async () => {
        try {
          setIsLoading(true);
          const res = await getLiveSensorData();
          const newDataPoint: LiveData = res.data;
          setLiveData(newDataPoint);
          setHistoricalData(prevData => {
            const updatedData = [...prevData, {
              time: new Date(newDataPoint.timestamp).toLocaleTimeString(),
              power: newDataPoint.power.toFixed(1),
              energy: newDataPoint.energy,
            }];
            if (updatedData.length > 30) {
              return updatedData.slice(updatedData.length - 30);
            }
            return updatedData;
          });
          setStatus('Live');
          setIsOnline(true);
          // toast.success('Live data updated!', { id: 'live-data-toast' }); // Removed for less spam
        } catch (err: any) {
          console.error('Error fetching live sensor data:', err);
          setStatus('Disconnected');
          setIsOnline(false);

          // Switch from Toast to Notification Center for Connection Errors
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            addNotification('Server connection lost. Retrying...', 'error');
          } else if (err.response && err.response.status === 401) {
            toast.error('Session expired. Please log in again.', { id: 'auth-error-toast' }); // Keep auth toast
            navigate('/login');
          } else {
            addNotification('Failed to fetch live data.', 'warning');
          }
        } finally {
          setIsLoading(false);
        }
      };

      const fetchHistoricalData = async () => {
        try {
          const res = await getHistoryData();
          const formattedData = res.data.map((item: LiveData) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            power: item.power.toFixed(1),
            energy: item.energy,
          }));
          setHistoricalData(formattedData);
        } catch (err: any) {
          console.error('Error fetching historical data:', err);
          addNotification('Failed to fetch historical data.', 'warning');
        }
      };

      const fetchSevenDayHistoricalData = async () => {
        try {
          const res = await getSevenDayHistoryData();
          const formattedData = res.data.map((item: LiveData) => ({
            time: new Date(item.timestamp).toLocaleDateString(),
            power: item.power.toFixed(1),
            energy: item.energy,
          }));
          setSevenDayHistoricalData(formattedData);
        } catch (err: any) {
          console.error('Error fetching 7-day historical data:', err);
          addNotification('Failed to fetch 7-day historical data.', 'warning');
        }
      };

      fetchLiveSensorData(); // Initial fetch
      fetchHistoricalData(); // Initial fetch for historical data
      fetchSevenDayHistoricalData(); // Initial fetch for 7-day historical data

      const liveDataInterval = setInterval(fetchLiveSensorData, 3000); // Fetch live data every 3 seconds
      const historicalDataInterval = setInterval(fetchHistoricalData, 60000); // Fetch historical data every minute
      const sevenDayHistoricalDataInterval = setInterval(fetchSevenDayHistoricalData, 3600000); // Fetch 7-day historical data every hour

      return () => {
        clearInterval(liveDataInterval);
        clearInterval(historicalDataInterval);
        clearInterval(sevenDayHistoricalDataInterval);
      };
    }
  }, [navigate]);

  return { liveData, historicalData, status, isOnline, isLoading, sevenDayHistoricalData };
};