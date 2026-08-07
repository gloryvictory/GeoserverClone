# Промт: Создание приложения Geoserver Manager

## Описание задачи

Создать веб-приложение на React 18 + TypeScript под названием **"Geoserver Manager"** (gsrv2gsrv) — инструмент управления двумя экземплярами Geoserver, позволяющий пользователям подключаться, сравнивать и управлять двумя экземплярами Geoserver бок о бок через их REST API.

---

## Назначение приложения

Приложение предоставляет единый интерфейс для:
- Одновременного подключения к двум экземплярам Geoserver
- Просмотра и сравнения Стилей, Слоёв и Хранилищ на обоих экземплярах
- Управления стилями (просмотр деталей, скачивание, копирование между серверами, удаление)
- Управления слоями и хранилищами (просмотр, удаление)
- Мониторинга статуса в реальном времени с отслеживанием выбранных элементов

---

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|-----------|
| React | 18.2.0 | UI фреймворк |
| TypeScript | 5.0.2 | Типобезопасная разработка |
| Vite | 4.4.5 | Сборщик и сервер разработки |
| TailwindCSS | 3.3.5 | Utility-first CSS фреймворк |
| Zustand | 4.4.0 | Управление состоянием |
| lucide-react | 0.263.1 | Библиотека иконок |
| react-hot-toast | 2.6.0 | Всплывающие уведомления (toast) |
| clsx | 2.0.0 | Условное объединение имён классов |
| tailwind-merge | 1.14.0 | Объединение Tailwind-классов |
| jszip | 3.10.1 | Работа с ZIP-архивами для скачивания стилей |

---

## Структура проекта

```
gsrv2gsrv/
├── index.html                    # Входной HTML-файл
├── package.json                  # Зависимости и скрипты
├── tsconfig.json                 # Конфигурация TypeScript
├── tsconfig.node.json            # Конфигурация TypeScript для Node
├── vite.config.ts                # Конфигурация Vite
├── tailwind.config.js            # Конфигурация TailwindCSS
├── postcss.config.js             # Конфигурация PostCSS
└── src/
    ├── main.tsx                  # Точка входа React
    ├── App.tsx                   # Корневой компонент
    ├── index.css                 # Глобальные стили (импорты TailwindCSS)
    ├── lib/
    │   └── utils.ts              # Вспомогательные функции (helper cn)
    ├── types/
    │   └── geoserver.ts          # TypeScript интерфейсы
    ├── stores/
    │   ├── geoserverStore.ts     # Zustand store (основное состояние)
    │   └── themeStore.ts         # Theme store (светлая/тёмная тема)
    ├── services/
    │   └── geoserverApi.ts       # Слой сервиса REST API Geoserver
    └── components/
        ├── GeoserverConfig.tsx   # Панель конфигурации подключения
        ├── SectionSelector.tsx   # Выпадающий список (Стили/Слои/Хранилища)
        ├── DualPanelList.tsx     # Двухпанельный список с флажками
        ├── ActionPanel.tsx       # Кнопки действий (Инфо, Скачать, Копировать, Удалить)
        ├── StatusBar.tsx         # Счётчик выбранных/всего
        ├── InfoDialog.tsx        # Диалог информации о стиле
        ├── BottomPanel.tsx       # Панель сообщений
        └── SettingsModal.tsx     # Модальное окно настроек
```

---

## TypeScript типы (`src/types/geoserver.ts`)

```typescript
export interface GeoserverConfig {
  url: string;
  username: string;
  password: string;
}

export type SectionType = 'styles' | 'layers' | 'stores';

export interface StyleItem {
  name: string;
  href: string;
  filename?: string;
}

export interface LayerItem {
  name: string;
  href: string;
  type?: string;
}

export interface StoreItem {
  name: string;
  href: string;
  description?: string;
  status?: string;
}

export interface StyleDetail {
  name: string;
  filename?: string;
  mimetype?: string;
  store?: string;
  workspace?: string;
  sld?: string;
}
```

---

## Слой API сервиса (`src/services/geoserverApi.ts`)

Реализовать следующие функции с использованием нативного `fetch`:

### Аутентификация
- Все запросы используют **Basic Auth** с `btoa(`${username}:${password}`)`
- Content-Type: `text/plain` для большинства эндпоинтов, `application/json` для проверки версии
- Базовый URL: `{config.url}/geoserver/rest/`

### Функции

1. **`testConnection(config: GeoserverConfig): Promise<boolean>`**
   - Эндпоинт: `GET {url}/geoserver/rest/about/version.json`
   - Возвращает `true`, если ответ успешный (200)

2. **`fetchStyles(config: GeoserverConfig): Promise<StyleItem[]>`**
   - Эндпоинт: `GET /geoserver/rest/styles.json`
   - Парсит массив `data.styles.style`

3. **`fetchLayers(config: GeoserverConfig): Promise<LayerItem[]>`**
   - Эндпоинт: `GET {url}/geoserver/rest/layers.json`
   - Парсит массив `data.layers.layer`

4. **`fetchStores(config: GeoserverConfig): Promise<StoreItem[]>`**
   - Эндпоинт: `GET {url}/geoserver/rest/workspaces.json`, затем `GET /geoserver/rest/workspaces/{ws}/stores.json`
   - Агрегирует хранилища из всех рабочих пространств (workspaces)

5. **`getStyleDetail(config: GeoserverConfig, styleName: string): Promise<StyleDetail>`**
   - Эндпоинт: `GET {url}/geoserver/rest/styles/{name}.json`
   - Затем загружает содержимое SLD: `GET /geoserver/rest/styles/{name}.sld`

6. **`downloadStyleZip(config: GeoserverConfig, styleName: string): Promise<void>`**
   - Эндпоинт: `GET {url}/geoserver/rest/styles/{name}.sld`
   - Запускает скачивание SLD-файла в браузер

7. **`copyStyle(config: GeoserverConfig, sourceStyle: StyleDetail, targetConfig: GeoserverConfig): Promise<void>`**
   - Эндпоинт: `PUT {url}/geoserver/rest/styles/{name}` с содержимым SLD в теле запроса

8. **`deleteStyle(config: GeoserverConfig, styleName: string): Promise<void>`**
   - Эндпоинт: `DELETE {url}/geoserver/rest/styles/{name}`

9. **`deleteLayer(config: GeoserverConfig, layerName: string, layerType: string): Promise<void>`**
   - Эндпоинт: `DELETE {url}/geoserver/rest/{type}/layers/{name}`

10. **`deleteStore(config: GeoserverConfig, storeName: string): Promise<void>`**
    - Эндпоинт: `DELETE {url}/geoserver/rest/datastores/{name}`

---

## Управление состоянием (`src/stores/geoserverStore.ts`)

Созать Zustand store со следующей структурой:

```typescript
type ConnectionStatus = 'idle' | 'success' | 'error';

interface GeoserverState {
  // Конфигурации
  server1: GeoserverConfig;
  server2: GeoserverConfig;

  // Текущий раздел
  section: SectionType;

  // Данные с Geoserver
  server1Data: StyleItem[] | LayerItem[] | StoreItem[];
  server2Data: StyleItem[] | LayerItem[] | StoreItem[];

  // Состояние выбора
  selectedServer1: string[];
  selectedServer2: string[];

  // Состояния загрузки/ошибки
  loading: boolean;
  error: string | null;

  // Состояние диалогов
  showInfoDialog: boolean;
  infoDialogData: StyleDetail | null;

  // Статус подключения
  connectionStatus1: ConnectionStatus;
  connectionStatus2: ConnectionStatus;
  connectionError1: string | null;
  connectionError2: string | null;
  testingConnection1: boolean;
  testingConnection2: boolean;

  // Сообщения для BottomPanel
  messages1: Array<{ id: string; text: string; type: 'error' | 'info' | 'success'; timestamp: number }>;
  messages2: Array<{ id: string; text: string; type: 'error' | 'info' | 'success'; timestamp: number }>;

  // Действия
  setServer1Config: (config: Partial<GeoserverConfig>) => void;
  setServer2Config: (config: Partial<GeoserverConfig>) => void;
  setSection: (section: SectionType) => void;
  fetchData: () => Promise<void>;
  toggleSelectionServer1: (name: string) => void;
  toggleSelectionServer2: (name: string) => void;
  openInfoDialog: (data: StyleDetail | null) => void;
  closeInfoDialog: () => void;
  getInfo: (server: 1 | 2, name: string) => Promise<void>;
  downloadStyle: (server: 1 | 2, name: string) => Promise<void>;
  copyStyle: (server: 1 | 2) => Promise<void>;
  deleteSelected: (server: 1 | 2) => Promise<void>;
  testConnection: (server: 1 | 2) => Promise<void>;
  addMessage: (server: 1 | 2, text: string, type: 'error' | 'info' | 'success') => void;
  clearMessages: (server: 1 | 2) => void;
}
```

