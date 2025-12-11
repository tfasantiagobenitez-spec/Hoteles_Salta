export interface SheetRow {
  Hotel: string;
  Concepto: string;
  Grupo: string; // e.g., 'Ingresos', 'Egresos', 'KPI'
  Mes: string;   // e.g., '2023-10' or 'Octubre'
  Valor: number;
  Unidad: string; // e.g., '$', '%', 'Noche'
  Canal?: string; // e.g., 'Booking', 'Directos'
}

export enum HotelName {
  Amalinas = 'Amalinas',
  IRUYA = 'IRUYA',
  Nubes = 'Nubes',
  Grupo = 'Grupo Total'
}

export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  unit?: string;
  status?: 'good' | 'warning' | 'bad' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}
