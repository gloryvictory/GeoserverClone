import { create } from 'zustand';
import type { GeoserverConfig, SectionType, StyleItem, LayerItem, StoreItem, StyleDetail } from '@/types/geoserver';
import * as api from '@/services/geoserverApi';

type ConnectionStatus = 'idle' | 'success' | 'error';

interface GeoserverState {
  // Configurations
  server1: GeoserverConfig;
  server2: GeoserverConfig;

  // Current section
  section: SectionType;

  // Data from Geoservers
  server1Data: StyleItem[] | LayerItem[] | StoreItem[];
  server2Data: StyleItem[] | LayerItem[] | StoreItem[];

  // Selection state
  selectedServer1: string[];
  selectedServer2: string[];

  // Loading/error states
  loading: boolean;
  error: string | null;

  // Dialog state
  showInfoDialog: boolean;
  infoDialogData: StyleDetail | null;

  // Connection status
  connectionStatus1: ConnectionStatus;
  connectionStatus2: ConnectionStatus;
  connectionError1: string | null;
  connectionError2: string | null;
  testingConnection1: boolean;
  testingConnection2: boolean;

  // Messages for BottomPanel
  messages1: Array<{ id: string; text: string; type: 'error' | 'info' | 'success'; timestamp: number }>;
  messages2: Array<{ id: string; text: string; type: 'error' | 'info' | 'success'; timestamp: number }>;
  addMessage: (server: 1 | 2, text: string, type: 'error' | 'info' | 'success') => void;
  clearMessages: (server: 1 | 2) => void;

  // Actions
  setServer1Config: (config: Partial<GeoserverConfig>) => void;
  setServer2Config: (config: Partial<GeoserverConfig>) => void;
  setSection: (section: SectionType) => void;
  fetchData: () => Promise<void>;
  toggleSelectionServer1: (name: string) => void;
  toggleSelectionServer2: (name: string) => void;
  openInfoDialog: (data: StyleDetail | null) => void;
  closeInfoDialog: () => void;

  // Actions
  getInfo: (server: 1 | 2, name: string) => Promise<void>;
  downloadStyle: (server: 1 | 2, name: string) => Promise<void>;
  copyStyle: (server: 1 | 2) => Promise<void>;
  deleteSelected: (server: 1 | 2) => Promise<void>;
  testConnection: (server: 1 | 2) => Promise<void>;
}

