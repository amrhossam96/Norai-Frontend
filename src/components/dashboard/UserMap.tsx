'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

interface CountryData {
  code: string;
  name: string;
  users: number;
  lat?: number;
  lng?: number;
}

interface UserMapProps {
  data?: CountryData[];
  height?: number;
}

// Region centers for markers
const regionCenters: Record<string, { lat: number; lng: number }> = {
  NA: { lat: 45, lng: -100 }, // North America
  SA: { lat: -20, lng: -60 }, // South America
  EU: { lat: 54, lng: 15 },   // Europe
  AS: { lat: 35, lng: 100 },  // Asia
  AF: { lat: 0, lng: 20 },    // Africa
  OC: { lat: -25, lng: 135 }, // Oceania
};

// Dark theme tile layer
const darkTileLayer = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Dynamic import to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div 
      className="w-full bg-black border border-white/10 rounded-lg flex items-center justify-center"
      style={{ height: '300px' }}
    >
      <div className="text-gray-400">Loading map...</div>
    </div>
  )
});

export default function UserMap({ data = [], height = 300 }: UserMapProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10" style={{ height: `${height}px` }}>
      <LeafletMap data={data} height={height} regionCenters={regionCenters} darkTileLayer={darkTileLayer} />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10 z-[1000]">
        <div className="flex items-center gap-2 text-gray-200">
          <Globe className="w-4 h-4" />
          <span className="font-medium">User Distribution by Region</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/30 border border-white/40"></div>
            <span className="text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/50 border border-white/40"></div>
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white/80 border border-white/40"></div>
            <span className="text-gray-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
