import { useState, useEffect } from 'react';
import { useGeoserverStore } from '@/stores/geoserverStore';
import { X, Save } from 'lucide-react';
import type { GeoserverConfig } from '@/types/geoserver';

const STORAGE_KEY = 'geoserver_configs';

function loadFromStorage(): { server1: GeoserverConfig; server2: GeoserverConfig } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load configs from localStorage:', e);
  }
  return null;
}

function saveToStorage(config: { server1: GeoserverConfig; server2: GeoserverConfig }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save configs to localStorage:', e);
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { server1, server2, setServer1Config, setServer2Config } = useGeoserverStore();
  const [form1, setForm1] = useState<GeoserverConfig>({ url: '', username: '', password: '' });
  const [form2, setForm2] = useState<GeoserverConfig>({ url: '', username: '', password: '' });

  // Load from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = loadFromStorage();
      if (stored) {
        setForm1(stored.server1);
        setForm2(stored.server2);
      } else {
        setForm1(server1);
        setForm2(server2);
      }
    }
  }, [isOpen, server1, server2]);

  const handleSave = () => {
    setServer1Config(form1);
    setServer2Config(form2);
    saveToStorage({ server1: form1, server2: form2 });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Настройки геосерверов</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Geoserver №1 */}
          <div className="space-y-3">
            <h3 className="text-md font-medium text-foreground">Геосервер №1</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">URL</label>
              <input
                type="text"
                value={form1.url}
                onChange={(e) => setForm1({ ...form1, url: e.target.value })}
                placeholder="http://localhost:8080/geoserver"
                className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Login</label>
                <input
                  type="text"
                  value={form1.username}
                  onChange={(e) => setForm1({ ...form1, username: e.target.value })}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Password</label>
                <input
                  type="password"
                  value={form1.password}
                  onChange={(e) => setForm1({ ...form1, password: e.target.value })}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Geoserver №2 */}
          <div className="space-y-3">
            <h3 className="text-md font-medium text-foreground">Геосервер №2</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">URL</label>
              <input
                type="text"
                value={form2.url}
                onChange={(e) => setForm2({ ...form2, url: e.target.value })}
                placeholder="http://localhost:8081/geoserver"
                className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Login</label>
                <input
                  type="text"
                  value={form2.username}
                  onChange={(e) => setForm2({ ...form2, username: e.target.value })}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Password</label>
                <input
                  type="password"
                  value={form2.password}
                  onChange={(e) => setForm2({ ...form2, password: e.target.value })}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
