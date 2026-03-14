import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

if (MAPBOX_TOKEN !== "YOUR_MAPBOX_TOKEN_HERE") {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  village?: string;
  district?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  fullAddress?: string;
}

interface MapboxLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
  label?: string;
  showGpsButton?: boolean;
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = "300px",
  label = "Pin Your Location",
  showGpsButton = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Check if Mapbox token is available
      if (MAPBOX_TOKEN === "YOUR_MAPBOX_TOKEN_HERE") {
        console.error("Mapbox token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file");
        return;
      }

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,district,region,postcode`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        const getContext = (id: string) =>
          context.find((c: any) => c.id.startsWith(id))?.text || "";

        const location: LocationData = {
          lat,
          lng,
          address: feature.place_name || "",
          fullAddress: feature.place_name || "",
          village: getContext("locality") || getContext("place"),
          district: getContext("district"),
          city: getContext("place"),
          state: getContext("region"),
          pincode: getContext("postcode"),
          country: getContext("country"),
        };

        setSelectedAddress(feature.place_name || "");
        onLocationSelect(location);
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  }, [onLocationSelect]);

  const initMap = useCallback((center: [number, number]) => {
    if (!mapContainer.current || map.current) return;

    // Check if Mapbox token is available
    if (MAPBOX_TOKEN === "YOUR_MAPBOX_TOKEN_HERE") {
      console.error("Mapbox token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file");
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    marker.current = new mapboxgl.Marker({ draggable: true, color: "#16a34a" })
      .setLngLat(center)
      .addTo(map.current);

    marker.current.on("dragend", () => {
      const lngLat = marker.current!.getLngLat();
      reverseGeocode(lngLat.lat, lngLat.lng);
    });

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      marker.current?.setLngLat([lng, lat]);
      reverseGeocode(lat, lng);
    });

    map.current.on("load", () => setMapLoaded(true));

    reverseGeocode(center[1], center[0]);
  }, [reverseGeocode]);

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocating(false);
        if (map.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          marker.current?.setLngLat([longitude, latitude]);
          reverseGeocode(latitude, longitude);
        } else {
          initMap([longitude, latitude]);
        }
      },
      (err) => {
        setLocating(false);
        console.error("GPS error:", err);
        // Default to India center if GPS denied
        if (!map.current) initMap([78.9629, 20.5937]);
        toast.error("Location access denied. Please pin your location manually on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [initMap, reverseGeocode]);

  useEffect(() => {
    if (initialLocation) {
      initMap([initialLocation.lng, initialLocation.lat]);
    } else {
      // Auto-request GPS on mount
      requestGPS();
    }
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          {label}
        </h4>
        {showGpsButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestGPS}
            disabled={locating}
            className="text-xs gap-1"
          >
            {locating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            {locating ? "Locating..." : "Use My Location"}
          </Button>
        )}
      </div>

      {/* Show fallback if Mapbox token is not configured */}
      {MAPBOX_TOKEN === "YOUR_MAPBOX_TOKEN_HERE" ? (
        <div className="w-full rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground text-sm p-6" style={{ height }}>
          <MapPin className="w-8 h-8 mb-2" />
          <p className="font-medium mb-1">Mapbox Not Configured</p>
          <p className="text-xs text-center">Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file</p>
          <p className="text-xs text-center mt-2">Get your token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a></p>
        </div>
      ) : (
        <div
          ref={mapContainer}
          className="w-full rounded-xl border border-border overflow-hidden"
          style={{ height }}
        />
      )}

      {selectedAddress && MAPBOX_TOKEN !== "YOUR_MAPBOX_TOKEN_HERE" && (
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Selected Location:</p>
          <p className="text-sm text-foreground">{selectedAddress}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        💡 Click on map or drag pin to set your exact location
      </p>
    </div>
  );
};

export default MapboxLocationPicker;
