import React from 'react';
import { useData } from '../context/DataContext';
import { RefreshCcw, Calendar, Filter, Bell, Search, Layers } from 'lucide-react';
import { HotelName } from '../types';

const Header: React.FC = () => {
  const { 
    lastUpdated, 
    refreshData, 
    selectedHotel, 
    setHotel, 
    startMonth,
    endMonth,
    setStartMonth,
    setEndMonth,
    setAllMonths,
    availableMonths,
    loading
  } = useData();

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="flex items-center gap-4 md:gap-8">
        <div>
          <h2 className="text-xl font-bold text-white hidden md:block">Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5 hidden md:block">Welcome back</p>
        </div>
        
        {/* Fake Search Bar */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-full px-4 py-2 w-64 text-sm focus-within:border-slate-600 transition-colors">
          <Search size={16} className="text-slate-500 mr-2" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-slate-300 w-full placeholder-slate-600" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
            <button 
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
            title="Refrescar datos"
            >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        {/* Date Range Selectors */}
        <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
           <div className="flex items-center">
             <span className="text-xs text-slate-500 ml-2 mr-1 hidden md:inline">Desde:</span>
             <select 
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="bg-transparent text-slate-200 text-sm p-1.5 outline-none cursor-pointer hover:text-brand-400 transition-colors"
             >
                {availableMonths.map(m => (
                  <option key={`start-${m}`} value={m} className="bg-slate-900">{m}</option>
                ))}
             </select>
           </div>
           <span className="text-slate-600">-</span>
           <div className="flex items-center">
             <span className="text-xs text-slate-500 ml-1 mr-1 hidden md:inline">Hasta:</span>
             <select 
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                className="bg-transparent text-slate-200 text-sm p-1.5 outline-none cursor-pointer hover:text-brand-400 transition-colors"
             >
                {availableMonths.map(m => (
                  <option key={`end-${m}`} value={m} className="bg-slate-900">{m}</option>
                ))}
             </select>
           </div>
           <button 
             onClick={setAllMonths}
             className="ml-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
           >
             Todo
           </button>
        </div>

        {/* Hotel Selector */}
        <div className="relative group min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-brand-500" />
            </div>
            <select 
                value={selectedHotel}
                onChange={(e) => setHotel(e.target.value)}
                className="bg-slate-900 text-slate-200 text-sm rounded-lg border border-slate-800 focus:border-brand-500 block w-full pl-9 p-2 outline-none appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
                <option value="All">All Hotels</option>
                {Object.values(HotelName).filter(h => h !== HotelName.Grupo).map(h => (
                <option key={h} value={h}>{h}</option>
                ))}
            </select>
        </div>
        
        <button className="p-2 relative text-slate-400 hover:text-white transition-colors hidden md:block">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
