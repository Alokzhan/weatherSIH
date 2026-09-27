import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Wind, 
  ShieldAlert, 
  Layers, 
  Globe, 
  Gauge, 
  Clock, 
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_CONFIG } from '../config/apiConfig';

// Fix Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface TrajectoryPoint {
  id: string;
  timeLabel: string; // e.g. "Yesterday - 6 AM", "Today - 11 PM"
  dateFormatted: string; // e.g. "Friday, 25 Sep 18:00"
  lat: number;
  lng: number;
  windKt: number;
  windKmH: number;
  pressureHpa: number;
  category: 'Depression' | 'Deep Depression' | 'Cyclonic Storm' | 'Severe Cyclonic Storm' | 'Very Severe Cyclonic Storm' | 'Super Cyclone';
  categoryCode: 'D' | 'DD' | 'CS' | 'SCS' | 'VSCS' | 'SUCS';
  movementKmH: number;
  direction: string;
  isPast: boolean;
  isCurrent: boolean;
  isForecast: boolean;
  uncertaintyRadiusKm: number;
}

export interface ModelTrack {
  id: 'UKM' | 'IMD' | 'ECMWF' | 'GFS' | 'STORMTRACE';
  name: string;
  agency: string;
  color: string;
  points: { lat: number; lng: number; timeLabel: string; windKt: number; pressureHpa: number }[];
}

export interface CycloneEvent {
  id: string;
  name: string;
  basin: string; // Bay of Bengal, Arabian Sea, etc.
  currentCategory: string;
  statusText: string;
  originTime: string;
  estimatedLandfall: string;
  landfallTarget: string;
  maxWindSpeedKt: number;
  minPressureHpa: number;
  hinglishHeadline: string;
  englishHeadline: string;
  points: TrajectoryPoint[];
  models: ModelTrack[];
  coneCoords: [number, number][]; // Polygon coordinates for Cone of Uncertainty
  affectedDistricts: { district: string; state: string; risk: 'critical' | 'severe' | 'moderate'; alertType: string; pop: string }[];
}

