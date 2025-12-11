import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SheetRow } from '../types';
import { fetchSheetData } from '../services/dataService';
import { parseMonthValue, sortMonths } from '../utils/dateHelpers';

interface DataContextType {
  data: SheetRow[];
  filteredData: SheetRow[];
  loading: boolean;
  lastUpdated: Date;
  selectedHotel: string;
  availableMonths: string[];
  
  // Date Range State
  startMonth: string;
  endMonth: string;
  
  setHotel: (hotel: string) => void;
  setStartMonth: (month: string) => void;
  setEndMonth: (month: string) => void;
  setAllMonths: () => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Filters
  const [selectedHotel, setSelectedHotel] = useState<string>('All');
  const [startMonth, setStartMonth] = useState<string>('');
  const [endMonth, setEndMonth] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const rows = await fetchSheetData();
    setData(rows);
    setLoading(false);
    setLastUpdated(new Date());

    // Initialize dates if empty
    if ((!startMonth || !endMonth) && rows.length > 0) {
       const uniqueMonths = Array.from(new Set(rows.map(r => r.Mes))).sort(sortMonths);
       setStartMonth(uniqueMonths[0]);
       setEndMonth(uniqueMonths[uniqueMonths.length - 1]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(data.map(r => r.Mes))).sort(sortMonths);
  }, [data]);

  const filteredData = useMemo(() => {
    const startVal = parseMonthValue(startMonth);
    const endVal = parseMonthValue(endMonth);

    return data.filter(r => {
      // Hotel Filter
      if (selectedHotel !== 'All' && r.Hotel !== selectedHotel) return false;
      
      // Date Range Filter
      const rVal = parseMonthValue(r.Mes);
      if (startVal > 0 && endVal > 0) {
        return rVal >= startVal && rVal <= endVal;
      }
      return true;
    });
  }, [data, selectedHotel, startMonth, endMonth]);

  const setAllMonths = () => {
    if (availableMonths.length > 0) {
      setStartMonth(availableMonths[0]);
      setEndMonth(availableMonths[availableMonths.length - 1]);
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      filteredData,
      loading,
      lastUpdated,
      selectedHotel,
      availableMonths,
      startMonth,
      endMonth,
      setHotel: setSelectedHotel,
      setStartMonth,
      setEndMonth,
      setAllMonths,
      refreshData: loadData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
