
export const parseMonthValue = (monthStr: string): number => {
  if (!monthStr) return 0;

  const lower = monthStr.toLowerCase().trim();

  // Handle ISO format YYYY-MM
  if (lower.match(/^\d{4}-\d{2}$/)) {
    return parseInt(lower.replace('-', ''), 10);
  }

  // Handle Spanish/English names
  const months: { [key: string]: string } = {
    'enero': '01', 'january': '01', 'jan': '01',
    'febrero': '02', 'february': '02', 'feb': '02',
    'marzo': '03', 'march': '03', 'mar': '03',
    'abril': '04', 'april': '04', 'apr': '04',
    'mayo': '05', 'may': '05',
    'junio': '06', 'june': '06', 'jun': '06',
    'julio': '07', 'july': '07', 'jul': '07',
    'agosto': '08', 'august': '08', 'aug': '08',
    'septiembre': '09', 'september': '09', 'sep': '09',
    'octubre': '10', 'october': '10', 'oct': '10',
    'noviembre': '11', 'november': '11', 'nov': '11',
    'diciembre': '12', 'december': '12', 'dec': '12'
  };

  // Try to find month name
  for (const [key, val] of Object.entries(months)) {
    if (lower.includes(key)) {
      // Try to find year
      const yearMatch = lower.match(/\d{4}/);
      let year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

      // Support 2-digit year (e.g., jan-23)
      if (!yearMatch) {
        const twoDigitMatch = lower.match(/-(\d{2})$/) || lower.match(/\s(\d{2})$/);
        if (twoDigitMatch) {
          year = '20' + twoDigitMatch[1];
        }
      }

      return parseInt(`${year}${val}`, 10);
    }
  }

  // Fallback for simple string comparison if format is unknown
  return 0;
};

export const sortMonths = (a: string, b: string): number => {
  return parseMonthValue(a) - parseMonthValue(b);
};
