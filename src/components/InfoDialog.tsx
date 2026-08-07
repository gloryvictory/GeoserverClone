import { useGeoserverStore } from '@/stores/geoserverStore';
import { X } from 'lucide-react';

export function InfoDialog() {
  const { showInfoDialog, infoDialogData, closeInfoDialog } = useGeoserverStore();

  if (!showInfoDialog || !infoDialogData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Информация о стиле</h2>
          <button
            onClick={closeInfoDialog}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Название</h3>
            <p className="text-foreground break-all">{infoDialogData.name || 'Н/Д'}</p>
          </div>

          {/* Filename */}
          {infoDialogData.filename && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Имя файла</h3>
              <p className="text-foreground break-all">{infoDialogData.filename}</p>
            </div>
          )}

          {/* Mimetype */}
          {infoDialogData.mimetype && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Тип контента</h3>
              <p className="text-foreground">{infoDialogData.mimetype}</p>
            </div>
          )}

          {/* Store */}
          {infoDialogData.store && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Хранилище</h3>
              <p className="text-foreground">{infoDialogData.store}</p>
            </div>
          )}

          {/* Workspace */}
          {infoDialogData.workspace && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Рабочая область</h3>
              <p className="text-foreground">{infoDialogData.workspace}</p>
            </div>
          )}

          {/* SLD Content */}
          {infoDialogData.sld && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Содержимое SLD</h3>
              <pre className="bg-muted/50 p-3 rounded-md text-xs overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                {infoDialogData.sld}
              </pre>
            </div>
          )}

          {/* Additional metadata (href, etc.) */}
          {infoDialogData.store && infoDialogData.workspace && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Метаданные</h3>
              <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                <div><span className="font-medium">Workspace:</span> {infoDialogData.workspace}</div>
                <div><span className="font-medium">Store:</span> {infoDialogData.store}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={closeInfoDialog}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
