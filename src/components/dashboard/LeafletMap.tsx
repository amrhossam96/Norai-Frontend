'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
  
  // Fix for default marker icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface CountryData {
  code: string;
  name: string;
  users: number;
  lat?: number;
  lng?: number;
}

interface LeafletMapProps {
  data: CountryData[];
  height: number;
  regionCenters: Record<string, { lat: number; lng: number }>;
  darkTileLayer: string;
}

function MapStyle() {
  useEffect(() => {
    // Apply dark theme styles
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        background: #000000 !important;
      }
      .leaflet-control-zoom a {
        background-color: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
      .leaflet-popup-content-wrapper {
        background: rgba(0, 0, 0, 0.95) !important;
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        backdrop-filter: blur(10px);
      }
      .leaflet-popup-tip {
        background: rgba(0, 0, 0, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  return null;
}

export default function LeafletMap({ data, height, regionCenters, darkTileLayer }: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate max users for radius normalization
  const maxUsers = data.length > 0 
    ? Math.max(...data.map(d => d.users))
    : 1;

  if (!mounted) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%', background: '#000000' }}
      zoomControl={true}
      scrollWheelZoom={false}
      className="dark-map"
    >
      <MapStyle />
      <TileLayer
        url={darkTileLayer}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {/* User markers by region */}
      {data.map((region) => {
        const center = region.lat && region.lng 
          ? { lat: region.lat, lng: region.lng }
          : regionCenters[region.code];
        
        if (!center) return null;

        const radius = Math.max(8, Math.min(30, (region.users / maxUsers) * 30));
        const opacity = Math.max(0.3, Math.min(0.9, 0.3 + (region.users / maxUsers) * 0.6));

        return (
          <CircleMarker
            key={region.code}
            center={[center.lat, center.lng]}
            radius={radius}
            pathOptions={{
              fillColor: 'rgba(255, 255, 255, 0.8)',
              fillOpacity: opacity,
              color: 'rgba(255, 255, 255, 0.6)',
              weight: 2,
            }}
          >
            <Popup className="custom-popup">
              <div className="text-white">
                <div className="font-semibold mb-1">{region.name}</div>
                <div className="text-sm text-gray-300">
                  {region.users.toLocaleString()} users
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {maxUsers > 0 ? `${((region.users / maxUsers) * 100).toFixed(1)}%` : '0%'} of total
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

