# Geoserver Manager - Architecture Plan

## Overview
A React SPA application for managing two Geoserver instances side-by-side. Users can configure connection details, browse Styles/Layers/Stores, and perform CRUD operations via Geoserver REST API.

## Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: zustand
- **Icons**: lucide-react
- **HTTP Client**: fetch API (native)

## Project Structure
```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── components/
│   ├── Layout.tsx              # Main layout wrapper
│   ├── GeoserverConfig.tsx     # Connection config (URL, login, password x2)
│   ├── SectionSelector.tsx     # Dropdown: Styles, Layers, Stores
│   ├── DualPanelList.tsx       # Two-panel list with checkboxes
│   ├── ActionPanel.tsx         # Info, Download, Copy, Delete buttons
│   ├── StatusBar.tsx           # Selected/Total counter
│   └── InfoDialog.tsx          # Dialog for style/layer/store info
├── stores/
│   └── geoserverStore.ts       # zustand store for all state
├── services/
│   └── geoserverApi.ts         # REST API service layer
├── types/
│   └── geoserver.ts            # TypeScript interfaces
└── lib/
    └── utils.ts                # Utility functions
```

## State Management (zustand)
```typescript
interface GeoserverConfig {
  url: string;
  username: string;
  password: string;
}

interface GeoserverState {
  // Configurations
  server1: GeoserverConfig;
  server2: GeoserverConfig;
  
  // Current section
  section: 'styles' | 'layers' | 'stores';
  
  // Data from Geoservers
  server1Data: any[];
  server2Data: any[];
  
  // Selection state
  selectedServer1: string[];
  selectedServer2: string[];
  
  // Loading/error states
  loading: boolean;
  error: string | null;
  
  // Actions
  setServer1Config: (config: GeoserverConfig) => void;
  setServer2Config: (config: GeoserverConfig) => void;
  setSection: (section: 'styles' | 'layers' | 'stores') => void;
  fetchData: () => Promise<void>;
  toggleSelectionServer1: (id: string) => void;
  toggleSelectionServer2: (id: string) => void;
  getInfo: (server: 1 | 2, id: string) => Promise<any>;
  downloadStyle: (server: 1 | 2, id: string) => Promise<void>;
  copyStyle: (fromServer: 1 | 2, toServer: 1 | 2, id: string) => Promise<void>;
  deleteItem: (server: 1 | 2, id: string) => Promise<void>;
}
```

## Geoserver REST API Endpoints

### Styles
- GET `/geoserver/rest/styles` - List all styles
- GET `/geoserver/rest/styles/{name}.json` - Get style info
- GET `/geoserver/rest/styles/{name}.sld` - Get SLD content
- POST `/geoserver/rest/styles` - Create/upload style
- DELETE `/geoserver/rest/styles/{name}` - Delete style

### Layers
- GET `/geoserver/rest/layers` - List all layers
- GET `/geoserver/rest/layers/{name}.json` - Get layer info
- DELETE `/geoserver/rest/layers/{name}` - Delete layer

### Stores
- GET `/geoserver/rest/workspaces/{workspace}/datastores` - List stores
- GET `/geoserver/rest/workspaces/{workspace}/datastores/{store}.json` - Get store info
- DELETE `/geoserver/rest/workspaces/{workspace}/datastores/{store}` - Delete store

## Component Flow
```
App
├── GeoserverConfig (2x: Server1, Server2)
│   └── URL, Username, Password inputs
├── SectionSelector
│   └── Dropdown: Styles | Layers | Stores
├── ActionPanel
│   └── Info | Download | Copy | Delete buttons
├── DualPanelList
│   ├── Panel 1 (Server1 data)
│   │   └── Checkbox list
│   └── Panel 2 (Server2 data)
│       └── Checkbox list
└── StatusBar
    └── "Selected X / Total Y"
```

## Data Flow
1. User enters Geoserver URLs, login, password
2. User selects a section (Styles/Layers/Stores)
3. App fetches data from both Geoservers in parallel
4. Data displayed in dual-panel list with checkboxes
5. User selects items and clicks action buttons
6. Actions performed via Geoserver REST API
