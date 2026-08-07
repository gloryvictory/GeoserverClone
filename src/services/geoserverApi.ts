import type { GeoserverConfig, StyleItem, LayerItem, StoreItem, StyleDetail } from '@/types/geoserver';

/**
 * Make authenticated request to Geoserver REST API
 */
async function geoserverRequest(
  config: GeoserverConfig,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = config.url.replace(/\/+$/, '');
  const url = `${baseUrl}${endpoint}`;

  const auth = btoa(`${config.username}:${config.password}`);

  const headers: Record<string, string> = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'text/plain',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (options.headers instanceof Object) {
      Object.assign(headers, options.headers);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Geoserver request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Test connection to Geoserver
 */
export async function testConnection(config: GeoserverConfig): Promise<boolean> {
  const baseUrl = config.url.replace(/\/+$/, '');
  const url = `${baseUrl}/geoserver/rest/about/version.json`;

  const auth = btoa(`${config.username}:${config.password}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  return response.ok;
}

/**
 * Fetch all styles from a Geoserver
 */
export async function fetchStyles(config: GeoserverConfig): Promise<StyleItem[]> {
  const response = await geoserverRequest(config, '/geoserver/rest/styles.json');
  const data = await response.json();
  return (data.styles?.style || []).map((s: any) => ({
    name: typeof s === 'string' ? s : s.name,
    href: s.href || '',
    filename: s.filename,
  }));
}

/**
 * Fetch all layers from a Geoserver
 */
export async function fetchLayers(config: GeoserverConfig): Promise<LayerItem[]> {
  const response = await geoserverRequest(config, '/geoserver/rest/layers.json');
  const data = await response.json();
  return (data.layers?.layer || []).map((l: any) => ({
    name: typeof l === 'string' ? l : l.name,
    href: l.href || '',
    type: l.type,
  }));
}

/**
 * Fetch all data stores from a Geoserver
 */
export async function fetchStores(config: GeoserverConfig): Promise<StoreItem[]> {
  // First get workspaces
  const workspacesResponse = await geoserverRequest(config, '/geoserver/rest/workspaces.json');
  const workspacesData = await workspacesResponse.json();
  const workspaces = workspacesData.workspaces?.workspace || [];

  const allStores: StoreItem[] = [];

  for (const ws of workspaces) {
    const wsName = typeof ws === 'string' ? ws : ws.name;
    const response = await geoserverRequest(
      config,
      `/geoserver/rest/workspaces/${wsName}/datastores.json`
    );
    const data = await response.json();
    const stores = data.dataStores?.dataStore || [];
    for (const s of stores) {
      allStores.push({
        name: typeof s === 'string' ? s : s.name,
        href: s.href || '',
        description: s.description,
        status: s.status,
      });
    }
  }

  return allStores;
}

/**
 * Get detailed style information from Geoserver
 */
export async function getStyleDetail(config: GeoserverConfig, styleName: string): Promise<StyleDetail> {
  const response = await geoserverRequest(config, `/geoserver/rest/styles/${styleName}.json`);
  return await response.json();
}

/**
 * Get SLD content for a style
 */
export async function getSLDContent(config: GeoserverConfig, styleName: string): Promise<string> {
  const response = await geoserverRequest(config, `/geoserver/rest/styles/${styleName}.sld`);
  return await response.text();
}

/**
 * Download style as SLD file content
 */
export async function downloadStyle(config: GeoserverConfig, styleName: string): Promise<{ name: string; content: string }> {
  const sldContent = await getSLDContent(config, styleName);
  return { name: `${styleName}.sld`, content: sldContent };
}

/**
 * Download style as zip file containing SLD
 * Geoserver serves styles as zip via /styles/{name}.zip endpoint
 */
export async function downloadStyleZip(config: GeoserverConfig, styleName: string): Promise<{ name: string; content: ArrayBuffer }> {
  const baseUrl = config.url.replace(/\/+$/, '');
  const url = `${baseUrl}/geoserver/rest/styles/${styleName}.zip`;

  const auth = btoa(`${config.username}:${config.password}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Geoserver request failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    name: `${styleName}.zip`,
    content: arrayBuffer,
  };
}

/**
 * Copy style from one Geoserver to another
 */
export async function copyStyle(
  fromConfig: GeoserverConfig,
  toConfig: GeoserverConfig,
  styleName: string
): Promise<void> {
  // Get the SLD content from source server
  const sldContent = await getSLDContent(fromConfig, styleName);

  // Upload to destination server
  await geoserverRequest(toConfig, `/geoserver/rest/styles`, {
    method: 'POST',
    body: sldContent,
  });
}

/**
 * Delete style from Geoserver
 */
export async function deleteStyle(config: GeoserverConfig, styleName: string): Promise<void> {
  await geoserverRequest(config, `/geoserver/rest/styles/${styleName}`, {
    method: 'DELETE',
  });
}

/**
 * Delete layer from Geoserver
 */
export async function deleteLayer(config: GeoserverConfig, layerName: string): Promise<void> {
  await geoserverRequest(config, `/geoserver/rest/layers/${layerName}`, {
    method: 'DELETE',
  });
}

/**
 * Delete data store from Geoserver
 */
export async function deleteStore(
  config: GeoserverConfig,
  storeName: string,
  workspaceName?: string
): Promise<void> {
  const ws = workspaceName || 'default';
  await geoserverRequest(config, `/geoserver/rest/workspaces/${ws}/datastores/${storeName}`, {
    method: 'DELETE',
  });
}