// ─── MOCK CYCLONE DATA (Windy-style Rich Trajectory Data) ───
const CYCLONE_DATA: Record<string, CycloneEvent> = {
  'remal-2026': {
    id: 'remal-2026',
    name: 'Severe Cyclonic Storm REMAL (BOB-02)',
    basin: 'Bay of Bengal',
    currentCategory: 'Deep Depression',
    statusText: 'Intensifying over North-West Bay of Bengal',
    originTime: 'Wed, 23 Sep 12:00 IST',
    estimatedLandfall: 'Sat, 26 Sep 23:00 IST',
    landfallTarget: 'Near Sagar Island (West Bengal) & Khepupara (Bangladesh)',
    maxWindSpeedKt: 65,
    minPressureHpa: 988,
    hinglishHeadline: 'Chinta ki Baat hai 😳? Cyclone Track & Forecast Update',
    englishHeadline: 'Is it a Major Concern? Deep Depression Trajectory & Landfall Threat',
    points: [
      {
        id: 'p1',
        timeLabel: 'Wednesday 23 - 12 AM',
        dateFormatted: 'Wed 23 Sep 00:00',
        lat: 14.2,
        lng: 88.5,
        windKt: 14,
        windKmH: 26,
        pressureHpa: 1004,
        category: 'Depression',
        categoryCode: 'D',
        movementKmH: 10,
        direction: 'N',
        isPast: true,
        isCurrent: false,
        isForecast: false,
        uncertaintyRadiusKm: 15,
      },
      {
        id: 'p2',
        timeLabel: 'Yesterday - 6 AM',
        dateFormatted: 'Thu 24 Sep 06:00',
        lat: 16.5,
        lng: 88.2,
        windKt: 35,
        windKmH: 65,
        pressureHpa: 998,
        category: 'Deep Depression',
        categoryCode: 'DD',
        movementKmH: 14,
        direction: 'NNE',
        isPast: true,
        isCurrent: false,
        isForecast: false,
        uncertaintyRadiusKm: 25,
      },
      {
        id: 'p3',
        timeLabel: 'Today - 11 PM',
        dateFormatted: 'Fri 25 Sep 23:00',
        lat: 19.4,
        lng: 88.7,
        windKt: 22,
        windKmH: 41,
        pressureHpa: 993,
        category: 'Deep Depression',
        categoryCode: 'DD',
        movementKmH: 16,
        direction: 'NNE',
        isPast: false,
        isCurrent: true,
        isForecast: false,
        uncertaintyRadiusKm: 35,
      },
      {
        id: 'p4',
        timeLabel: 'Tomorrow - 11 AM',
        dateFormatted: 'Sat 26 Sep 11:00',
        lat: 21.2,
        lng: 89.1,
        windKt: 24,
        windKmH: 45,
        pressureHpa: 995,
        category: 'Cyclonic Storm',
        categoryCode: 'CS',
        movementKmH: 18,
        direction: 'N',
        isPast: false,
        isCurrent: false,
        isForecast: true,
        uncertaintyRadiusKm: 55,
      },
      {
        id: 'p5',
        timeLabel: 'Tomorrow - 11 PM',
        dateFormatted: 'Sat 26 Sep 23:00',
        lat: 22.8,
        lng: 89.4,
        windKt: 21,
        windKmH: 39,
        pressureHpa: 999,
        category: 'Severe Cyclonic Storm',
        categoryCode: 'SCS',
        movementKmH: 20,
        direction: 'NNE',
        isPast: false,
        isCurrent: false,
        isForecast: true,
        uncertaintyRadiusKm: 80,
      },
      {
        id: 'p6',
        timeLabel: 'Sunday 27 - 11 AM',
        dateFormatted: 'Sun 27 Sep 11:00',
        lat: 24.5,
        lng: 90.2,
        windKt: 18,
        windKmH: 33,
        pressureHpa: 1002,
        category: 'Depression',
        categoryCode: 'D',
        movementKmH: 22,
        direction: 'NE',
        isPast: false,
        isCurrent: false,
        isForecast: true,
        uncertaintyRadiusKm: 120,
      },
    ],
    models: [
      {
        id: 'UKM',
        name: 'UKMet (UK Meteorological Office)',
        agency: 'UK Met Office',
        color: '#f59e0b', // Amber
        points: [
          { lat: 19.4, lng: 88.7, timeLabel: 'Today 11 PM', windKt: 22, pressureHpa: 993 },
          { lat: 21.4, lng: 88.9, timeLabel: 'Tomorrow 11 AM', windKt: 26, pressureHpa: 994 },
          { lat: 23.1, lng: 89.1, timeLabel: 'Tomorrow 11 PM', windKt: 22, pressureHpa: 998 },
        ]
      },
      {
        id: 'IMD',
        name: 'IMD (India Meteorological Department)',
        agency: 'Govt of India',
        color: '#ef4444', // Red
        points: [
          { lat: 19.4, lng: 88.7, timeLabel: 'Today 11 PM', windKt: 22, pressureHpa: 993 },
          { lat: 21.2, lng: 89.1, timeLabel: 'Tomorrow 11 AM', windKt: 24, pressureHpa: 995 },
          { lat: 22.8, lng: 89.4, timeLabel: 'Tomorrow 11 PM', windKt: 21, pressureHpa: 999 },
        ]
      },
      {
        id: 'ECMWF',
        name: 'ECMWF HRES (European Center)',
        agency: 'ECMWF Europe',
        color: '#06b6d4', // Cyan
        points: [
          { lat: 19.4, lng: 88.7, timeLabel: 'Today 11 PM', windKt: 23, pressureHpa: 992 },
          { lat: 21.1, lng: 89.3, timeLabel: 'Tomorrow 11 AM', windKt: 25, pressureHpa: 994 },
          { lat: 22.6, lng: 89.8, timeLabel: 'Tomorrow 11 PM', windKt: 20, pressureHpa: 1000 },
        ]
      },
      {
        id: 'GFS',
        name: 'GFS (NCEP Global Forecast System)',
        agency: 'NOAA USA',
        color: '#a855f7', // Purple
        points: [
          { lat: 19.4, lng: 88.7, timeLabel: 'Today 11 PM', windKt: 21, pressureHpa: 995 },
          { lat: 20.9, lng: 88.8, timeLabel: 'Tomorrow 11 AM', windKt: 23, pressureHpa: 996 },
          { lat: 22.4, lng: 89.0, timeLabel: 'Tomorrow 11 PM', windKt: 19, pressureHpa: 1001 },
        ]
      },
      {
        id: 'STORMTRACE',
        name: 'StormTrace AI (5km Downscaled Deep Ensemble)',
        agency: 'StormTrace AI Core',
        color: '#10b981', // Emerald Glow
        points: [
          { lat: 19.4, lng: 88.7, timeLabel: 'Today 11 PM', windKt: 24, pressureHpa: 991 },
          { lat: 21.25, lng: 89.15, timeLabel: 'Tomorrow 11 AM', windKt: 27, pressureHpa: 993 },
          { lat: 22.85, lng: 89.45, timeLabel: 'Tomorrow 11 PM', windKt: 23, pressureHpa: 997 },
        ]
      }
    ],
    coneCoords: [
      [19.4, 88.7],
      [20.5, 87.6],
      [22.2, 87.8],
      [24.8, 88.5],
      [25.1, 91.5],
      [23.5, 91.2],
      [21.8, 90.8],
      [20.3, 89.8],
      [19.4, 88.7]
    ],
    affectedDistricts: [
      { district: 'South 24 Parganas', state: 'West Bengal', risk: 'critical', alertType: 'Extreme Wind & Tidal Surge (110 km/h)', pop: '8.1 M' },
      { district: 'North 24 Parganas', state: 'West Bengal', risk: 'critical', alertType: 'Heavy Inundation & Cloudburst', pop: '10.0 M' },
      { district: 'Purba Medinipur (Digha)', state: 'West Bengal', risk: 'severe', alertType: 'High Waves & Coastal Erosion', pop: '5.1 M' },
      { district: 'Kendrapara', state: 'Odisha', risk: 'severe', alertType: 'Heavy Rainfall & High Gusts', pop: '1.4 M' },
      { district: 'Bhadrak', state: 'Odisha', risk: 'moderate', alertType: 'Gale Winds & Sea Incursion', pop: '1.5 M' },
      { district: 'Kolkata Metropolitan', state: 'West Bengal', risk: 'severe', alertType: 'Urban Waterlogging & Squalls', pop: '14.9 M' },
    ]
  },
  'biparjoy-2026': {
    id: 'biparjoy-2026',
    name: 'Extremely Severe Cyclonic Storm BIPARJOY (ARB-01)',
    basin: 'Arabian Sea',
    currentCategory: 'Severe Cyclonic Storm',
    statusText: 'Recurving towards Kutch Coastal Belt & Pakistan Border',
    originTime: 'Tue, 15 Sep 06:00 IST',
    estimatedLandfall: 'Sun, 27 Sep 18:00 IST',
    landfallTarget: 'Jakhau Port (Gujarat) & Karachi Coast',
    maxWindSpeedKt: 85,
    minPressureHpa: 965,
    hinglishHeadline: 'Arabian Sea Alert: Cyclone Biparjoy Dynamic Track',
    englishHeadline: 'Arabian Sea Warning: Cyclone Biparjoy Trajectory & Wind Field',
    points: [
      {
        id: 'bp1',
        timeLabel: 'Yesterday - 6 AM',
        dateFormatted: 'Thu 24 Sep 06:00',
        lat: 18.2,
        lng: 67.5,
        windKt: 75,
        windKmH: 140,
        pressureHpa: 970,
        category: 'Very Severe Cyclonic Storm',
        categoryCode: 'VSCS',
        movementKmH: 12,
        direction: 'N',
        isPast: true,
        isCurrent: false,
        isForecast: false,
        uncertaintyRadiusKm: 20,
      },
      {
        id: 'bp2',
        timeLabel: 'Today - 11 PM',
        dateFormatted: 'Fri 25 Sep 23:00',
        lat: 20.8,
        lng: 68.1,
        windKt: 65,
        windKmH: 120,
        pressureHpa: 978,
        category: 'Severe Cyclonic Storm',
        categoryCode: 'SCS',
        movementKmH: 14,
        direction: 'NNE',
        isPast: false,
        isCurrent: true,
        isForecast: false,
        uncertaintyRadiusKm: 30,
      },
      {
        id: 'bp3',
        timeLabel: 'Tomorrow - 11 AM',
        dateFormatted: 'Sat 26 Sep 11:00',
        lat: 22.4,
        lng: 68.8,
        windKt: 55,
        windKmH: 100,
        pressureHpa: 985,
        category: 'Cyclonic Storm',
        categoryCode: 'CS',
        movementKmH: 16,
        direction: 'NE',
        isPast: false,
        isCurrent: false,
        isForecast: true,
        uncertaintyRadiusKm: 45,
      },
      {
        id: 'bp4',
        timeLabel: 'Tomorrow - 11 PM',
        dateFormatted: 'Sat 26 Sep 23:00',
        lat: 23.6,
        lng: 69.5,
        windKt: 40,
        windKmH: 74,
        pressureHpa: 992,
        category: 'Deep Depression',
        categoryCode: 'DD',
        movementKmH: 18,
        direction: 'ENE',
        isPast: false,
        isCurrent: false,
        isForecast: true,
        uncertaintyRadiusKm: 70,
      }
    ],
    models: [
      {
        id: 'IMD',
        name: 'IMD India Track',
        agency: 'IMD',
        color: '#ef4444',
        points: [
          { lat: 20.8, lng: 68.1, timeLabel: 'Today 11 PM', windKt: 65, pressureHpa: 978 },
          { lat: 22.4, lng: 68.8, timeLabel: 'Tomorrow 11 AM', windKt: 55, pressureHpa: 985 },
          { lat: 23.6, lng: 69.5, timeLabel: 'Tomorrow 11 PM', windKt: 40, pressureHpa: 992 }
        ]
      },
      {
        id: 'ECMWF',
        name: 'ECMWF Europe Track',
        agency: 'ECMWF',
        color: '#06b6d4',
        points: [
          { lat: 20.8, lng: 68.1, timeLabel: 'Today 11 PM', windKt: 66, pressureHpa: 976 },
          { lat: 22.3, lng: 69.1, timeLabel: 'Tomorrow 11 AM', windKt: 53, pressureHpa: 986 },
          { lat: 23.4, lng: 70.0, timeLabel: 'Tomorrow 11 PM', windKt: 38, pressureHpa: 994 }
        ]
      },
      {
        id: 'STORMTRACE',
        name: 'StormTrace AI High-Res',
        agency: 'StormTrace AI',
        color: '#10b981',
        points: [
          { lat: 20.8, lng: 68.1, timeLabel: 'Today 11 PM', windKt: 68, pressureHpa: 975 },
          { lat: 22.45, lng: 68.85, timeLabel: 'Tomorrow 11 AM', windKt: 57, pressureHpa: 983 },
          { lat: 23.65, lng: 69.55, timeLabel: 'Tomorrow 11 PM', windKt: 42, pressureHpa: 990 }
        ]
      }
    ],
    coneCoords: [
      [20.8, 68.1],
      [21.6, 66.8],
      [23.2, 67.2],
      [24.8, 68.2],
      [25.0, 71.0],
      [23.8, 71.2],
      [22.2, 70.2],
      [21.2, 69.0],
      [20.8, 68.1]
    ],
    affectedDistricts: [
      { district: 'Kutch (Jakhau/Naliya)', state: 'Gujarat', risk: 'critical', alertType: 'Extreme Wind (130 km/h) & Storm Surge', pop: '2.1 M' },
      { district: 'Devbhumi Dwarka', state: 'Gujarat', risk: 'critical', alertType: 'High Sea Surge & Heavy Rainfall', pop: '0.8 M' },
      { district: 'Jamnagar', state: 'Gujarat', risk: 'severe', alertType: 'Gale Winds & Power Disruption', pop: '2.2 M' },
      { district: 'Porbandar', state: 'Gujarat', risk: 'severe', alertType: 'High Waves & Coastal Warnings', pop: '0.6 M' },
    ]
  }
};

