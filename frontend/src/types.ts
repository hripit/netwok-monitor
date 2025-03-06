export interface Host {
  id: string;
  url: string;
  status: 'Online' | 'Offline';
  responseTime: number | null;
  lastChecked: Date | null;
}