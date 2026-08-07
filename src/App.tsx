import { useEffect, useState } from 'react';
import { GeoserverConfig } from './components/GeoserverConfig';
import { SectionSelector } from './components/SectionSelector';
import { DualPanelList } from './components/DualPanelList';
import { InfoDialog } from './components/InfoDialog';
import { BottomPanel } from './components/BottomPanel';
import { SettingsModal } from './components/SettingsModal';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';
import { useGeoserverStore } from '@/stores/geoserverStore';
import { Sun, Moon, Settings } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useThemeStore();
  const { setServer1Config, setServer2Config } = useGeoserverStore();
  const [showSettings, setShowSettings] = useState(false);

  // Load configs from localStorage on app initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem('geoserver_configs');
      if (stored) {
        const configs = JSON.parse(stored);
        if (configs.server1) {
          setServer1Config(configs.server1);
        }
        if (configs.server2) {
          setServer2Config(configs.server2);
        }
      }
    } catch (e) {
      console.error('Failed to load configs from localStorage:', e);
    }
  }, [setServer1Config, setServer2Config]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="border-b px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🗺️</span> Управление Geoserver
          </h1>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
              title="Настройки геосерверов"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Настройки</span>
            </button>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
              title="Переключить тему"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{theme === 'light' ? 'Темная' : 'Светлая'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 gap-4 max-w-full">
        {/* Configuration Section */}
        <section>
          <GeoserverConfig />
        </section>

        {/* Section Selector */}
        <section>
          <SectionSelector />
        </section>

        {/* Dual Panel List */}
        <section className="flex-1 min-h-[400px]">
          <DualPanelList />
        </section>
      </main>

      {/* Info Dialog */}
      <InfoDialog />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  );
}

export default App;