export const useGeoserverStore = create<GeoserverState>((set, get) => ({
  // Initial state
  server1: { url: '', username: '', password: '' },
  server2: { url: '', username: '', password: '' },
  section: 'styles',
  server1Data: [],
  server2Data: [],
  selectedServer1: [],
  selectedServer2: [],
  loading: false,
  error: null,
  showInfoDialog: false,
  infoDialogData: null,
  connectionStatus1: 'idle' as ConnectionStatus,
  connectionStatus2: 'idle' as ConnectionStatus,
  connectionError1: null as string | null,
  connectionError2: null as string | null,
  testingConnection1: false,
  testingConnection2: false,
  messages1: [],
  messages2: [],

  // Message actions
  addMessage: (server: 1 | 2, text: string, type: 'error' | 'info' | 'success') =>
    set((state) => {
      const newMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        type,
        timestamp: Date.now(),
      };
      if (server === 1) {
        return { messages1: [...state.messages1, newMessage] };
      }
      return { messages2: [...state.messages2, newMessage] };
    }),

  clearMessages: (server: 1 | 2) =>
    set(() => {
      if (server === 1) {
        return { messages1: [] };
      }
      return { messages2: [] };
    }),

  // Config actions
  setServer1Config: (config: Partial<GeoserverConfig>) =>
    set((state) => ({
      server1: { ...state.server1, ...config },
    })),

  setServer2Config: (config: Partial<GeoserverConfig>) =>
    set((state) => ({
      server2: { ...state.server2, ...config },
    })),

  // Section action
  setSection: (section: SectionType) =>
    set(() => ({
      section,
      server1Data: [],
      server2Data: [],
      selectedServer1: [],
      selectedServer2: [],
      error: null,
    })),

  // Fetch data action
  fetchData: async () => {
    const { server1, server2, section } = get();
    set({ loading: true, error: null });

    try {
      let server1Result: StyleItem[] | LayerItem[] | StoreItem[] = [];
      let server2Result: StyleItem[] | LayerItem[] | StoreItem[] = [];

      if (section === 'styles') {
        if (server1.url) {
          server1Result = await api.fetchStyles(server1);
          get().addMessage(1, `Загружено ${server1Result.length} элементов`, 'success');
        }
        if (server2.url) {
          server2Result = await api.fetchStyles(server2);
          get().addMessage(2, `Загружено ${server2Result.length} элементов`, 'success');
        }
      } else if (section === 'layers') {
        if (server1.url) {
          server1Result = await api.fetchLayers(server1);
          get().addMessage(1, `Загружено ${server1Result.length} слоев`, 'success');
        }
        if (server2.url) {
          server2Result = await api.fetchLayers(server2);
          get().addMessage(2, `Загружено ${server2Result.length} слоев`, 'success');
        }
      } else if (section === 'stores') {
        if (server1.url) {
          server1Result = await api.fetchStores(server1);
          get().addMessage(1, `Загружено ${server1Result.length} хранилищ`, 'success');
        }
        if (server2.url) {
          server2Result = await api.fetchStores(server2);
          get().addMessage(2, `Загружено ${server2Result.length} хранилищ`, 'success');
        }
      }

      set({
        server1Data: server1Result,
        server2Data: server2Result,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      set({
        error: errorMessage,
        loading: false,
      });
      // Add error messages for both servers
      if (server1.url) {
        get().addMessage(1, `Ошибка загрузки: ${errorMessage}`, 'error');
      }
      if (server2.url) {
        get().addMessage(2, `Ошибка загрузки: ${errorMessage}`, 'error');
      }
    }
  },

  // Selection actions
  toggleSelectionServer1: (name: string) =>
    set((state) => ({
      selectedServer1: state.selectedServer1.includes(name)
        ? state.selectedServer1.filter((n) => n !== name)
        : [...state.selectedServer1, name],
    })),

  toggleSelectionServer2: (name: string) =>
    set((state) => ({
      selectedServer2: state.selectedServer2.includes(name)
        ? state.selectedServer2.filter((n) => n !== name)
        : [...state.selectedServer2, name],
    })),

  // Dialog actions
  openInfoDialog: (data: StyleDetail | null) =>
    set({ showInfoDialog: true, infoDialogData: data }),

  closeInfoDialog: () =>
    set({ showInfoDialog: false, infoDialogData: null }),

  // Info action
  getInfo: async (server: 1 | 2, name: string) => {
    const config = server === 1 ? get().server1 : get().server2;
    if (!config.url) {
      set({ error: 'Отсутствует конфигурация сервера' });
      return;
    }

    try {
      const detail = await api.getStyleDetail(config, name);
      set({ infoDialogData: detail, showInfoDialog: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Не удалось получить информацию',
      });
    }
  },

  // Download action
  downloadStyle: async (server: 1 | 2, name: string) => {
    const config = server === 1 ? get().server1 : get().server2;
    if (!config.url) {
      set({ error: 'Отсутствует конфигурация сервера' });
      return;
    }

    try {
      const { name: fileName, content } = await api.downloadStyleZip(config, name);

      // Create blob and download
      const blob = new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Не удалось скачать стиль',
      });
    }
  },

  // Copy action
  copyStyle: async (fromServer: 1 | 2) => {
    const { server1, server2 } = get();
    const toServer = fromServer === 1 ? 2 : 1;

    const fromConfig = fromServer === 1 ? server1 : server2;
    const toConfig = toServer === 1 ? server1 : server2;

    if (!fromConfig.url || !toConfig.url) {
      set({ error: 'Необходима конфигурация обоих серверов' });
      return;
    }

    const selectedFrom = fromServer === 1 ? get().selectedServer1 : get().selectedServer2;

    if (selectedFrom.length === 0) {
      set({ error: 'Нет выбранных элементов' });
      return;
    }

    set({ loading: true, error: null });

    try {
      for (const name of selectedFrom) {
        await api.copyStyle(fromConfig, toConfig, name);
      }

      get().addMessage(toServer, `Скопировано ${selectedFrom.length} элементов`, 'success');

      // Refresh data after copy (fetchData handles its own loading state)
      await get().fetchData();
    } catch (err) {
      get().addMessage(fromServer, `Ошибка копирования: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`, 'error');
      set({
        error: err instanceof Error ? err.message : 'Не удалось скопировать',
        loading: false,
      });
    }
  },

  // Delete action
  deleteSelected: async (server: 1 | 2) => {
    const config = server === 1 ? get().server1 : get().server2;
    const selected = server === 1 ? get().selectedServer1 : get().selectedServer2;

    if (!config.url) {
      set({ error: 'Отсутствует конфигурация сервера' });
      return;
    }

    if (selected.length === 0) {
      set({ error: 'Нет выбранных элементов' });
      return;
    }

    set({ loading: true, error: null });

    try {
      for (const name of selected) {
        if (get().section === 'styles') {
          await api.deleteStyle(config, name);
        } else if (get().section === 'layers') {
          await api.deleteLayer(config, name);
        } else if (get().section === 'stores') {
          await api.deleteStore(config, name);
        }
      }

      get().addMessage(server, `Удалено ${selected.length} элементов`, 'success');

      // Refresh data after delete (fetchData handles its own loading state)
      await get().fetchData();
    } catch (err) {
      get().addMessage(server, `Ошибка удаления: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`, 'error');
      set({
        error: err instanceof Error ? err.message : 'Не удалось удалить',
        loading: false,
      });
    }
  },

  // Test connection action
  testConnection: async (server: 1 | 2) => {
    const config = server === 1 ? get().server1 : get().server2;
    if (!config.url || !config.username || !config.password) {
      set({
        [`connectionStatus${server}`]: 'error' as ConnectionStatus,
        [`connectionError${server}`]: 'Заполните все поля подключения',
      });
      return;
    }

    set({ [`testingConnection${server}`]: true });

    try {
      const success = await api.testConnection(config);
      if (success) {
        set({
          [`connectionStatus${server}`]: 'success' as ConnectionStatus,
          [`connectionError${server}`]: null,
          [`testingConnection${server}`]: false,
        });
      } else {
        set({
          [`connectionStatus${server}`]: 'error' as ConnectionStatus,
          [`connectionError${server}`]: 'Сервер не ответил или вернул ошибку',
          [`testingConnection${server}`]: false,
        });
      }
    } catch (err) {
      set({
        [`connectionStatus${server}`]: 'error' as ConnectionStatus,
        [`connectionError${server}`]: err instanceof Error ? err.message : 'Не удалось подключиться к серверу',
        [`testingConnection${server}`]: false,
      });
    }
  },
}));
