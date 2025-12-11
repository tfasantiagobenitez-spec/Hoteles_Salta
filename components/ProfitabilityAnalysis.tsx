import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ReferenceLine, Cell, ComposedChart
} from 'recharts';
import { sortMonths } from '../utils/dateHelpers';

const ProfitabilityAnalysis: React.FC = () => {
    const { filteredData, startMonth, endMonth } = useData();

    const metrics = useMemo(() => {
        // 1. Monthly Evolution (Line/Bar Combo)
        const months = Array.from(new Set(filteredData.map(r => r.Mes))).sort(sortMonths);

        const monthlyData = months.map(m => {
            const monthRows = filteredData.filter(r => r.Mes === m);
            const rev = monthRows.filter(r => r.Concepto === 'TOTAL INGRESOS DEL MES').reduce((a, b) => a + b.Valor, 0);
            const res = monthRows.filter(r => r.Concepto === 'RESULTADO').reduce((a, b) => a + b.Valor, 0);
            const margin = rev ? (res / rev) * 100 : 0;

            return { month: m, Result: res, Margin: margin };
        });

        // 2. Accumulated Result (YTD within filter)
        const totalRev = filteredData.filter(r => r.Concepto === 'TOTAL INGRESOS DEL MES').reduce((a, b) => a + b.Valor, 0);
        const totalRes = filteredData.filter(r => r.Concepto === 'RESULTADO').reduce((a, b) => a + b.Valor, 0);
        const avgMargin = totalRev ? (totalRes / totalRev) * 100 : 0;

        // 3. Margin Velocity (Delta Month over Month)
        const velocity = monthlyData.length >= 2
            ? monthlyData[monthlyData.length - 1].Margin - monthlyData[monthlyData.length - 2].Margin
            : 0;

        // 4. Waterfall Data (Aggregate)
        const totalExp = filteredData.filter(r => r.Concepto === 'TOTAL EGRESOS').reduce((a, b) => a + b.Valor, 0);
        const waterfallData = [
            { name: 'Ingresos', value: totalRev, fill: '#38bdf8' },
            { name: 'Egresos', value: -totalExp, fill: '#f43f5e' },
            { name: 'Resultado', value: totalRes, fill: totalRes >= 0 ? '#10b981' : '#f43f5e', isTotal: true }
        ];

        return {
            monthlyData,
            totalRes,
            avgMargin,
            velocity,
            waterfallData
        };
    }, [filteredData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.stroke || entry.fill }} className="text-xs">
                            {entry.name}: {entry.name === 'Margin'
                                ? `${entry.value.toFixed(1)}%`
                                : `$${Math.abs(entry.value).toLocaleString()}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <p className="text-sm text-slate-400">Resultado Acumulado</p>
                    <h3 className={`text-3xl font-bold mt-2 ${metrics.totalRes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${metrics.totalRes.toLocaleString()}
                    </h3>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <p className="text-sm text-slate-400">Margen Promedio</p>
                    <h3 className="text-3xl font-bold mt-2 text-white">
                        {metrics.avgMargin.toFixed(1)}%
                    </h3>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <p className="text-sm text-slate-400">Velocidad de Mejora (MoM)</p>
                    <div className="flex items-center gap-2 mt-2">
                        <h3 className={`text-3xl font-bold ${metrics.velocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {metrics.velocity > 0 ? '+' : ''}{metrics.velocity.toFixed(1)} pp
                        </h3>
                        <span className="text-xs text-slate-500">vs mes anterior</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Result & Margin Chart */}
                <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Evolución de Resultados y Margen
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={metrics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8' }} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Result" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                <ReferenceLine yAxisId="left" y={0} stroke="#475569" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Waterfall Chart (Simulated with Bar) */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                        Composición del Resultado
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.waterfallData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000000}M`} />
                                <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-800 border border-slate-700 p-2 rounded text-xs text-white">
                                                {payload[0].payload.name}: ${Math.abs(payload[0].value as number).toLocaleString()}
                                            </div>
                                        )
                                    }
                                    return null;
                                }} />
                                <ReferenceLine y={0} stroke="#475569" />
                                <Bar dataKey="value">
                                    {metrics.waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitabilityAnalysis;
