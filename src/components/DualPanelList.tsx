import { useGeoserverStore } from '@/stores/geoserverStore';
import type { StyleItem, LayerItem, StoreItem } from '@/types/geoserver';
import { Check, Info, Download, Copy, Trash2 } from 'lucide-react';

export function DualPanelList() {
  const {
    server1Data,
    server2Data,
    selectedServer1,
    selectedServer2,
    loading,
    error,
    toggleSelectionServer1,
    toggleSelectionServer2,
    section,
    getInfo,
    downloadStyle,
    copyStyle,
    deleteSelected,
  } = useGeoserverStore();

  const server1Label = 'Geoserver №1';
  const server2Label = 'Geoserver №2';

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

  const actionButtonClasses = 'flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const deleteButtonClasses = 'flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const renderList = (
    data: StyleItem[] | LayerItem[] | StoreItem[],
    selected: string[],
    server: 1 | 2
  ) => (
    <div className="flex-1 overflow-auto border rounded-lg p-4 bg-card">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground sticky top-0 bg-card pb-2 z-10">
        {server === 1 ? server1Label : server2Label}
        <span className="ml-2 text-xs font-normal">({data.length})</span>
      </h3>

      {data.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Нет элементов
          </p>
      )}

      <ul className="space-y-1">
        {data.map((item) => {
          const name = (item as any).name;
          const isSelected = selected.includes(name);
          return (
            <li key={name}>
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (server === 1) {
                      toggleSelectionServer1(name);
                    } else {
                      toggleSelectionServer2(name);
                    }
                  }}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </span>
                <span className="truncate">{name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const statusClasses = "mt-2 py-1.5 px-3 bg-muted/30 rounded-md text-sm text-muted-foreground";

  const renderServerPanel = (
    data: StyleItem[] | LayerItem[] | StoreItem[],
    selected: string[],
    server: 1 | 2
  ) => (
    <div className="flex flex-col flex-1">
      {renderList(data, selected, server)}
      <div className={statusClasses}>
        {server === 1 ? server1Label : server2Label}: {selected.length} / {data.length}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Пожалуйста, проверьте настройки подключения и попробуйте снова.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 flex-1">
      {/* Server 1 Panel */}
      {renderServerPanel(server1Data, selectedServer1, 1)}

      {/* Action Panel (middle) */}
      <div className="lg:w-48 flex-shrink-0 overflow-auto border rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground sticky top-0 bg-card pb-2 z-10">
          Действия
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleInfo}
            disabled={totalSelected === 0}
            className={actionButtonClasses}
            title="Просмотр информации о выбранном элементе"
          >
            <Info className="h-4 w-4" />
            <span>Инфо</span>
          </button>

          {section === 'styles' && (
            <button
              onClick={handleDownload}
              disabled={totalSelected === 0}
              className={actionButtonClasses}
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
              className={actionButtonClasses}
              title="Скопировать выбранное на другой сервер"
            >
              <Copy className="h-4 w-4" />
              <span>Скопировать</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={totalSelected === 0}
            className={deleteButtonClasses}
            title="Удалить выбранные элементы"
          >
            <Trash2 className="h-4 w-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>

      {/* Server 2 Panel */}
      {renderServerPanel(server2Data, selectedServer2, 2)}
    </div>
  );
}
