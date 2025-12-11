import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { parseMonthValue, sortMonths } from '../utils/dateHelpers';

const OperationalKPIs: React.FC = () => {
  const { filteredData, startMonth, endMonth } = useData();

  const trendData = useMemo(() => {
    // Get unique months present in the filtered data
    const monthsInFilter = Array.from(new Set(filteredData.map(r => r.Mes))).sort(sortMonths);

    return monthsInFilter.map(month => {
      const monthRows = filteredData.filter(r => r.Mes === month);
      
      // Calculate averages
      const getAvg = (concept: string) => {
        const items = monthRows.filter(r => r.Concepto === concept);
        if (items.length === 0) return 0;
        return items.reduce((acc, curr) => acc + curr.Valor, 0) / items.length;
      };

      return {
        month,
        Occupancy: getAvg('Ocupación'),
        ADR: getAvg('ADR'),
        RevPAR: getAvg('RevPAR')
      };
    });
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
          <p style={{ color: payload[0].stroke || payload[0].fill }} className="text-sm font-bold">
            {payload[0].value.toFixed(0)}{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
         <h2 className="text-lg font-bold text-white">
           Evolución: {startMonth} - {endMonth}
         </h2>
      </div>

      {/* Occupancy Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
            Evolución Ocupación (%)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Area type="monotone" dataKey="Occupancy" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorOcc)" activeDot={{r: 6, fill: '#fff'}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ADR Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            ADR Evolución ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAdr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip unit="$" />} />
                <Area type="monotone" dataKey="ADR" stroke="#10b981" strokeWidth={3} fill="url(#colorAdr)" activeDot={{r: 6, fill: '#fff'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RevPAR Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
            RevPAR Evolución ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip unit="$" />} />
                <Area type="monotone" dataKey="RevPAR" stroke="#f59e0b" strokeWidth={3} fill="url(#colorRev)" activeDot={{r: 6, fill: '#fff'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalKPIs;
