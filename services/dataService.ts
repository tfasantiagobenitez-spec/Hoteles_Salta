import { SheetRow, HotelName } from '../types';

// The ID provided in the prompt
const SHEET_ID = '1O8h9DwB21IL4jOQaDQrqO4-4eAmvdStelSNC4Y-ZShs';

// Using the Google Visualization API endpoint usually avoids 400 errors 
// that occur with the /export endpoint on certain shared sheet configurations.
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

const detectSeparator = (headerLine: string): string => {
  if (!headerLine) return ',';
  const commas = (headerLine.match(/,/g) || []).length;
  const semicolons = (headerLine.match(/;/g) || []).length;
  return semicolons > commas ? ';' : ',';
};

const parseCSVLine = (line: string, separator: string): string[] => {
  const result = [];
  let startValueIndex = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === separator && !inQuotes) {
      let val = line.substring(startValueIndex, i).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
        val = val.replace(/""/g, '"');
      }
      result.push(val);
      startValueIndex = i + 1;
    }
  }
  let lastVal = line.substring(startValueIndex).trim();
  if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
    lastVal = lastVal.substring(1, lastVal.length - 1);
    lastVal = lastVal.replace(/""/g, '"');
  }
  result.push(lastVal);
  return result;
};

const parseNumber = (val: string): number => {
  if (!val) return 0;
  let clean = val.replace(/[$\s]/g, '');
  if (!isNaN(Number(clean))) return Number(clean);

  if (clean.indexOf('.') !== -1 && clean.indexOf(',') !== -1) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.indexOf(',') !== -1) {
    clean = clean.replace(',', '.');
  }

  return parseFloat(clean) || 0;
};

const generateMockData = (): SheetRow[] => {
  const hotels = [HotelName.Amalinas, HotelName.IRUYA, HotelName.Nubes];
  // Extended to cover full year to address user feedback
  const months = [
    '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
    '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'
  ];
  const data: SheetRow[] = [];

  hotels.forEach(hotel => {
    months.forEach(month => {
      const seasonality = (month === '2023-01' || month === '2023-07') ? 1.5 : 1.0;

      // Ingresos
      const direct = (Math.random() * 50000 + 20000) * seasonality;
      const ota = (Math.random() * 40000 + 15000) * seasonality;
      const rest = (Math.random() * 15000 + 5000) * seasonality;
      const events = Math.random() * 10000;

      data.push({ Hotel: hotel, Concepto: 'Directos', Grupo: 'Ingresos Alojamiento', Mes: month, Valor: direct, Unidad: '$', Canal: 'Directos' });
      data.push({ Hotel: hotel, Concepto: 'Booking', Grupo: 'Ingresos Alojamiento', Mes: month, Valor: ota * 0.6, Unidad: '$', Canal: 'Booking' });
      data.push({ Hotel: hotel, Concepto: 'Despegar', Grupo: 'Ingresos Alojamiento', Mes: month, Valor: ota * 0.4, Unidad: '$', Canal: 'Despegar' });
      data.push({ Hotel: hotel, Concepto: 'Restaurante', Grupo: 'Ingresos Otros', Mes: month, Valor: rest, Unidad: '$', Canal: 'Restaurante' });
      data.push({ Hotel: hotel, Concepto: 'Eventos', Grupo: 'Ingresos Otros', Mes: month, Valor: events, Unidad: '$', Canal: 'Eventos' });

      const totalIngresos = direct + ota + rest + events;
      data.push({ Hotel: hotel, Concepto: 'TOTAL INGRESOS DEL MES', Grupo: 'Resumen', Mes: month, Valor: totalIngresos, Unidad: '$' });

      // Egresos
      const personal = totalIngresos * 0.35;
      const services = totalIngresos * 0.15;
      const taxes = totalIngresos * 0.10;
      const otherCosts = totalIngresos * 0.10;
      const totalEgresos = personal + services + taxes + otherCosts;

      data.push({ Hotel: hotel, Concepto: 'Personal hotel', Grupo: 'Egresos', Mes: month, Valor: personal, Unidad: '$' });
      data.push({ Hotel: hotel, Concepto: 'Servicios hotel', Grupo: 'Egresos', Mes: month, Valor: services, Unidad: '$' });
      data.push({ Hotel: hotel, Concepto: 'Impuestos', Grupo: 'Egresos', Mes: month, Valor: taxes, Unidad: '$' });
      data.push({ Hotel: hotel, Concepto: 'TOTAL EGRESOS', Grupo: 'Resumen', Mes: month, Valor: totalEgresos, Unidad: '$' });

      // Resultado
      data.push({ Hotel: hotel, Concepto: 'RESULTADO', Grupo: 'Resumen', Mes: month, Valor: totalIngresos - totalEgresos, Unidad: '$' });

      // KPIs
      data.push({ Hotel: hotel, Concepto: 'Ocupación', Grupo: 'KPIs', Mes: month, Valor: Math.min(Math.random() * 40 + 50 * seasonality, 100), Unidad: '%' });
      data.push({ Hotel: hotel, Concepto: 'ADR', Grupo: 'KPIs', Mes: month, Valor: Math.random() * 50 + 100, Unidad: '$' });
      data.push({ Hotel: hotel, Concepto: 'RevPAR', Grupo: 'KPIs', Mes: month, Valor: Math.random() * 50 + 80, Unidad: '$' });
    });
  });

  return data;
};

export const fetchSheetData = async (): Promise<SheetRow[]> => {
  try {
    // Add cache buster
    const url = `${CSV_URL}&t=${Date.now()}`;
    console.log(`Fetching data from ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    if (csvText.trim().toLowerCase().startsWith('<!doctype html') || csvText.includes('<html')) {
      console.error("Received HTML instead of CSV.");
      throw new Error("Auth required / Sheet not public");
    }

    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV is empty");

    const separator = detectSeparator(lines[0]);
    console.log(`Detected separator: ${separator}`);

    const parsedData: SheetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cols = parseCSVLine(line, separator);
      if (cols.length < 5) continue;

      const row: SheetRow = {
        Hotel: (cols[0] || '').trim(),
        Concepto: (cols[1] || '').trim(),
        Grupo: (cols[2] || '').trim(),
        Mes: (cols[3] || '').trim(), // Mes might need trimming too 
        Valor: parseNumber(cols[4] || '0'),
        Unidad: (cols[5] || '').trim(),
        Canal: (cols[6] || '').trim()
      };

      if (i < 5) { // Log first few rows
        console.log(`Debug Row ${i}: `, row);
      }
      parsedData.push(row);
    }

    const uniqueConcepts = Array.from(new Set(parsedData.map(r => r.Concepto)));
    console.log("Debug: Found Concepts:", uniqueConcepts);

    if (parsedData.length === 0) {
      console.warn("Parsed 0 rows from Google Sheet. Using mock data.");
      return generateMockData();
    }

    console.log(`Successfully parsed ${parsedData.length} rows`);
    return parsedData;

  } catch (error) {
    console.error("Failed to fetch Google Sheet:", error);
    return generateMockData();
  }
};
