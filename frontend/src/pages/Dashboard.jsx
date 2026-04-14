import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    fetch('http://localhost:5000/api/scans', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Reverse to show oldest to newest on charts
        setScans(data.reverse());
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load scans:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="flex-grow flex items-center justify-center">Loading progress...</div>;
  }

  if (!user) {
    return <div className="flex-grow flex items-center justify-center text-slate-400">Please register or login to save and view your scan dashboard.</div>;
  }

  if (scans.length === 0) {
    return <div className="flex-grow flex items-center justify-center text-slate-400">No scans found yet. Scan your face to see progress.</div>;
  }

  const dates = scans.map(s => new Date(s.createdAt).toLocaleDateString());
  
  const lesionData = {
    labels: dates,
    datasets: [
      {
        label: 'Lesion Count',
        data: scans.map(s => s.lesionCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  const severityMap = { 'clear': 0, 'mild': 1, 'moderate': 2, 'severe': 3 };
  const severityData = {
    labels: dates,
    datasets: [
      {
        label: 'Acne Severity',
        data: scans.map(s => severityMap[s.acneSeverity] || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-6 animate-fade-in relative z-10">
      <h2 className="text-3xl font-bold mb-8">Progress Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-medium mb-4 text-blue-300">Lesion Tracker</h3>
          <div className="w-full h-80">
            <Line options={chartOptions} data={lesionData} />
          </div>
        </div>
        
        <div className="glass-panel p-6">
          <h3 className="text-xl font-medium mb-4 text-purple-300">Severity Over Time</h3>
          <div className="w-full h-80">
            <Bar options={{
              ...chartOptions,
              scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 3, ticks: { ...chartOptions.scales.y.ticks, stepSize: 1, callback: (v) => ['Clear', 'Mild', 'Moderate', 'Severe'][v] } } }
            }} data={severityData} />
          </div>
        </div>
      </div>
      
      <div className="mt-8 glass-panel p-6">
        <h3 className="text-xl font-medium mb-4 text-slate-200">Scan History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-3 px-4 text-slate-400">Date</th>
                <th className="py-3 px-4 text-slate-400">Severity</th>
                <th className="py-3 px-4 text-slate-400">Lesions</th>
                <th className="py-3 px-4 text-slate-400">Pigmentation</th>
              </tr>
            </thead>
            <tbody>
              {scans.slice().reverse().map((scan, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4">{new Date(scan.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 capitalize">{scan.acneSeverity}</td>
                  <td className="py-3 px-4">{scan.lesionCount}</td>
                  <td className="py-3 px-4 capitalize">{scan.pigmentationLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
