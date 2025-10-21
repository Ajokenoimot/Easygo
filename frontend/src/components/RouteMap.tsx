import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates } from '@/services/routingService';

interface VideoStep {
  id: number;
  title: string;
  distance: string;
  landmark: string;
  videoSrc: string;
}

interface RouteMapProps {
  userLocation: Coordinates;
  destination: Coordinates;
  steps: VideoStep[];
  activeStepIndex: number;
}

const RouteMap = ({ userLocation, destination, steps, activeStepIndex }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lon, userLocation.lat],
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [userLocation.lon, userLocation.lat]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add start marker
    const startMarker = new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([userLocation.lon, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Start</strong>'))
      .addTo(map.current);
    markersRef.current.push(startMarker);

    // Add destination marker
    const destMarker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([destination.lon, destination.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Destination</strong>'))
      .addTo(map.current);
    markersRef.current.push(destMarker);

    // Add route line (simplified - using straight line between points)
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    const routeCoordinates = [
      [userLocation.lon, userLocation.lat],
      [destination.lon, destination.lat]
    ];

    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.75
      }
    });

    // Fit bounds to show entire route
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLocation.lon, userLocation.lat]);
    bounds.extend([destination.lon, destination.lat]);
    map.current.fitBounds(bounds, { padding: 50 });

  }, [userLocation, destination, steps]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg shadow-soft" />
  );
};

export default RouteMap;
