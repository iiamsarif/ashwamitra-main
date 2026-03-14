import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

if (MAPBOX_TOKEN !== "YOUR_MAPBOX_TOKEN_HERE") {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface MapboxStaticViewerProps {
  locations: Array<{
    lat: number;
    lng: number;
    label?: string;
    color?: string;
  }>;
  height?: string;
  zoom?: number;
}

const MapboxStaticViewer: React.FC<MapboxStaticViewerProps> = ({
  locations,
  height = "300px",
  zoom = 5,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || locations.length === 0) return;

    // Check if Mapbox token is available
    if (MAPBOX_TOKEN === "YOUR_MAPBOX_TOKEN_HERE") {
      console.error("Mapbox token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file");
      return;
    }

    const center: [number, number] = locations.length === 1
      ? [locations[0].lng, locations[0].lat]
      : [78.9629, 20.5937]; // India center

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: locations.length === 1 ? 12 : zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    locations.forEach((loc) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setText(loc.label || "Location");
      new mapboxgl.Marker({ color: loc.color || "#16a34a" })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit bounds if multiple locations
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => bounds.extend([loc.lng, loc.lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [locations, zoom]);

  if (locations.length === 0) {
    return (
      <div className="w-full rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm" style={{ height }}>
        No location data available
      </div>
    );
  }

  // Show fallback if Mapbox token is not configured
  if (MAPBOX_TOKEN === "YOUR_MAPBOX_TOKEN_HERE") {
    return (
      <div className="w-full rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground text-sm p-6" style={{ height }}>
        <MapPin className="w-8 h-8 mb-2" />
        <p className="font-medium mb-1">Mapbox Not Configured</p>
        <p className="text-xs text-center">Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file</p>
        <p className="text-xs text-center mt-2">Get your token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a></p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-xl border border-border overflow-hidden"
      style={{ height }}
    />
  );
};

export default MapboxStaticViewer;
