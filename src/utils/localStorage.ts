import { BusLog } from '../types/database.types';

const STORAGE_KEY = 'bus_logs';

export const saveBusLog = (log: Omit<BusLog, 'id' | 'created_at'>) => {
  const logs = getBusLogs();
  const newLog = {
    ...log,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  logs.push(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return newLog;
};

export const getBusLogs = (): BusLog[] => {
  const logs = localStorage.getItem(STORAGE_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const getBusLogsByDriver = (driverId: string): BusLog[] => {
  return getBusLogs().filter(log => log.driver_id === driverId);
};