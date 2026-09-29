// StormTrace AI Dynamic API Credentials Manager
// Secrets are loaded from .env via Vite's import.meta.env
// Only VITE_ prefixed variables are exposed to the frontend bundle.

const getStoredBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('STORMTRACE_BACKEND_URL') || '';
  }
  return '';
};

export const API_CONFIG = {
  mapboxPublicToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  owmApiKey: import.meta.env.VITE_OWM_KEY || '',
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
