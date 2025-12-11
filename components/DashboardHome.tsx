import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { HotelName } from '../types';
import { TrendingUp, DollarSign, Users, Percent } from 'lucide-react';

const KPICard: React.FC<{ title: string; value: string; subValue?: string; icon: any; color: string; trend: 'up' | 'down' | 'neutral' }> = ({ title, value, subValue, icon: Icon, color, trend }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:border-slate-600 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
        {subValue && (
            <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {subValue}
                </span>
            </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {
                  typeof entry.value === 'number' 
                    ? (entry.name.includes('Ingresos') || entry.name.includes('Resultado') || entry.name.includes('RevPAR') ? `$${entry.value.toLocaleString()}` : entry.value.toFixed(1))
                    : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

const DashboardHome: React.FC = () => {
  const { filteredData, startMonth, endMonth } = useData();

  const metrics = useMemo(() => {
    // Helper to get sum
    const getSum = (concept: string, hotelFilter?: string) => {
      const items = filteredData.filter(r => (!hotelFilter || r.Hotel === hotelFilter) && r.Concepto === concept);
      return items.reduce((acc, curr) => acc + curr.Valor, 0);
    };

    // Helper to get average (for Occ, ADR)
    const getAvg = (concept: string, hotelFilter?: string) => {
      const items = filteredData.filter(r => (!hotelFilter || r.Hotel === hotelFilter) && r.Concepto === concept);
      if (items.length === 0) return 0;
      return items.reduce((acc, curr) => acc + curr.Valor, 0) / items.length;
    };

    const hotels = [HotelName.Amalinas, HotelName.IRUYA, HotelName.Nubes];

    // Aggregates for Cards
    const totalRevenue = getSum('TOTAL INGRESOS DEL MES');
    const totalResult = getSum('RESULTADO');
    // Occupancy is average of all records found in filtered set
    const occupancy = getAvg('Ocupación');
    
    const margin = totalRevenue ? (totalResult / totalRevenue) * 100 : 0;

    // Data for Leaderboard Table (Aggregated by Hotel over the selected range)
    const leaderboard = hotels.map(h => {
      const rev = getSum('TOTAL INGRESOS DEL MES', h);
      const res = getSum('RESULTADO', h);
      const occ = getAvg('Ocupación', h);
      const adr = getAvg('ADR', h);
      const revpar = getAvg('RevPAR', h);
      return {
        hotel: h,
        revenue: rev,
        result: res,
        margin: rev ? (res / rev) * 100 : 0,
        occupancy: occ,
        adr: adr,
        revpar: revpar
      };
    }).sort((a, b) => b.result - a.result);

    // Data for Head-to-Head Bar Chart
    const barData = hotels.map(h => ({
      name: h,
      Ingresos: getSum('TOTAL INGRESOS DEL MES', h),
      Egresos: getSum('TOTAL EGRESOS', h),
      Resultado: getSum('RESULTADO', h)
    }));

    // Data for Radar
    const radarData = [
      { subject: 'Margen', A: leaderboard.find(l=>l.hotel===HotelName.Amalinas)?.margin || 0, B: leaderboard.find(l=>l.hotel===HotelName.IRUYA)?.margin || 0, C: leaderboard.find(l=>l.hotel===HotelName.Nubes)?.margin || 0, fullMark: 100 },
      { subject: 'Ocupación', A: leaderboard.find(l=>l.hotel===HotelName.Amalinas)?.occupancy || 0, B: leaderboard.find(l=>l.hotel===HotelName.IRUYA)?.occupancy || 0, C: leaderboard.find(l=>l.hotel===HotelName.Nubes)?.occupancy || 0, fullMark: 100 },
      { subject: 'RevPAR', A: (leaderboard.find(l=>l.hotel===HotelName.Amalinas)?.revpar || 0)/2, B: (leaderboard.find(l=>l.hotel===HotelName.IRUYA)?.revpar || 0)/2, C: (leaderboard.find(l=>l.hotel===HotelName.Nubes)?.revpar || 0)/2, fullMark: 150 },
    ];

    return {
      totalRevenue,
      totalResult,
      occupancy,
      margin,
      leaderboard,
      barData,
      radarData
    };
  }, [filteredData]);

  if (!startMonth) return <div className="p-8 text-white">Loading data...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
         <h2 className="text-lg font-bold text-white">
           Resumen: {startMonth} - {endMonth}
         </h2>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Ingresos Totales" 
          value={`$${metrics.totalRevenue.toLocaleString()}`} 
          trend="up"
          subValue="Acumulado" 
          icon={DollarSign} 
          color="bg-brand-500" 
        />
        <KPICard 
          title="Resultado Operativo" 
          value={`$${metrics.totalResult.toLocaleString()}`} 
          subValue={`${metrics.margin.toFixed(1)}% Margen`}
          trend={metrics.totalResult >= 0 ? "up" : "down"}
          icon={TrendingUp} 
          color={metrics.totalResult >= 0 ? "bg-emerald-500" : "bg-rose-500"} 
        />
        <KPICard 
          title="Ocupación Promedio" 
          value={`${metrics.occupancy.toFixed(1)}%`} 
          subValue="Promedio"
          trend="down"
          icon={Users} 
          color="bg-purple-500" 
        />
        <KPICard 
          title="Eficiencia Costos" 
          value={`${((1 - (metrics.margin/100)) * 100).toFixed(1)}%`} 
          subValue="Ratio Promedio"
          trend="neutral"
          icon={Percent} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Tabla de Posiciones
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Hotel</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Margen</th>
                  <th className="px-4 py-3">RevPAR</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {metrics.leaderboard.map((row, idx) => (
                  <tr key={row.hotel} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-white flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${idx===0 ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      {row.hotel}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-400">${row.result.toLocaleString()}</td>
                    <td className="px-4 py-4">{row.margin.toFixed(1)}%</td>
                    <td className="px-4 py-4">${row.revpar.toFixed(0)}</td>
                    <td className="px-4 py-4 text-right text-slate-300">${row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-bold text-white mb-2 self-start flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Radar de Competencia
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics.radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Amalinas" dataKey="A" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.2} />
                <Radar name="IRUYA" dataKey="B" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                <Radar name="Nubes" dataKey="C" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Head to Head Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
            Comparativa Financiera (Totales del Periodo)
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Resultado" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
