import { useState } from 'react';
import { useGeoserverStore } from '@/stores/geoserverStore';
import { AlertCircle, CheckCircle2, Info, X, ChevronDown, ChevronUp } from 'lucide-react';

export function BottomPanel() {
  const { messages1, messages2, clearMessages } = useGeoserverStore();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const hasMessages = messages1.length > 0 || messages2.length > 0;

  const currentMessages = activeTab === 1 ? messages1 : messages2;
  const serverLabel = activeTab === 1 ? 'Geoserver №1' : 'Geoserver №2';

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const handleClearMessages = () => {
    clearMessages(activeTab);
  };

  return (
    <div className="border-t bg-card border-t-muted flex flex-col-reverse">
      {/* Expanded Messages List - expands upward */}
      {expanded && (
        <div className="max-h-40 overflow-y-auto p-2 space-y-1">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                msg.type === 'error'
                  ? 'bg-destructive/10 text-destructive'
                  : msg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              {getMessageIcon(msg.type)}
              <span className="flex-1 truncate">{msg.text}</span>
              <span className="text-muted-foreground opacity-70 flex-shrink-0">
                {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          ))}
          {currentMessages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Нет сообщений
            </p>
          )}
        </div>
      )}

      {/* Toggle Bar - always visible at bottom */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-muted">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <span>Сообщения</span>
            {hasMessages && (
              <span className="flex items-center gap-0.5 bg-destructive/20 text-destructive text-xs px-1.5 py-0.5 rounded-full">
                {messages1.length + messages2.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Server Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab(1)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                activeTab === 1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {serverLabel}
              {messages1.length > 0 && (
                <span className="ml-1 text-xs opacity-75">({messages1.length})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                activeTab === 2
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Geoserver №2
              {messages2.length > 0 && (
                <span className="ml-1 text-xs opacity-75">({messages2.length})</span>
              )}
            </button>
          </div>

          {/* Clear Button */}
          {currentMessages.length > 0 && (
            <button
              onClick={handleClearMessages}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Очистить сообщения"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
