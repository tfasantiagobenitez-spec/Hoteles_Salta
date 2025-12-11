import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-semibold text-sm mb-1">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.fill || entry.color }} className="text-xs">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

const RevenueAnalysis: React.FC = () => {
  const { filteredData } = useData();

  const metrics = useMemo(() => {
    // We use filteredData which is already filtered by Date Range and Hotel (if selected)
    // However, if Hotel is 'All' in context, filteredData contains all hotels.
    // The previous logic filtered by selectedHotel manually. Now filteredData handles it.
    
    // Filter for revenue channels
    const channels = ['Directos', 'Booking', 'Booking engine', 'Despegar', 'HyperGuest', 'Agencias', 'Cuentas corrientes'];
    
    // Mix Calculation
    const channelData = channels.map(channel => {
      let value = 0;
      filteredData.forEach(r => {
        if (r.Concepto === channel) {
          value += r.Valor;
        }
      });
      return { name: channel, value };
    }).filter(d => d.value > 0).sort((a,b) => b.value - a.value);

    // Direct vs OTA
    const directTotal = channelData.find(c => c.name === 'Directos')?.value || 0;
    const otaTotal = channelData.filter(c => c.name !== 'Directos').reduce((acc, curr) => acc + curr.value, 0);
    const totalAccomm = directTotal + otaTotal;

    const dependencyRatio = totalAccomm ? (otaTotal / totalAccomm) * 100 : 0;

    // Complementary Income
    const restaurant = filteredData.filter(r => r.Concepto === 'Restaurante').reduce((acc, curr) => acc + curr.Valor, 0);
    const events = filteredData.filter(r => r.Concepto === 'Eventos').reduce((acc, curr) => acc + curr.Valor, 0);

    return {
      channelData,
      directTotal,
      otaTotal,
      dependencyRatio,
      restaurant,
      events
    };
  }, [filteredData]);

  // Modern Neon Palette
  const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Dependency Alert */}
      <div className={`p-4 rounded-xl border flex justify-between items-center backdrop-blur-sm ${metrics.dependencyRatio > 60 ? 'bg-red-900/20 border-red-500/50 text-red-300' : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'}`}>
        <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${metrics.dependencyRatio > 60 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
            <div>
            <h4 className="font-bold text-white">Índice de Dependencia OTA</h4>
            <p className="text-sm opacity-80">Porcentaje de ingresos a través de intermediarios</p>
            </div>
        </div>
        <div className="text-3xl font-bold tracking-tight">{metrics.dependencyRatio.toFixed(1)}%</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Mix Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
            Ingresos por Canal
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.channelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#cbd5e1'}} stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {metrics.channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Participación de Canales
          </h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {metrics.channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
             {/* Center text for donut */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl font-bold text-white block">{metrics.channelData.length}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">Canales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complementary Income */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Ingresos Complementarios (Acumulado)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex items-center gap-6 p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
              <div className="p-4 bg-orange-500/20 rounded-2xl text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">Restaurante</p>
                <h4 className="text-3xl font-bold text-white mt-1">${metrics.restaurant.toLocaleString()}</h4>
              </div>
           </div>
           <div className="flex items-center gap-6 p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
              <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">Eventos</p>
                <h4 className="text-3xl font-bold text-white mt-1">${metrics.events.toLocaleString()}</h4>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalysis;
