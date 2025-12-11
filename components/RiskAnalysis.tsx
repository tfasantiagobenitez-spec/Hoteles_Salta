import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import { sortMonths } from '../utils/dateHelpers';

const RiskAnalysis: React.FC = () => {
    const { filteredData, startMonth, endMonth } = useData();

    const metrics = useMemo(() => {
        const months = Array.from(new Set(filteredData.map(r => r.Mes))).sort(sortMonths);

        let currentBalance = 0;

        const riskData = months.map(m => {
            const monthRows = filteredData.filter(r => r.Mes === m);
            const result = monthRows.filter(r => r.Concepto === 'RESULTADO').reduce((a, b) => a + b.Valor, 0);
            const income = monthRows.filter(r => r.Concepto === 'TOTAL INGRESOS DEL MES').reduce((a, b) => a + b.Valor, 0);

            const expenses = monthRows.filter(r => r.Concepto === 'TOTAL EGRESOS').reduce((a, b) => a + b.Valor, 0);

            const margin = income ? (result / income) * 100 : 0;
            const isDangerous = result < 0 || margin < 5;

            currentBalance += result;

            return {
                month: m,
                Result: result,
                Income: income,
                Expenses: expenses,
                Balance: currentBalance,
                isDangerous
            };
        });

        const totalFinCost = filteredData.filter(r => r.Concepto === 'Bancos / Tarjeta').reduce((a, b) => a + b.Valor, 0);
        const totalInc = filteredData.filter(r => r.Concepto === 'TOTAL INGRESOS DEL MES').reduce((a, b) => a + b.Valor, 0);
        const frictionRatio = totalInc ? (totalFinCost / totalInc) * 100 : 0;

        return {
            riskData,
            frictionRatio,
            totalFinCost
        };
    }, [filteredData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-200 font-semibold text-sm mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.stroke || entry.fill }} className="text-xs">
                            {entry.name}: ${Math.abs(entry.value).toLocaleString()}
                        </p>
                    ))}
                    {payload[0].payload.isDangerous && (
                        <p className="text-rose-400 font-bold text-xs mt-1 uppercase">⚠️ Alerta Financiera</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h4 className="text-slate-400 text-sm font-medium">Costo Fricción Financiera</h4>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{metrics.frictionRatio.toFixed(2)}%</span>
                        <span className="text-xs text-slate-500">sobre ingresos</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Gastos bancarios y tarjetas</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h4 className="text-slate-400 text-sm font-medium">Meses Críticos</h4>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${metrics.riskData.filter(d => d.isDangerous).length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {metrics.riskData.filter(d => d.isDangerous).length}
                        </span>
                        <span className="text-xs text-slate-500">meses detectados</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Margen &lt; 5% o Resultado Negativo</p>
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                    Evolución de Caja (Simulado s/ Resultado)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="#475569" />
                            <Line type="monotone" dataKey="Result" stroke="#38bdf8" strokeWidth={2} dot={false} name="Resultado Mensual" />
                            <Line type="monotone" dataKey="Balance" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Caja Acumulada" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
                    Monitor de Riesgo Mensual
                </h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.riskData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="#475569" />
                            <Bar dataKey="Result" name="Resultado">
                                {metrics.riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isDangerous ? '#f43f5e' : '#10b981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-4 text-xs text-slate-400 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                        <span>Mes Saludable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded"></div>
                        <span>Mes Crítico</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RiskAnalysis;
