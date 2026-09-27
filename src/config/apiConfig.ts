// AstraWatch AI Dynamic API Credentials Manager
// Secrets are moved to backend/.env
// Only public tokens (Mapbox) are exposed to Vite via VITE_ variables.

const getStoredBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('STORMTRACE_BACKEND_URL') || '';
  }
  return '';
};

export const API_CONFIG = {
  mapboxPublicToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  owmApiKey: import.meta.env.VITE_OWM_KEY || '8f993da72c69f972e707d5e1540fb9de',
  apiUrl: import.meta.env.VITE_API_URL || getStoredBackendUrl() || '',
};

export function setCustomBackendUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('STORMTRACE_BACKEND_URL', url.trim());
    } else {
      localStorage.removeItem('STORMTRACE_BACKEND_URL');
    }
  }
}

export function getApiEndpoint(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || getStoredBackendUrl() || '';
  if (!baseUrl) return path;
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `${cleanBase}${cleanPath}`;
}

export function getOpenWeatherTileUrl(layer: 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new' = 'precipitation_new') {
  const owmKey = API_CONFIG.owmApiKey;
  if (owmKey) {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${owmKey}`;
  }
  return getApiEndpoint(`/api/v1/tiles/owm/${layer}/{z}/{x}/{y}`);
}

export function getMapboxTileUrl(style: 'satellite-v9' | 'navigation-day-v1' | 'navigation-night-v1' = 'satellite-v9') {
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${API_CONFIG.mapboxPublicToken}`;
}
