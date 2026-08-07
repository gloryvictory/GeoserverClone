import { useGeoserverStore } from '@/stores/geoserverStore';
import { Info, Download, Copy, Trash2 } from 'lucide-react';

export function ActionPanel() {
  const {
    section,
    selectedServer1,
    selectedServer2,
    getInfo,
    downloadStyle,
    copyStyle,
    deleteSelected,
  } = useGeoserverStore();

  const totalSelected = selectedServer1.length + selectedServer2.length;

  const handleInfo = () => {
    if (selectedServer1.length > 0) {
      getInfo(1, selectedServer1[0]);
    } else if (selectedServer2.length > 0) {
      getInfo(2, selectedServer2[0]);
    }
  };

  const handleDownload = () => {
    if (selectedServer1.length > 0) {
      downloadStyle(1, selectedServer1[0]);
    } else if (selectedServer2.length > 0) {
      downloadStyle(2, selectedServer2[0]);
    }
  };

  const handleCopy = () => {
    if (selectedServer1.length > 0) {
      copyStyle(1);
    } else if (selectedServer2.length > 0) {
      copyStyle(2);
    }
  };

  const handleDelete = () => {
    if (selectedServer1.length > 0) {
      deleteSelected(1);
    } else if (selectedServer2.length > 0) {
      deleteSelected(2);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <button
        onClick={handleInfo}
        disabled={totalSelected === 0}
        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Просмотр информации о выбранном элементе"
      >
        <Info className="h-4 w-4" />
        <span>Инфо</span>
      </button>

      {section === 'styles' && (
        <button
          onClick={handleDownload}
          disabled={totalSelected === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Скачать SLD файл"
        >
          <Download className="h-4 w-4" />
          <span>Загрузить</span>
        </button>
      )}

      {section === 'styles' && (
        <button
          onClick={handleCopy}
          disabled={totalSelected === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Скопировать выбранное на другой сервер"
        >
          <Copy className="h-4 w-4" />
          <span>Скопировать</span>
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={totalSelected === 0}
        className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Удалить выбранные элементы"
      >
        <Trash2 className="h-4 w-4" />
        <span>Удалить</span>
      </button>
    </div>
  );
}
