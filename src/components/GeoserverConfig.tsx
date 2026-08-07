import { useEffect, useCallback, useRef } from 'react';
import { useGeoserverStore } from '@/stores/geoserverStore';
import toast from 'react-hot-toast';
import { Server, Lock, User, Globe } from 'lucide-react';

export function GeoserverConfig() {
  const prevStatus1Ref = useRef<string | null>(null);
  const prevStatus2Ref = useRef<string | null>(null);

  const {
    server1,
    server2,
    connectionStatus1,
    connectionStatus2,
    connectionError1,
    connectionError2,
    setServer1Config,
    setServer2Config,
    testConnection,
  } = useGeoserverStore();

  // Auto-test connection when all fields are filled
  const checkAndTestConnection1 = useCallback(() => {
    if (server1.url && server1.username && server1.password) {
      testConnection(1);
    }
  }, [server1.url, server1.username, server1.password, testConnection]);

  const checkAndTestConnection2 = useCallback(() => {
    if (server2.url && server2.username && server2.password) {
      testConnection(2);
    }
  }, [server2.url, server2.username, server2.password, testConnection]);

  // Show toast on connection error (only once per status change)
  useEffect(() => {
    if (connectionStatus1 === 'error' && connectionError1 && prevStatus1Ref.current !== 'error') {
      toast.error(`Ошибка подключения к Geoserver #1: ${connectionError1}`);
    }
    prevStatus1Ref.current = connectionStatus1;
  }, [connectionStatus1, connectionError1]);

  useEffect(() => {
    if (connectionStatus2 === 'error' && connectionError2 && prevStatus2Ref.current !== 'error') {
      toast.error(`Ошибка подключения к Geoserver #2: ${connectionError2}`);
    }
    prevStatus2Ref.current = connectionStatus2;
  }, [connectionStatus2, connectionError2]);

  // Get URL input border classes based on status
  const getUrlBorderClasses = (status: string) => {
    const baseClasses = 'flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary';
    if (status === 'success') {
      return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }
    if (status === 'error') {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return baseClasses;
  };

  return (
    <div className="space-y-4">
      {/* Server Configuration Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Server 1 Configuration */}
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Geoserver #1</h2>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={server1.url}
                onChange={(e) => {
                  setServer1Config({ url: e.target.value });
                  checkAndTestConnection1();
                }}
                placeholder="http://localhost:8080/geoserver"
                className={getUrlBorderClasses(connectionStatus1)}
              />
            </div>
          </div>

          {/* Username and Password */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Имя пользователя
              </label>
              <input
                type="text"
                value={server1.username}
                onChange={(e) => {
                  setServer1Config({ username: e.target.value });
                  checkAndTestConnection1();
                }}
                placeholder="admin"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Пароль
              </label>
              <input
                type="password"
                value={server1.password}
                onChange={(e) => {
                  setServer1Config({ password: e.target.value });
                  checkAndTestConnection1();
                }}
                placeholder="geoserver"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Server 2 Configuration */}
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Geoserver #2</h2>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={server2.url}
                onChange={(e) => {
                  setServer2Config({ url: e.target.value });
                  checkAndTestConnection2();
                }}
                placeholder="http://localhost:8080/geoserver"
                className={getUrlBorderClasses(connectionStatus2)}
              />
            </div>
          </div>

          {/* Username and Password */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Имя пользователя
              </label>
              <input
                type="text"
                value={server2.username}
                onChange={(e) => {
                  setServer2Config({ username: e.target.value });
                  checkAndTestConnection2();
                }}
                placeholder="admin"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Пароль
              </label>
              <input
                type="password"
                value={server2.password}
                onChange={(e) => {
                  setServer2Config({ password: e.target.value });
                  checkAndTestConnection2();
                }}
                placeholder="geoserver"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
