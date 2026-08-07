import { useGeoserverStore } from '@/stores/geoserverStore';

export function StatusBar() {
  const {
    server1Data,
    server2Data,
    selectedServer1,
    selectedServer2,
  } = useGeoserverStore();

  const total1 = server1Data.length;
  const total2 = server2Data.length;
  const total = total1 + total2;

  const selected1 = selectedServer1.length;
  const selected2 = selectedServer2.length;
  const selected = selected1 + selected2;

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-md text-sm">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Geoserver №1: <span className="font-medium text-foreground">{selected1}</span> / {total1}
        </span>
        <span className="text-muted-foreground">
          Geoserver №2: <span className="font-medium text-foreground">{selected2}</span> / {total2}
        </span>
      </div>
      <div className="font-medium text-primary">
        Выбрано: {selected} / Всего: {total}
      </div>
    </div>
  );
}
