const MIN_DB = -65;
const MAX_DB = 6;
const MIN_ALSA = 0;
const MAX_ALSA = 65535;

export function alsaToDB(alsaValue: number): number {
  alsaValue = Math.max(MIN_ALSA, Math.min(MAX_ALSA, Math.round(alsaValue)));
  
  if (alsaValue === 0) return MIN_DB;
  
  const db = 20 * Math.log10(alsaValue / 32768);
  return Math.max(MIN_DB, Math.min(MAX_DB, Math.round(db * 2) / 2));
}

export function dbToALSA(dbValue: number): number {
  dbValue = Math.max(MIN_DB, Math.min(MAX_DB, Math.round(dbValue * 2) / 2));
  
  if (dbValue === MIN_DB) return MIN_ALSA;
  
  const alsaValue = Math.round(32768 * Math.pow(10, dbValue / 20));
  return Math.max(MIN_ALSA, Math.min(MAX_ALSA, alsaValue));
}

export const percentageToDb = (percentage: number): number => {
  const db = (percentage / 100) * (MAX_DB - MIN_DB) + MIN_DB;
  return Math.max(MIN_DB, Math.min(MAX_DB, Math.round(db * 2) / 2));
}