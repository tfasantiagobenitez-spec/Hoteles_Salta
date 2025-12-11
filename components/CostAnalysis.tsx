import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

const CostAnalysis: React.FC = () => {
  const { filteredData } = useData();

  const metrics = useMemo(() => {
    // Total Revenue for ratios (of the selected period/hotel)
    const totalRev = filteredData.filter(r => r.Concepto === 'TOTAL INGRESOS DEL MES')
      .reduce((acc, curr) => acc + curr.Valor, 0);

    // Expense Categories
    const expenseCategories = [
      'Personal hotel', 'Impuestos', 'Servicios hotel', 'Honorarios', 
      'Publicidad', 'Bancos / Tarjeta', 'Rodados', 'Oficina / Predio', 
      'Estructura hotel', 'Inversiones'
    ];
    
    const costData = expenseCategories.map(cat => {
      let value = 0;
      filteredData.forEach(r => {
        if (r.Concepto === cat) {
          value += r.Valor;
        }
      });
      return { name: cat, value, ratio: totalRev ? (value / totalRev) * 100 : 0 };
    }).filter(d => d.value > 0).sort((a,b) => b.value - a.value);

    const totalExp = costData.reduce((acc, curr) => acc + curr.value, 0);

    return {
      costData,
      totalExp,
      totalRev
    };
  }, [filteredData]);

  const COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
          <p className="text-white text-xs">${payload[0].value.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">{payload[0].payload.ratio.toFixed(1)}% of Revenue</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
            Estructura de Costos (Acumulado)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
           <div className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl">
             <p className="text-sm text-slate-400">Total Egresos</p>
             <h2 className="text-4xl font-bold text-white mt-2">${metrics.totalExp.toLocaleString()}</h2>
             <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                <div 
                    className="bg-rose-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(((metrics.totalExp/metrics.totalRev)*100), 100)}%` }}
                ></div>
             </div>
             <p className="text-sm text-slate-400 mt-2">Eficiencia: <span className="text-rose-400 font-bold">{metrics.totalRev ? ((metrics.totalExp/metrics.totalRev)*100).toFixed(1) : 0}%</span> de Ingresos</p>
           </div>
        </div>

        <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.costData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11, fill: '#cbd5e1'}} stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                   {metrics.costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      {/* Pareto Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Top 5 Rubros de Costo (Pareto)</h3>
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
             <tr>
               <th className="px-4 py-3 rounded-l-lg">Rubro</th>
               <th className="px-4 py-3 text-right">Monto</th>
               <th className="px-4 py-3 text-right rounded-r-lg">% s/ Ingresos</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {metrics.costData.slice(0, 5).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-700/20">
                <td className="px-4 py-4 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    {row.name}
                </td>
                <td className="px-4 py-4 text-right">${row.value.toLocaleString()}</td>
                <td className="px-4 py-4 text-right font-bold text-slate-400">{row.ratio.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CostAnalysis;
