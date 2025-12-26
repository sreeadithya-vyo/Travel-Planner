import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TripItinerary } from '../types';
import { Car, Footprints, Bus } from 'lucide-react';

interface TripMapProps {
  itinerary: TripItinerary;
  activeDay?: number;
  highlightedActivityId?: string | null;
  onMarkerHover?: (id: string | null) => void;
}

type TravelMode = 'driving' | 'walking' | 'transit';

const DAY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

const TripMap: React.FC<TripMapProps> = ({ 
  itinerary, 
  activeDay, 
  highlightedActivityId,
  onMarkerHover 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylinesRef = useRef<L.Polyline[]>([]);
  
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = L.map(mapContainer.current).setView([0, 0], 2);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Initialize Cluster Group using global L (loaded via script tag)
    if ((L as any).markerClusterGroup) {
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
      });
      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
    }
  }, []);

  // Update Markers and Routes
  useEffect(() => {
    const map = mapInstance.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    // Clear existing
    clusterGroup.clearLayers();
    polylinesRef.current.forEach(line => map.removeLayer(line));
    polylinesRef.current = [];
    markersRef.current = {};

    const allPoints: L.LatLngExpression[] = [];

    itinerary.days.forEach((day, dayIndex) => {
      // Filter logic
      const isDayActive = !activeDay || activeDay === 0 || activeDay === day.dayNumber;
      if (!isDayActive) return;

      const color = DAY_COLORS[dayIndex % DAY_COLORS.length];
      const dayPoints: L.LatLngExpression[] = [];

      day.activities.forEach((activity, actIndex) => {
        if (activity.coordinates?.lat && activity.coordinates?.lng) {
          const latLng: L.LatLngExpression = [activity.coordinates.lat, activity.coordinates.lng];
          allPoints.push(latLng);
          dayPoints.push(latLng);
          
          const uniqueId = `${day.dayNumber}-${actIndex}`;

          // Create custom marker icon
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pin" style="
              background-color: ${color};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
              transition: transform 0.2s;
            ">${actIndex + 1}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker(latLng, { icon: customIcon });
          
          // Popup content
          const popupContent = `
            <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
              <h3 style="font-weight: 700; margin-bottom: 4px; color: #1e293b;">${activity.name}</h3>
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748b; font-weight: 500;">Day ${day.dayNumber} • ${activity.timeSlot}</p>
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${activity.description.substring(0, 80)}...</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.coordinates.lat},${activity.coordinates.lng}&travelmode=${travelMode}" target="_blank" style="display: inline-block; margin-top: 8px; font-size: 11px; color: #059669; text-decoration: none; font-weight: 600;">
                Get Directions &rarr;
              </a>
            </div>
          `;
          
          marker.bindPopup(popupContent);

          // Events
          marker.on('mouseover', () => {
             onMarkerHover?.(uniqueId);
             marker.openPopup();
          });
          marker.on('mouseout', () => {
             // onMarkerHover?.(null); // Optional: clear hover
          });

          markersRef.current[uniqueId] = marker;
          clusterGroup.addLayer(marker);
        }
      });

      // Draw Routes (Polylines)
      if (dayPoints.length > 1) {
        let dashArray = '';
        let weight = 4;
        
        switch(travelMode) {
          case 'walking': dashArray = '5, 10'; weight = 3; break;
          case 'transit': dashArray = '10, 10'; weight = 3; break;
          case 'driving': dashArray = ''; weight = 4; break;
        }

        const polyline = L.polyline(dayPoints, {
          color: color,
          weight: weight,
          opacity: 0.8,
          dashArray: dashArray,
          lineCap: 'round'
        }).addTo(map);

        // Path Hover Effect
        polyline.on('mouseover', (e) => {
          e.target.setStyle({ weight: weight + 3, opacity: 1 });
        });
        polyline.on('mouseout', (e) => {
           e.target.setStyle({ weight: weight, opacity: 0.8 });
        });

        polylinesRef.current.push(polyline);
      }
    });

    // Fit bounds
    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] });
    }

  }, [itinerary, activeDay, travelMode]);

  // Handle External Highlight (Hover from List)
  useEffect(() => {
    if (!highlightedActivityId) return;

    const marker = markersRef.current[highlightedActivityId];
    const clusterGroup = clusterGroupRef.current;
    
    if (marker && clusterGroup) {
      clusterGroup.zoomToShowLayer(marker, () => {
        marker.openPopup();
        // Visual pop effect
        const iconDiv = marker.getElement()?.querySelector('.marker-pin') as HTMLElement;
        if (iconDiv) {
          iconDiv.style.transform = 'scale(1.5)';
          setTimeout(() => { iconDiv.style.transform = 'scale(1)'; }, 300);
        }
      });
    }
  }, [highlightedActivityId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full bg-slate-100" />
      
      {/* Travel Mode Controls */}
      <div className="absolute top-20 right-4 bg-white rounded-lg shadow-md border border-slate-200 p-1 flex flex-col gap-1 z-[500]">
        {[
          { mode: 'driving', icon: <Car size={16} />, label: 'Drive' },
          { mode: 'transit', icon: <Bus size={16} />, label: 'Transit' },
          { mode: 'walking', icon: <Footprints size={16} />, label: 'Walk' },
        ].map((m) => (
          <button
            key={m.mode}
            onClick={() => setTravelMode(m.mode as TravelMode)}
            className={`p-2 rounded hover:bg-slate-100 transition-colors ${travelMode === m.mode ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}
            title={m.label}
          >
            {m.icon}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-slate-200 p-3 z-[500] max-w-[150px]">
        <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Legend</h4>
        <div className="space-y-1.5">
          {itinerary.days.map((day, idx) => (
             (!activeDay || activeDay === day.dayNumber) && (
              <div key={day.dayNumber} className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }}
                />
                <span className="text-xs text-slate-600 truncate">Day {day.dayNumber}</span>
              </div>
             )
          ))}
          <div className="border-t border-slate-100 my-1 pt-1">
             <div className="flex items-center mt-1">
               <span className="w-4 h-0.5 bg-slate-400 mr-2"></span>
               <span className="text-[10px] text-slate-500">Route</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripMap;