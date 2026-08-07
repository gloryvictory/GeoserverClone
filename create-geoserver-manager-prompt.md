# Prompt: Create Geoserver Manager Application

## Task Description

Create a React 18 + TypeScript web application called **"Geoserver Manager"** (gsrv2gsrv) — a dual-instance Geoserver management tool that allows users to connect to, compare, and manage two Geoserver instances side-by-side through their REST APIs.

---

## Application Purpose

The application provides a unified interface for:
- Connecting to two Geoserver instances simultaneously
- Browsing and comparing Styles, Layers, and Stores across both instances
- Managing styles (view details, download, copy between servers, delete)
- Managing layers and stores (view, delete)
- Real-time status monitoring with selection tracking

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.0.2 | Type-safe development |
| Vite | 4.4.5 | Build tool & dev server |
| TailwindCSS | 3.3.5 | Utility-first CSS framework |
| Zustand | 4.4.0 | State management |
| lucide-react | 0.263.1 | Icon library |
| react-hot-toast | 2.6.0 | Toast notifications |
| clsx | 2.0.0 | Conditional className merging |
| tailwind-merge | 1.14.0 | Tailwind className merging |
| jszip | 3.10.1 | ZIP file handling for style downloads |

---

## Project Structure

```
gsrv2gsrv/
├── index.html                    # Entry HTML file
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.node.json            # TypeScript config for Node
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # TailwindCSS configuration
├── postcss.config.js             # PostCSS configuration
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root component
    ├── index.css                 # Global styles (TailwindCSS imports)
    ├── lib/
    │   └── utils.ts              # Utility functions (cn helper)
    ├── types/
    │   └── geoserver.ts          # TypeScript interfaces
    ├── stores/
    │   ├── geoserverStore.ts     # Zustand store (main state)
    │   └── themeStore.ts         # Theme state (light/dark)
    ├── services/
    │   └── geoserverApi.ts       # Geoserver REST API service layer
    └── components/
        ├── GeoserverConfig.tsx   # Connection configuration panel
        ├── SectionSelector.tsx   # Section dropdown (Styles/Layers/Stores)
        ├── DualPanelList.tsx     # Two-panel list with checkboxes
        ├── ActionPanel.tsx       # Action buttons (Info, Download, Copy, Delete)
        ├── StatusBar.tsx         # Selected/Total counter
        ├── InfoDialog.tsx        # Style detail information dialog
        ├── BottomPanel.tsx       # Message log panel
        └── SettingsModal.tsx     # Settings modal
```

---

## TypeScript Types (`src/types/geoserver.ts`)

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

## API Service Layer (`src/services/geoserverApi.ts`)

Implement the following functions using native `fetch`:

### Authentication
- All requests use **Basic Auth** with `btoa(`${username}:${password}`)`
- Content-Type: `text/plain` for most endpoints, `application/json` for version check
- Base URL pattern: `{config.url}/geoserver/rest/`

### Functions

1. **`testConnection(config: GeoserverConfig): Promise<boolean>`**
   - Endpoint: `GET {url}/geoserver/rest/about/version.json`
   - Returns `true` if response is OK (200)

2. **`fetchStyles(config: GeoserverConfig): Promise<StyleItem[]>`**
   - Endpoint: `GET /geoserver/rest/styles.json`
   - Parses `data.styles.style` array

3. **`fetchLayers(config: GeoserverConfig): Promise<LayerItem[]>`**
   - Endpoint: `GET /geoserver/rest/layers.json`
   - Parses `data.layers.layer` array

4. **`fetchStores(config: GeoserverConfig): Promise<StoreItem[]>`**
   - Endpoint: `GET /geoserver/rest/workspaces.json` then `GET /geoserver/rest/workspaces/{ws}/stores.json`
   - Aggregates stores from all workspaces

5. **`getStyleDetail(config: GeoserverConfig, styleName: string): Promise<StyleDetail>`**
   - Endpoint: `GET /geoserver/rest/styles/{name}.json`
   - Then fetches SLD content: `GET /geoserver/rest/styles/{name}.sld`

