import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import RevenueAnalysis from './components/RevenueAnalysis';
import CostAnalysis from './components/CostAnalysis';
import OperationalKPIs from './components/OperationalKPIs';
import ProfitabilityAnalysis from './components/ProfitabilityAnalysis';
import BenchmarkAnalysis from './components/BenchmarkAnalysis';
import RiskAnalysis from './components/RiskAnalysis';

// Placeholder components for sections not fully detailed to keep code concise but working
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center text-slate-500">
    <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
    <p>Module under development</p>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-brand-600/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none z-[-1]"></div>

        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/revenue" element={<RevenueAnalysis />} />
            <Route path="/expenses" element={<CostAnalysis />} />
            <Route path="/profitability" element={<ProfitabilityAnalysis />} />
            <Route path="/operations" element={<OperationalKPIs />} />
            <Route path="/benchmark" element={<BenchmarkAnalysis />} />
            <Route path="/risk" element={<RiskAnalysis />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

export default App;