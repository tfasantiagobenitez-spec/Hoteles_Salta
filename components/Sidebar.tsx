import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Hotel,
  AlertTriangle
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Competencia (Home)', icon: LayoutDashboard },
    { path: '/revenue', label: 'Ingresos', icon: DollarSign },
    { path: '/expenses', label: 'Egresos', icon: PieChart },
    { path: '/profitability', label: 'Rentabilidad', icon: TrendingUp },
    { path: '/operations', label: 'KPIs Operativos', icon: Activity },
    { path: '/benchmark', label: 'Benchmark', icon: Hotel },
    { path: '/risk', label: 'Riesgo & Caja', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
          <div className="bg-brand-500 p-1.5 rounded-lg">
             <Hotel className="text-slate-900" size={20} />
          </div>
          HotelDash
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <p className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group
                  ${isActive(item.path) 
                    ? 'bg-brand-500/10 text-brand-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <item.icon size={18} className={isActive(item.path) ? 'text-brand-500' : 'text-slate-500 group-hover:text-slate-300'} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500"></div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400">View Profile</p>
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;