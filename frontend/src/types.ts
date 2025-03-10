export type Host = {
  ip: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
  rtt: number | null;
  delivered: number;
  loss: number;
  last_ping: string;
};

// Новый тип для экспорта данных
export type ExportHost = {
  ip: string;
  status: string;
  rtt: string;
  delivered: string;
  loss: string;
  last_ping: string;
};