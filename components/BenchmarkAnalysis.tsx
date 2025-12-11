import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { HotelName } from '../types';

const BenchmarkAnalysis: React.FC = () => {
    const { filteredData } = useData();

    const metrics = useMemo(() => {
        // If 'All' is selected, we compare individual hotels.
        // If a specific hotel is selected, the benchmark is less useful, but we can show it vs Group Average maybe?
        // For now, let's assume we always show the 3 hotels side-by-side regardless of filter, 
        // OR we respect the date filter but show all 3 hotels.

        // We'll use the date filter from context, but ignore the Hotel filter to always compare the 3.
        // NOTE: This requires access to the raw full dataset or we need to ensure filteredData contains all hotels if we revert the hotel filter.
        // Since filteredData IS filtered by hotel, this might be an issue.
        // Ideally, context should expose `allData` or a way to get data for other hotels.
        // WORKAROUND: We will use `filteredData` but users must select "All Hotels" to see the full benchmark. 
        // OR, we can assume this page works best when "All" is selected.

        const hotels = [HotelName.Amalinas, HotelName.IRUYA, HotelName.Nubes];

        const getSum = (hotel: string, concept: string) => {
            return filteredData
                .filter(r => r.Hotel === hotel && r.Concepto === concept)
                .reduce((a, b) => a + b.Valor, 0);
        };

        const getAvg = (hotel: string, concept: string) => {
            const rows = filteredData.filter(r => r.Hotel === hotel && r.Concepto === concept);
            if (rows.length === 0) return 0;
            return rows.reduce((a, b) => a + b.Valor, 0) / rows.length;
        };

        const comparisonData = hotels.map(h => {
            const rev = getSum(h, 'TOTAL INGRESOS DEL MES');
            const res = getSum(h, 'RESULTADO');
            const revpar = getAvg(h, 'RevPAR');
            const occ = getAvg(h, 'Ocupación');
            const margin = rev ? (res / rev) * 100 : 0;
            // Direct Sales Ratio
            const direct = getSum(h, 'Directos');
            const channels = ['Directos', 'Booking', 'Booking engine', 'Despegar', 'HyperGuest', 'Agencias', 'Cuentas corrientes'];
            const totalAccom = filteredData.filter(r => r.Hotel === h && channels.includes(r.Concepto)).reduce((a, b) => a + b.Valor, 0);

            return {
                name: h,
                Ingresos: rev,
                Resultado: res,
                RevPAR: revpar,
                Ocupacion: occ,
                Margen: margin,
                Directos: totalAccom ? (direct / totalAccom) * 100 : 0
            };
        });

        return { comparisonData };
    }, [filteredData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.fill }} className="text-xs">
                            {entry.name}: {
                                entry.name === 'Ingresos' || entry.name === 'Resultado'
                                    ? `$${entry.value.toLocaleString()}`
                                    : entry.name === 'RevPAR' ? `$${entry.value.toFixed(0)}`
                                        : `${entry.value.toFixed(1)}%`
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3 items-center">
                <span className="text-blue-400">ℹ️</span>
                <p className="text-sm text-blue-200">Para un benchmark completo, asegúrese de seleccionar <strong>"All Hotels"</strong> en el filtro de arriba.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Comparison */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6">Ingresos vs Resultado</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Ingresos" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Resultado" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operational Comparison */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6">RevPAR vs Ocupación</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8' }} unit="$" />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8' }} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="RevPAR" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="Ocupacion" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Comparison */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6">Métricas de Eficiencia (Margen vs % Directos)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Margen" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Directos" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BenchmarkAnalysis;