export const CycloneTracker: React.FC = () => {
  const [selectedCycloneId, setSelectedCycloneId] = useState<string>('remal-2026');
  const [activePointIndex, setActivePointIndex] = useState<number>(2); // Default to current point "Today - 11 PM"
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [activeModelIds, setActiveModelIds] = useState<string[]>(['IMD', 'UKM', 'ECMWF', 'STORMTRACE']);
  const [showCone, setShowCone] = useState<boolean>(true);
  const [tileMode, setTileMode] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [langMode, setLangMode] = useState<'hinglish' | 'english'>('hinglish');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'models' | 'districts'>('overview');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const cyclone = useMemo(() => CYCLONE_DATA[selectedCycloneId] || CYCLONE_DATA['remal-2026'], [selectedCycloneId]);
  const activePoint = cyclone.points[activePointIndex] || cyclone.points[0];

  // ─── INITIALIZE LEAFLET MAP ───
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Only init once

    const initialCenter: [number, number] = [cyclone.points[2]?.lat || 19.4, cyclone.points[2]?.lng || 88.7];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ─── UPDATE BASE MAP TILES ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${API_CONFIG.mapboxPublicToken}`;
    if (tileMode === 'satellite') {
      tileUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${API_CONFIG.mapboxPublicToken}`;
    } else if (tileMode === 'street') {
      tileUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${API_CONFIG.mapboxPublicToken}`;
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '© Mapbox © OpenStreetMap',
    }).addTo(map);
  }, [tileMode]);

  // ─── RENDER CYCLONE TRACK, CONE, & MARKERS ───
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Render Cone of Uncertainty Polygon
    if (showCone && cyclone.coneCoords.length > 0) {
      const conePolygon = L.polygon(cyclone.coneCoords, {
        color: 'rgba(239, 68, 68, 0.6)',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: 'rgba(239, 68, 68, 0.12)',
        fillOpacity: 0.12,
      });
      group.addLayer(conePolygon);
    }

    // 2. Render Past Track (Solid Polyline)
    const pastCoords: [number, number][] = cyclone.points
      .filter((p) => p.isPast || p.isCurrent)
      .map((p) => [p.lat, p.lng]);

    if (pastCoords.length > 1) {
      const pastLine = L.polyline(pastCoords, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.9,
      });
      group.addLayer(pastLine);
    }

    // 3. Render Forecast Track (Dotted Polyline)
    const forecastCoords: [number, number][] = cyclone.points
      .filter((p) => p.isCurrent || p.isForecast)
      .map((p) => [p.lat, p.lng]);

    if (forecastCoords.length > 1) {
      const forecastLine = L.polyline(forecastCoords, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.95,
      });
      group.addLayer(forecastLine);
    }

    // 4. Render Multi-Model Forecast Lines
    cyclone.models.forEach((model) => {
      if (activeModelIds.includes(model.id)) {
        const modelCoords: [number, number][] = model.points.map((p) => [p.lat, p.lng]);
        const modelLine = L.polyline(modelCoords, {
          color: model.color,
          weight: 2,
          opacity: 0.75,
          dashArray: '4, 4',
        });
        group.addLayer(modelLine);

        // Add subtle end marker for model track
        const lastP = model.points[model.points.length - 1];
        if (lastP) {
          const modelIcon = L.divIcon({
            className: 'custom-model-badge',
            html: `<div style="background-color: ${model.color}; font-size: 9px; font-weight: 800; color: #000; padding: 2px 4px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: inline-block;">${model.id}</div>`,
            iconSize: [40, 16],
            iconAnchor: [20, 8],
          });
          const mMarker = L.marker([lastP.lat, lastP.lng], { icon: modelIcon });
          group.addLayer(mMarker);
        }
      }
    });

    // 5. Render Trajectory Nodes & Windy-style Floating Popups
    cyclone.points.forEach((pt, index) => {
      const isActive = index === activePointIndex;
      const isCurrentEye = pt.isCurrent;

      // Custom marker icon depending on point state
      let nodeHtml = '';

      if (isCurrentEye) {
        // Dynamic Pulsing Cyclone Swirl Eye Icon
        nodeHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-3 bg-red-500/30 rounded-full animate-ping"></div>
            <div class="h-9 w-9 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-2xl animate-spin" style="animation-duration: 4s;">
              🌀
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-500/40 whitespace-nowrap shadow-lg">
              ${pt.categoryCode} • ${pt.windKt}kt
            </div>
          </div>
        `;
      } else if (isActive) {
        // Highlighted Selected Node
        nodeHtml = `
          <div class="h-6 w-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-lg ring-4 ring-amber-500/40 scale-125 transition-transform">
            <div class="h-2 w-2 rounded-full bg-slate-950"></div>
          </div>
        `;
      } else {
        // Standard Track Node with subtle speed label badge
        nodeHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer">
            <div class="h-4 w-4 rounded-full ${pt.isPast ? 'bg-slate-300' : 'bg-red-500'} border-2 border-white shadow-md group-hover:scale-125 transition-all"></div>
            <div class="mt-1 bg-slate-900/90 text-cyan-300 text-[9px] font-black px-1 py-0.2 rounded border border-slate-700/80 whitespace-nowrap shadow">
              ${pt.windKt}kt
            </div>
          </div>
        `;
      }

      const divIcon = L.divIcon({
        className: 'cyclone-node-icon',
        html: nodeHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: divIcon });

      marker.on('click', () => {
        setActivePointIndex(index);
      });

      group.addLayer(marker);

      // 6. Render Floating Callout Card ONLY for the active selected node (Compact & Sleek)
      if (isActive) {
        const windyPopupHtml = `
          <div style="
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(8px);
            color: #f8fafc;
            border: 1px solid rgba(245, 158, 11, 0.7);
            border-radius: 6px;
            padding: 3px 7px;
            font-family: sans-serif;
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            white-space: nowrap;
            cursor: pointer;
            line-height: 1.2;
          ">
            <div style="font-size: 9px; font-weight: 800; color: #fbbf24; margin-bottom: 1px; display: flex; align-items: center; gap: 3px;">
              <span>⏰</span> <span>${pt.timeLabel}</span>
            </div>
            <div style="font-size: 11px; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
              <span>${pt.windKt}kt</span>
              <span style="color: #64748b; font-size: 9px;">|</span>
              <span style="color: #f43f5e;">${pt.pressureHpa}hPa</span>
            </div>
          </div>
        `;

        const popupDivIcon = L.divIcon({
          className: 'windy-callout-popup',
          html: windyPopupHtml,
          iconSize: [105, 34],
          iconAnchor: [52, 42],
        });

        const calloutMarker = L.marker([pt.lat, pt.lng], { icon: popupDivIcon });
        calloutMarker.on('click', () => setActivePointIndex(index));
        group.addLayer(calloutMarker);
      }
    });

  }, [cyclone, activePointIndex, activeModelIds, showCone]);

  // ─── AUTO PLAY ANIMATION SLIDER ───
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActivePointIndex((prev) => {
          if (prev >= cyclone.points.length - 1) {
            return 0; // Loop around
          }
          return prev + 1;
        });
      }, 2500 / playSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playSpeed, cyclone.points.length]);

  // ─── RE-CENTER MAP ON ACTIVE POINT ───
  const handlePointSelect = (index: number) => {
    setActivePointIndex(index);
    const pt = cyclone.points[index];
    if (pt && mapRef.current) {
      mapRef.current.panTo([pt.lat, pt.lng], { animate: true, duration: 0.8 });
    }
  };

  const [showMobileStats, setShowMobileStats] = useState<boolean>(false);

  // Toggle Model Filter
  const toggleModel = (modelId: string) => {
    setActiveModelIds((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#060a14] text-slate-100 overflow-hidden font-sans relative">
      
      {/* ── Top Header Banner (Matching Windy style image: "Chinta ki Baat hai 😳?") ── */}
      <header className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#0a0f1e]/95 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 z-20 shadow-md">
        <div className="flex items-center gap-2 min-w-0 max-w-full sm:max-w-[60%]">
          <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center text-xs sm:text-base animate-pulse shrink-0">
            🌀
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-[11px] xs:text-xs sm:text-sm md:text-base font-black tracking-tight text-white truncate">
                {langMode === 'hinglish' ? cyclone.hinglishHeadline : cyclone.englishHeadline}
              </h1>
              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                {cyclone.currentCategory}
              </span>
            </div>
            <p className="text-[9px] sm:text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <span className="truncate">{cyclone.name}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold truncate">{cyclone.statusText}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Cyclone Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile Stats Toggle Button */}
          <button
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="md:hidden px-2 py-0.5 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-300 text-[10px] sm:text-xs font-bold transition flex items-center gap-1"
          >
            📊 {showMobileStats ? 'Hide' : 'Stats'}
          </button>

          {/* Hinglish / English Toggle */}
          <button
            onClick={() => setLangMode(langMode === 'hinglish' ? 'english' : 'hinglish')}
            className="px-2 py-0.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] sm:text-[11px] font-semibold text-slate-300 transition flex items-center gap-1"
          >
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400" />
            <span className="hidden sm:inline">{langMode === 'hinglish' ? 'Hinglish Mode' : 'English Mode'}</span>
            <span className="sm:hidden">{langMode === 'hinglish' ? 'HI' : 'EN'}</span>
          </button>

          {/* Cyclone Dropdown Selector */}
          <select
            value={selectedCycloneId}
            onChange={(e) => {
              setSelectedCycloneId(e.target.value);
              setActivePointIndex(2);
            }}
            className="bg-slate-900 border border-red-500/40 text-red-300 text-[10px] sm:text-xs font-bold py-0.5 sm:py-1 px-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[120px] sm:max-w-none"
          >
            <option value="remal-2026">🌀 Remal (BOB)</option>
            <option value="biparjoy-2026">🌀 Biparjoy (ARB)</option>
          </select>

          {/* Map Layer Mode Switcher */}
          <div className="hidden sm:flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setTileMode('dark')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${tileMode === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileMode('satellite')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${tileMode === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sat
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 relative min-h-0 flex flex-col lg:flex-row">
        
        {/* MAP CONTAINER */}
        <div className="flex-1 relative h-full w-full min-h-[350px] sm:min-h-[400px] lg:min-h-[420px]">
          <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full bg-[#070b16]" />

          {/* Floating Left Top: Model Toggles Bar with Eye Buttons & Mobile Auto-Scroll */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-slate-900/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-800/80 shadow-2xl flex items-center gap-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1 shrink-0">
              <Layers className="h-3 w-3 text-blue-400" /> Models:
            </span>
            {cyclone.models.map((m) => {
              const active = activeModelIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  style={{
                    backgroundColor: active ? `${m.color}22` : 'rgba(30, 41, 59, 0.6)',
                    borderColor: active ? m.color : 'rgba(71, 85, 105, 0.4)',
                    color: active ? '#ffffff' : '#94a3b8',
                  }}
                  className={`px-2 py-0.5 rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 hover:scale-105 shrink-0 ${
                    !active ? 'opacity-60 line-through' : ''
                  }`}
                  title={active ? `Hide ${m.id} model track` : `Show ${m.id} model track`}
                >
                  {active ? (
                    <Eye className="h-3 w-3 shrink-0" style={{ color: m.color }} />
                  ) : (
                    <EyeOff className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                  <span>{m.id}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowCone(!showCone)}
              className={`px-2 py-0.5 rounded-lg border text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 shrink-0 ${
                showCone
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60 line-through'
              }`}
              title={showCone ? 'Hide uncertainty cone' : 'Show uncertainty cone'}
            >
              {showCone ? <Eye className="h-3 w-3 text-red-400 shrink-0" /> : <EyeOff className="h-3 w-3 text-slate-500 shrink-0" />}
              <span>Cone</span>
            </button>
          </div>

          {/* Floating Right Top: Current Active Point Compact Display Card */}
          <div className={`absolute top-11 sm:top-14 md:top-3 right-2 sm:right-3 z-20 w-[calc(100vw-1rem)] max-w-[240px] sm:w-60 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-2 rounded-xl shadow-2xl space-y-1.5 transition-all ${
            showMobileStats ? 'block' : 'hidden md:block'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> {activePoint.timeLabel}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{activePoint.dateFormatted}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50">
                <div className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Wind className="h-2.5 w-2.5 text-cyan-400" /> Max Wind
                </div>
                <div className="text-base font-black text-cyan-300 mt-0.5">
                  {activePoint.windKt} <span className="text-[10px] font-semibold text-slate-400">kt</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {activePoint.windKmH} km/h
                </div>
              </div>

              <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50">
                <div className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Gauge className="h-2.5 w-2.5 text-rose-400" /> Pressure
                </div>
                <div className="text-base font-black text-rose-400 mt-0.5">
                  {activePoint.pressureHpa} <span className="text-[10px] font-semibold text-slate-400">hPa</span>
                </div>
                <div className="text-[10px] font-bold text-amber-300 truncate">
                  {activePoint.categoryCode}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 text-[10px] space-y-0.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Speed:</span>
                <span className="font-bold text-white">{activePoint.movementKmH} km/h ({activePoint.direction})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Landfall:</span>
                <span className="font-bold text-red-400 truncate max-w-[130px]">{cyclone.landfallTarget}</span>
              </div>
            </div>
          </div>

          {/* ── Windy-Style Bottom Timeline Controller Dock (Responsive Mobile Dock) ── */}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 bg-slate-900/95 backdrop-blur-md p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/90 shadow-2xl flex flex-col gap-1.5 sm:gap-2">
            
            <div className="flex items-center justify-between gap-1 sm:px-2">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition transform active:scale-95 shrink-0"
                  title={isPlaying ? 'Pause Trajectory' : 'Play Trajectory Animation'}
                >
                  {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />}
                </button>

                {/* Speed Controls */}
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] sm:text-xs">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaySpeed(spd)}
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold transition ${
                        playSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <div className="text-[10px] sm:text-xs font-bold text-slate-300 hidden sm:block">
                  Time Scrubber Timeline
                </div>
              </div>

              {/* Active Selected Point Display Label */}
              <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-[10px] sm:text-xs font-black flex items-center gap-1.5 truncate">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="truncate">Sel: {activePoint.timeLabel} ({activePoint.windKt}kt)</span>
              </div>
            </div>

            {/* Timeline Steps Slider */}
            <div className="relative pt-1 pb-0.5 px-1 sm:px-2">
              <input
                type="range"
                min={0}
                max={cyclone.points.length - 1}
                value={activePointIndex}
                onChange={(e) => handlePointSelect(parseInt(e.target.value, 10))}
                className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />

              {/* Step Markers underneath scrubber */}
              <div className="flex justify-between mt-1 text-[8px] sm:text-[10px] font-semibold text-slate-400">
                {cyclone.points.map((pt, i) => (
                  <button
                    key={pt.id}
                    onClick={() => handlePointSelect(i)}
                    className={`transition-colors hover:text-white ${
                      i === activePointIndex ? 'text-amber-400 font-bold underline' : ''
                    }`}
                  >
                    {pt.timeLabel.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR IMPACT & DISASTER ADVISORY PANEL ── */}
        <div className="w-full lg:w-96 bg-[#080d1a] border-l border-[#1a233a] p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px] lg:max-h-none z-20">
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`flex-1 py-2 rounded-lg transition ${
                selectedTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & Risk
            </button>
            <button
              onClick={() => setSelectedTab('models')}
              className={`flex-1 py-2 rounded-lg transition ${
                selectedTab === 'models' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Multi-Model
            </button>
            <button
              onClick={() => setSelectedTab('districts')}
              className={`flex-1 py-2 rounded-lg transition ${
                selectedTab === 'districts' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Districts ({cyclone.affectedDistricts.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & LANDFALL WARNING */}
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Landfall Warning Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 to-slate-900 border border-red-600/40 text-red-200 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4 animate-bounce" /> Landfall Threat Alert
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                    HIGH RISK
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{cyclone.landfallTarget}</h3>
                  <p className="text-xs text-red-300/90 mt-1">
                    Expected Landfall ETA: <strong className="text-white">{cyclone.estimatedLandfall}</strong>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-red-900/50">
                  <div>
                    <span className="text-slate-400">Peak Gusts:</span>
                    <p className="font-bold text-amber-300">110 - 130 km/h</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Storm Surge:</span>
                    <p className="font-bold text-amber-300">1.5 - 2.5 meters</p>
                  </div>
                </div>
              </div>

              {/* Intensity Evolution Chart Widget */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Intensity & Wind Speed Track</span>
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                </h4>
                <div className="space-y-2">
                  {cyclone.points.map((pt, idx) => (
                    <div
                      key={pt.id}
                      onClick={() => handlePointSelect(idx)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        idx === activePointIndex
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${pt.isCurrent ? 'bg-red-500 animate-ping' : pt.isPast ? 'bg-slate-500' : 'bg-amber-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-200">{pt.timeLabel}</p>
                          <p className="text-[10px] text-slate-400">{pt.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-cyan-300">{pt.windKt} kt</p>
                        <p className="text-[10px] font-mono text-rose-400">{pt.pressureHpa} hPa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MULTI-MODEL FORECAST COMPARISON */}
          {selectedTab === 'models' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-blue-400 mb-1 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Ensemble Model Trajectories
                </p>
                Comparing global meteorological models (IMD, UKMET, ECMWF, GFS) with StormTrace AI downscaled 5km physics model.
              </div>

              {cyclone.models.map((model) => (
                <div
                  key={model.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: model.color }} />
                      <span className="text-xs font-black text-white">{model.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{model.agency}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px]">T+24h Wind</span>
                      <p className="font-bold text-slate-200">{model.points[1]?.windKt || '--'} kt</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">T+24h Pressure</span>
                      <p className="font-bold text-slate-200">{model.points[1]?.pressureHpa || '--'} hPa</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Landfall Speed</span>
                      <p className="font-bold text-amber-400">{model.points[2]?.windKt || '--'} kt</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: VULNERABLE DISTRICTS ALERT LIST */}
          {selectedTab === 'districts' && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Affected Coastal Zones
              </div>
              {cyclone.affectedDistricts.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{d.district}, {d.state}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      d.risk === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : d.risk === 'severe'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {d.risk}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{d.alertType}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Est. Vulnerable Population: {d.pop}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default CycloneTracker;
