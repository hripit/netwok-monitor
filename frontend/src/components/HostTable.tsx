// src/components/HostTable.tsx
import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Host } from '../types';
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions, ColDef} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });

interface HostTableProps {
  hosts: Host[];
  onRefresh: () => void;
}

const HostTable: React.FC<HostTableProps> = ({ hosts, onRefresh }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<Host[]>(hosts);

  useEffect(() => {
    setRowData(hosts);
  }, [hosts]);

  const exportToCSV = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `monitoring_${new Date().toISOString().slice(0,10)}.csv`,
        columnSeparator: ';',
        processCellCallback: (params) => {
          if (params.column.getColId() === 'last_ping') {
            return params.value ? new Date(params.value).toLocaleString() : '';
          }
          if (['delivered', 'loss'].includes(params.column.getColId())) {
            return `${params.value.toFixed(2)}%`;
          }
          return params.value;
        },
      });
    }
  };

  const defaultColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    cellStyle: (params: any) => ({
      color: params.value === 'online' ? 'green' : params.value === 'offline' ? 'red' : 'black',
      fontWeight: 'bold'
    })
  };

  // Явное указание типа колонок
  const columnDefs: ColDef<Host>[] = [
    {
      field: 'ip',
      headerName: 'IP-адрес',
      pinned: 'left', // Допустимое значение
      minWidth: 150
    },
    {
      field: 'status',
      headerName: 'Статус',
      cellStyle: (params) => ({
        color: params.value === 'online' ? 'green' : 'red',
        fontWeight: 'bold'
      }),
      width: 120,
      checkboxSelection: false
    },
    {
      field: 'rtt',
      headerName: 'RTT (мс)',
      valueFormatter: (params) =>
          params.value ? params.value.toFixed(1) : 'N/A',
      width: 120
    },
    {
      field: 'delivered',
      headerName: '% доставки',
      valueFormatter: (params) =>
          params.value ? `${params.value.toFixed(1)}%` : '0%',
      width: 120
    },
    {
      field: 'loss',
      headerName: '% потерь',
      valueFormatter: (params) =>
          params.value ? `${params.value.toFixed(1)}%` : '0%',
      width: 120
    },
    {
      field: 'last_ping',
      headerName: 'Последняя проверка',
      valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : 'N/A',
      width: 200
    }
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: '70vh', width: '100%' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          style={{ marginRight: '1rem' }}
        >
          Обновить данные
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
        >
          Экспорт в CSV
        </Button>
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        rowSelection={{ mode: 'singleRow', }}
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