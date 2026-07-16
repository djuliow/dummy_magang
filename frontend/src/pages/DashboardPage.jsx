import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/Dashboard/SummaryCard';
import StatusItem from '../components/Dashboard/StatusItem';
import LogRow from '../components/Dashboard/LogRow';

const DashboardPage = () => {
  const [summary, setSummary] = useState({ ph: '6.8', moisture: '42%', temperature: '24 C' });
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, logsRes, alertsRes] = await Promise.all([
          fetch('http://localhost:3000/api/summary'),
          fetch('http://localhost:3000/api/sensor-logs'),
          fetch('http://localhost:3000/api/alerts')
        ]);

        const summaryData = await summaryRes.json();
        const logsData = await logsRes.json();
        const alertsData = await alertsRes.json();

        if (summaryData && summaryData.created_at) {
          setSummary({
            ph: String(summaryData.ph ?? '6.8'),
            moisture: `${summaryData.moisture ?? 42}%`,
            temperature: `${summaryData.temperature ?? 24} C`
          });
          setLastUpdated(new Date(summaryData.created_at).toLocaleString());
        }

        setLogs(Array.isArray(logsData) ? logsData : []);
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Soil pH" value={summary.ph} subtitle="Slightly acidic, optimal." icon="science" iconColor="text-[#77574d]" />
        <SummaryCard title="Moisture" value={summary.moisture} subtitle="Zone 3 holding well." icon="water_drop" iconColor="text-[#0054a7]" />
        <SummaryCard title="Temperature" value={summary.temperature} subtitle="Stable ambient." icon="thermostat" iconColor="text-[#ba1a1a]" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 lg:col-span-2 flex flex-col h-96 shadow-[0_0_20px_rgba(46,125,50,0.08)] hover:border-[#2E7D32] transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-[#1a1c1c]">Moisture & pH Trends</h3>
              <p className="text-xs text-[#40493d] mt-1">
                {lastUpdated ? `Last sensor update: ${lastUpdated}` : 'Waiting for incoming sensor data'}
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-xs text-[#40493d]"><span className="w-3 h-3 rounded bg-[#0054a7]"></span> Moisture</span>
              <span className="flex items-center gap-1 text-xs text-[#40493d]"><span className="w-3 h-3 rounded bg-[#77574d]"></span> pH</span>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              <path className="stroke-[#0054a7] fill-none" d="M0,200 Q100,150 200,180 T400,120 T600,160 T800,100" strokeWidth="3"></path>
              <path className="stroke-[#77574d] fill-none" d="M0,150 Q150,160 300,140 T500,150 T700,130 T800,140" strokeWidth="3"></path>
            </svg>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 flex flex-col h-96 shadow-[0_0_20px_rgba(46,125,50,0.08)] hover:border-[#2E7D32] transition-all duration-300">
          <h3 className="text-2xl font-semibold text-[#1a1c1c] mb-6">Condition Status</h3>
          <div className="flex-1 flex flex-col gap-6 justify-center">
            <StatusItem label="pH Level" status={`Normal (${summary.ph})`} percentage={parseFloat(summary.ph) * 10} color="bg-[#0d631b]" textColor="text-[#0d631b]" />
            <StatusItem label="Moisture" status={`Current (${summary.moisture})`} percentage={parseInt(summary.moisture, 10)} color="bg-[#0054a7]" textColor="text-[#0054a7]" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 shadow-[0_0_20px_rgba(46,125,50,0.08)]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0054a7]">notifications</span> Recent Alerts
            </h3>
            <div className="space-y-3">
              {alerts.length === 0 ? <p className="text-sm text-[#40493d]">No active alerts.</p> : alerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm font-bold text-red-700">{alert.title}</p>
                  <p className="text-xs text-red-600">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#bfcaba]/30 flex justify-between items-center bg-[#f9f9f9]/50">
            <h3 className="text-2xl font-semibold text-[#1a1c1c]">Recent Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f3f3f3] border-b border-[#bfcaba]/30">
                  <th className="p-3 text-xs font-medium text-[#40493d] uppercase tracking-wider pl-6">Timestamp</th>
                  <th className="p-3 text-xs font-medium text-[#40493d] uppercase tracking-wider">pH</th>
                  <th className="p-3 text-xs font-medium text-[#40493d] uppercase tracking-wider">Moisture</th>
                  <th className="p-3 text-xs font-medium text-[#40493d] uppercase tracking-wider">Status</th>
                  <th className="p-3 text-xs font-medium text-[#40493d] uppercase tracking-wider pr-6">Temperature</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <LogRow
                    key={log.id}
                    time={new Date(log.created_at).toLocaleTimeString()}
                    ph={log.ph}
                    moisture={`${log.moisture}%`}
                    temp={`${log.temperature} C`}
                    status={log.status}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