6. **`downloadStyleZip(config: GeoserverConfig, styleName: string): Promise<void>`**
   - Endpoint: `GET /geoserver/rest/styles/{name}.sld`
   - Triggers browser download of SLD file

7. **`copyStyle(config: GeoserverConfig, sourceStyle: StyleDetail, targetConfig: GeoserverConfig): Promise<void>`**
   - Endpoint: `PUT /geoserver/rest/styles/{name}` with SLD content as body

8. **`deleteStyle(config: GeoserverConfig, styleName: string): Promise<void>`**
   - Endpoint: `DELETE /geoserver/rest/styles/{name}`

9. **`deleteLayer(config: GeoserverConfig, layerName: string, layerType: string): Promise<void>`**
   - Endpoint: `DELETE /geoserver/rest/{type}/layers/{name}`

10. **`deleteStore(config: GeoserverConfig, storeName: string): Promise<void>`**
    - Endpoint: `DELETE /geoserver/rest/datastores/{name}`

---

## State Management (`src/stores/geoserverStore.ts`)

Create a Zustand store with the following interface:

```typescript
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

  // Actions
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

### Key Behaviors
- `fetchData()`: Parallel fetches from both servers using `Promise.all`
- `copyStyle()`: Gets style from source server, creates it on target server
- Configs persist to `localStorage` under key `'geoserver_configs'`
- Messages auto-display via toast notifications

---

## Theme Store (`src/stores/themeStore.ts`)

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

- Default theme: `'light'`
- Toggle adds/removes `'dark'` class on `document.documentElement`

---

## UI Components

### 1. App Component (`src/App.tsx`)

**Layout:**
- Full-height flex column with header and main content
- Header contains:
  - Title: "🗺️ Управление Geoserver"
  - Settings button (opens SettingsModal)
  - Theme toggle button (light/dark)
- Main content contains (vertical stack):
  - `<GeoserverConfig />`
  - `<SectionSelector />`
  - `<DualPanelList />` (flex-1, min-h-[400px])
- Render `<InfoDialog />` and `<Toaster />` at root level

### 2. GeoserverConfig Component (`src/components/GeoserverConfig.tsx`)

**Purpose:** Connection configuration for both servers

**UI:**
- Two-column layout (Server 1 | Server 2)
- Each server has:
  - URL input (with Globe icon)
  - Username input (with User icon)
  - Password input (with Lock icon)
  - Test Connection button (with Server icon)
- Visual border color indicates connection status:
  - Green border for success
  - Red border for error
  - Default for idle/empty
- Auto-tests connection when all fields are filled
- Shows connection error messages as toasts

### 3. SectionSelector Component (`src/components/SectionSelector.tsx`)

**Purpose:** Dropdown to select current section

**Options:**
- 🎨 Стили (Styles)
- 📚 Слои (Layers)
- 🗄️ Хранилища (Stores)

**Behavior:**
- On section change, clears selections and fetches data from both servers
- Uses native `<select>` element styled with TailwindCSS

### 4. DualPanelList Component (`src/components/DualPanelList.tsx`)

**Purpose:** Main data display with parallel panels

**Layout:**
- Two-column grid layout
- Each panel shows:
  - Server label (Geoserver №1 / Geoserver №2)
  - Connection status indicator (dot)
  - Scrollable list of items with checkboxes
  - Loading spinner during fetch
  - Error message if fetch fails

**Item Row:**
- Checkbox (Check icon when selected)
- Item name
- For layers: type badge (raster/vector)
- For stores: status badge

### 5. ActionPanel Component (`src/components/ActionPanel.tsx`)

**Purpose:** Action buttons for selected items

**Buttons:**
- ℹ️ Информация (Info) — opens detail dialog
- ⬇️ Загрузить (Download) — downloads SLD file
- 📋 Копировать (Copy) — copies style to other server
- 🗑️ Удалить (Delete) — deletes selected items

**Behavior:**
- Buttons disabled when no items selected
- Copy button: uses first selection from Server 1, copies to Server 2 (or vice versa)
- Delete button: deletes all selected items on the selected server

### 6. StatusBar Component (`src/components/StatusBar.tsx`)

**Purpose:** Display selection counts

**Display:**
- Server 1: `Выбрано: X / Y`
- Server 2: `Выбрано: X / Y`
- Total selected across both servers

### 7. InfoDialog Component (`src/components/InfoDialog.tsx`)

**Purpose:** Display detailed style information

**Content (for styles):**
- Name, Filename, MIME type
- Store, Workspace
- SLD content in scrollable code block

**Content (for layers/stores):**
- Name, Type/Description

### 8. BottomPanel Component (`src/components/BottomPanel.tsx`)

**Purpose:** Message log panel

**Features:**
- Collapsible panel at bottom
- Shows messages for both servers
- Message types: error (red), info (blue), success (green)
- Clear messages button
- Auto-scroll to latest message

### 9. SettingsModal Component (`src/components/SettingsModal.tsx`)

**Purpose:** Settings modal dialog

**Features:**
- Opens/closes with button click
- Contains Geoserver configuration settings
- Modal overlay with backdrop

---

## TailwindCSS Configuration (`tailwind.config.js`)

Enable dark mode with `class` strategy:

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

## Global Styles (`src/index.css`)

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

## Vite Configuration (`vite.config.ts`)

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

## Vite Scripts (`package.json`)

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

## Key Implementation Details

### 1. Authentication
- Basic Auth via `btoa(username:password)` encoded in `Authorization: Basic <token>` header
- Applied to all Geoserver REST API requests

### 2. Data Fetching
- Parallel fetching using `Promise.all` for both servers
- Section-based data loading (styles/layers/stores)
- Loading states with spinners, error states with retry capability

### 3. Style Copy Operation
1. Fetch style detail (including SLD content) from source server
2. PUT SLD content to target server at `/geoserver/rest/styles/{name}`
3. Handle existing style overwrite

### 4. Style Download
- Fetch SLD content via `.sld` endpoint
- Create temporary blob URL and trigger download
- Clean up blob URL after download

### 5. State Persistence
- Server configs saved to `localStorage` under `'geoserver_configs'`
- Loaded on app initialization
- Theme preference stored in Zustand store

### 6. Message System
- BottomPanel shows timestamped messages per server
- Message types: error, info, success
- Toast notifications for critical events
- Clear button to dismiss messages

---

## Responsive Design

- Mobile-first approach with TailwindCSS breakpoints
- Header buttons hide text on small screens (`hidden sm:inline`)
- Dual panels stack on mobile, side-by-side on desktop
- Scrollable panels for long item lists

---

## Dark Mode

- Class-based dark mode (toggle adds/removes `.dark` on `<html>`)
- CSS custom properties for all colors
- Smooth transitions between themes
- Theme toggle in header with Sun/Moon icons

---

## Error Handling

- Try/catch around all async API operations
- Connection status tracking per server
- Error messages displayed in:
  - Toast notifications (connection errors)
  - BottomPanel (operation results)
  - Inline UI (fetch errors in panels)
- Graceful degradation (disabled buttons, empty states)

---

## Expected Geoserver REST Endpoints

The application interacts with Geoserver REST API at these endpoints:

```
GET  /geoserver/rest/about/version.json    # Version check
GET  /geoserver/rest/styles.json            # List styles
GET  /geoserver/rest/styles/{name}.json     # Style detail
GET  /geoserver/rest/styles/{name}.sld      # SLD content
PUT  /geoserver/rest/styles/{name}          # Create/update style
DELETE /geoserver/rest/styles/{name}        # Delete style

GET  /geoserver/rest/layers.json            # List layers
DELETE /geoserver/rest/{type}/layers/{name} # Delete layer

GET  /geoserver/rest/workspaces.json        # List workspaces
GET  /geoserver/rest/workspaces/{ws}/stores.json  # List stores
DELETE /geoserver/rest/datastores/{name}    # Delete store
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```
