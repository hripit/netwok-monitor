import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Host } from '../types';
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions  } from 'ag-grid-community';

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
    filter: true,
    resizable: true,
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <div className="d-flex gap-2 mb-3">
        <Button
          variant="contained"
          color="primary"
          onClick={onRefresh}
          startIcon={<RefreshIcon />}
        >
          Обновить данные
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={exportToCSV}
          startIcon={<DownloadIcon />}
        >
          Экспорт в CSV
        </Button>
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={[
          {
            field: 'ip',
            headerName: 'IP-адрес',
            minWidth: 150
          },
          {
            field: 'status',
            cellStyle: (params) => ({
              color: params.value === 'online' ? 'green' : 'red',
              fontWeight: 'bold'
            })
          },
          {
            field: 'rtt',
            headerName: 'RTT (мс)',
            valueFormatter: (params) =>
              params.value ? params.value.toFixed(1) : 'N/A'
          },
          {
            field: 'delivered',
            headerName: '% доставки',
            valueFormatter: (params) =>
              params.value ? `${params.value.toFixed(1)}%` : '0%'
          },
          {
            field: 'loss',
            headerName: '% потерь',
            valueFormatter: (params) =>
              params.value ? `${params.value.toFixed(1)}%` : '0%'
          },
          {
            field: 'last_ping',
            headerName: 'Последняя проверка',
            valueFormatter: (params) =>
              params.value ? new Date(params.value).toLocaleString() : 'N/A'
          },
        ]}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        rowSelection={{ mode: 'single',
                    enableCellTextSelection: false }}
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