### Ключевое поведение
- `fetchData()`: Параллельные запросы к обоим серверам через `Promise.all`
- `copyStyle()`: Получает стиль с исходного сервера, создаёт на целевом сервере
- Конфигурации сохраняются в `localStorage` под ключом `'geoserver_configs'`
- Сообщения автоматически отображаются через toast-уведомления

---

## Theme Store (`src/stores/themeStore.ts`)

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

- Тема по умолчанию: `'light'`
- Переключение добавляет/удаляет класс `.dark` на `document.documentElement`

---

## UI Компоненты

### 1. Компонент App (`src/App.tsx`)

**Макет:**
- Полноэкранная flex-колонна с заголовком и основным содержимым
- Заголовок содержит:
  - Название: "🗺️ Управление Geoserver"
  - Кнопка настроек (открывает SettingsModal)
  - Кнопка переключения темы (светлая/тёмная)
- Основное содержимое (вертикальный стек):
  - `<GeoserverConfig />`
  - `<SectionSelector />`
  - `<DualPanelList />` (flex-1, min-h-[400px])
- Компоненты `<InfoDialog />` и `<Toaster />` рендерятся на корневом уровне

### 2. Компонент GeoserverConfig (`src/components/GeoserverConfig.tsx`)

**Назначение:** Конфигурация подключения для обоих серверов

**UI:**
- Двухколоночный макет (Сервер 1 | Сервер 2)
- Каждый сервер имеет:
  - Поле URL (с иконкой Globe)
  - Поле имя пользователя (с иконкой User)
  - Поле пароль (с иконкой Lock)
  - Кнопка тестирования подключения (с иконкой Server)
- Цвет рамки визуально указывает на статус подключения:
  - Зелёная рамка — успех
  - Красная рамка — ошибка
  - Стандартная — неактивно/пусто
- Автоматическое тестирование подключения при заполнении всех полей
- Ошибки подключения отображаются как toast-уведомления

### 3. Компонент SectionSelector (`src/components/SectionSelector.tsx`)

**Назначение:** Выпадающий список для выбора текущего раздела

**Варианты:**
- 🎨 Стили (Styles)
- 📚 Слои (Layers)
- 🗄️ Хранилища (Stores)

**Поведение:**
- При смене раздела очищает выборы и загружает данные с обоих серверов
- Использует нативный элемент `<select>`, стилизованный TailwindCSS

### 4. Компонент DualPanelList (`src/components/DualPanelList.tsx`)

**Назначение:** Основной дисплей данных с параллельными панелями

**Макет:**
- Двухколоночная grid-сетка
- Каждая панель показывает:
  - Метку сервера (Geoserver №1 / Geoserver №2)
  - Индикатор статуса подключения (точка)
  - Прокручиваемый список элементов с флажками
  - Спиннер загрузки во время запроса
  - Сообщение об ошибке при сбое запроса

**Строка элемента:**
- Флажок (иконка Check при выборе)
- Имя элемента
- Для слоёв: бейдж типа (raster/vector)
- Для хранилищ: бейдж статуса

### 5. Компонент ActionPanel (`src/components/ActionPanel.tsx`)

**Назначение:** Кнопки действий для выбранных элементов

**Кнопки:**
- ℹ️ Информация (Info) — открывает диалог деталей
- ⬇️ Загрузить (Download) — скачивает SLD-файл
- 📋 Копировать (Copy) — копирует стиль на другой сервер
- 🗑️ Удалить (Delete) — удаляет выбранные элементы

**Поведение:**
- Кнопки неактивны, когда ничего не выбрано
- Кнопка Копировать: использует первый выбранный элемент с Сервера 1, копирует на Сервер 2 (и наоборот)
- Кнопка Удалить: удаляет все выбранные элементы на указанном сервере

### 6. Компонент StatusBar (`src/components/StatusBar.tsx`)

**Назначение:** Отображение счётчиков выбора

**Отображение:**
- Сервер 1: `Выбрано: X / Y`
- Сервер 2: `Выбрано: X / Y`
- Всего выбрано на обоих серверах

### 7. Компонент InfoDialog (`src/components/InfoDialog.tsx`)

**Назначение:** Отображение детальной информации о стиле

**Содержимое (для стилей):**
- Название, Имя файла, MIME-тип
- Хранилище, Рабочее пространство
- Содержимое SLD в прокручиваемом блоке кода

**Содержимое (для слоёв/хранилищ):**
- Название, Тип/Описание

