import React from 'react';
import { useGeoserverStore } from '@/stores/geoserverStore';
import { Palette, Layers, Database, ChevronDown } from 'lucide-react';
import { type SectionType } from '@/types/geoserver';

const sectionConfig = {
  styles: { label: 'Стили', icon: Palette },
  layers: { label: 'Слои', icon: Layers },
  stores: { label: 'Хранилища', icon: Database },
};

export function SectionSelector() {
  const { section, setSection, fetchData, loading, server1, server2 } = useGeoserverStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSectionChange = (newSection: SectionType) => {
    setSection(newSection);
    setIsOpen(false);
  };

  const handleFetch = () => {
    fetchData();
  };

  const currentLabel = sectionConfig[section].label;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Разделы:</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(() => {
            const CurrentIcon = sectionConfig[section].icon;
            return <CurrentIcon className="h-4 w-4" />;
          })()}
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-card border rounded-md shadow-lg z-50 min-w-[150px]">
            {(Object.keys(sectionConfig) as SectionType[]).map((key) => {
              const isActive = section === key;
              const Icon = sectionConfig[key].icon;
              return (
                <button
                  key={key}
                  onClick={() => handleSectionChange(key)}
                  disabled={loading}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  } ${key !== 'styles' ? 'border-t' : ''}`}
                >
                  {(() => { const I = Icon; return <I className="h-4 w-4" />; })()}
                  {sectionConfig[key].label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleFetch}
        disabled={loading || (!server1.url && !server2.url)}
        className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span> Загрузка...
          </>
        ) : (
          <>
            <Layers className="h-4 w-4" /> Загрузить
          </>
        )}
      </button>
    </div>
  );
}
