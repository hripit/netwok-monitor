// src/components/HostTable.tsx
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Host } from '../types';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });

interface HostTableProps {
  hosts: Host[];
}

const HostTable: React.FC<HostTableProps> = ({ hosts }) => {
  const [rowData, setRowData] = useState<Host[]>(hosts);
  const [highlightedRows, setHighlightedRows] = useState<string[]>([]);

  useEffect(() => {
    setRowData(hosts);

    // Подсветка изменённых строк
    const updatedIps = hosts.map(host => host.ip);
    setHighlightedRows(updatedIps);

    // Убираем подсветку через 1 сек
    const timer = setTimeout(() => setHighlightedRows([]), 1000);

    return () => clearTimeout(timer);
  }, [hosts]);

  const defaultColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    cellStyle: (params: any) => ({
      color: params.value === 'online' ? 'green' : params.value === 'offline' ? 'red' : 'black',
      fontWeight: 'bold',
      backgroundColor: highlightedRows.includes(params.data?.ip) ? '#e6ffe6' : 'transparent', // Подсветка изменений
    }),
  };

  const columnDefs: ColDef<Host>[] = [
    {
      field: 'ip',
      headerName: 'IP-адрес',
      pinned: 'left',
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Статус',
      cellStyle: (params: any) => {
        const ip = params.data?.ip;
        return {
          color: params.value === 'online' ? 'green' : params.value === 'offline' ? 'red' : 'black',
          fontWeight: 'bold',
          backgroundColor: ip && highlightedRows.includes(ip) ? '#e6ffe6' : 'transparent', // Подсветка изменений
        };
      },
      width: 120,
    },
    {
      field: 'rtt',
      headerName: 'RTT (мс)',
      valueFormatter: (params) =>
          params.value ? params.value.toFixed(1) : 'N/A',
      width: 120,
    },
    {
      field: 'delivered',
      headerName: '% доставки',
      valueFormatter: (params) =>
          params.value ? `${params.value.toFixed(1)}%` : '0%',
      width: 120,
    },
    {
      field: 'loss',
      headerName: '% потерь',
      valueFormatter: (params) =>
          params.value ? `${params.value.toFixed(1)}%` : '0%',
      width: 120,
    },
    {
      field: 'last_ping',
      headerName: 'Последняя проверка',
      valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : 'N/A',
      width: 200,
    },
  ];

  return (
      <div className="ag-theme-alpine" style={{ height: '70vh', width: '100%' }}>
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            localeText={{
              page: 'Страница',
              to: 'из',
              of: 'всего',
              noRowsToShow: 'Нет данных для отображения',
            }}
        />
      </div>
  );
};

export default HostTable;