### 8. Компонент BottomPanel (`src/components/BottomPanel.tsx`)

**Назначение:** Панель журнала сообщений

**Возможности:**
- Сворачиваемая панель внизу
- Показывает сообщения для обоих серверов
- Типы сообщений: error (красный), info (синий), success (зелёный)
- Кнопка очистки сообщений
- Автопрокрутка к последнему сообщению

### 9. Компонент SettingsModal (`src/components/SettingsModal.tsx`)

**Назначение:** Модальное окно настроек

**Возможности:**
- Открывается/закрывается по клику на кнопку
- Содержит конфигурацию Geoserver
- Оверлей модального окна с затемнением фона

---

## Конфигурация TailwindCSS (`tailwind.config.js`)

Включить тёмную тему со стратегией `class`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
      },
    },
  },
  plugins: [],
}
```

---

## Глобальные стили (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

---

## Конфигурация Vite (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Скрипты Vite (`package.json`)

```json
{
  "name": "geoserver-manager",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## Ключевые детали реализации

### 1. Аутентификация
- Basic Auth через `btoa(username:password)`, закодированный в заголовке `Authorization: Basic <token>`
- Применяется ко всем запросам REST API Geoserver

### 2. Загрузка данных
- Параллельная загрузка через `Promise.all` для обоих серверов
- Загрузка на основе раздела (стили/слои/хранилища)
- Состояния загрузки со спиннерами, состояния ошибок с возможностью повторной попытки

### 3. Операция копирования стиля
1. Загрузить детальную информацию о стиле (включая содержимое SLD) с исходного сервера
2. Отправить PUT-запрос с содержимым SLD на целевой сервер по адресу `/geoserver/rest/styles/{name}`
3. Обработать перезапись существующего стиля

### 4. Скачивание стиля
- Загрузить содержимое SLD через эндпоинт `.sld`
- Создать временный blob URL и запустить скачивание
- Очистить blob URL после скачивания

### 5. Персистентность состояния
- Конфигурации серверов сохраняются в `localStorage` под ключом `'geoserver_configs'`
- Загружаются при инициализации приложения
- Предпочтение темы хранится в Zustand store

### 6. Система сообщений
- BottomPanel показывает сообщения с метками времени для каждого сервера
- Типы сообщений: error, info, success
- Toast-уведомления для критических событий
- Кнопка очистки дляdismiss сообщений

---

## Адаптивный дизайн

- Mobile-first подход с брейкпоинтами TailwindCSS
- Кнопки заголовка скрывают текст на малых экранах (`hidden sm:inline`)
- Две панели складываются вертикально на мобильных, бок о бок на десктопе
- Прокручиваемые панели для длинных списков элементов

---

## Тёмная тема

- Class-based тёмная тема (переключение добавляет/удаляет `.dark` на `<html>`)
- CSS custom properties для всех цветов
- Плавные переходы между темами
- Переключатель темы в заголовке с иконками Солнце/Луна

---

## Обработка ошибок

- Try/catch вокруг всех асинхронных API-операций
- Отслеживание статуса подключения для каждого сервера
- Сообщения об ошибках отображаются в:
  - Toast-уведомления (ошибки подключения)
  - BottomPanel (результаты операций)
  - Inline UI (ошибки загрузки в панелях)
- Деликатная деградация (неактивные кнопки, пустые состояния)

---

## Ожидаемые эндпоинты REST API Geoserver

Приложение взаимодействует с REST API Geoserver по следующим эндпоинтам:

```
GET  /geoserver/rest/about/version.json           # Проверка версии
GET  /geoserver/rest/styles.json                   # Список стилей
GET  /geoserver/rest/styles/{name}.json            # Детали стиля
GET  /geoserver/rest/styles/{name}.sld             # Содержимое SLD
PUT  /geoserver/rest/styles/{name}                 # Создание/обновление стиля
DELETE /geoserver/rest/styles/{name}               # Удаление стиля

GET  /geoserver/rest/layers.json                   # Список слоёв
DELETE /geoserver/rest/{type}/layers/{name}        # Удаление слоя

GET  /geoserver/rest/workspaces.json               # Список рабочих пространств
GET  /geoserver/rest/workspaces/{ws}/stores.json   # Список хранилищ
DELETE /geoserver/rest/datastores/{name}           # Удаление хранилища
```

---

## Команды разработки

```bash
npm install          # Установка зависимостей
npm run dev          # Запуск сервера разработки (http://localhost:5173)
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр продакшен-сборки
```
