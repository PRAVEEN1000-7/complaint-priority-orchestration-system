import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import type { Station } from "@/lib/api";

type GeographicalHeatmapProps = {
  stations: Station[];
  cityName?: string;
};

type HeatPoint = [number, number, number];

function enableCanvasReadbackHint() {
  const canvasProto = HTMLCanvasElement.prototype as HTMLCanvasElement & {
    _airgenixPatched?: boolean;
    getContext: HTMLCanvasElement["getContext"];
  };
  if (canvasProto._airgenixPatched) return;
  const originalGetContext = canvasProto.getContext;
  canvasProto.getContext = function (type, options) {
    if (type === "2d") {
      const nextOptions = { ...(options ?? {}), willReadFrequently: true };
      return originalGetContext.call(this, type, nextOptions);
    }
    return originalGetContext.call(this, type, options);
  };
  canvasProto._airgenixPatched = true;
}

function HeatLayer({ points, enabled }: { points: HeatPoint[]; enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length || !enabled) return;
    const layer = (
      L as typeof L & { heatLayer?: (pts: HeatPoint[], options?: Record<string, unknown>) => L.Layer }
    )
      .heatLayer?.(points, {
        radius: 30,
        blur: 20,
        maxZoom: 12,
        gradient: {
          0.2: "#22c55e",
          0.5: "#f59e0b",
          0.75: "#f97316",
          1.0: "#dc2626",
        },
      })
      ?.addTo(map);

    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [map, points, enabled]);

  return null;
}

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, points]);

  return null;
}

export function GeographicalHeatmapClient({
  stations,
  cityName = "Selected City",
}: GeographicalHeatmapProps) {
  const hasStations = stations.length > 0;
  const [heatReady, setHeatReady] = useState(false);
  const points = useMemo(
    () => stations.map((s) => [s.lat, s.lon, Math.min(1, s.pm25 / 200)] as HeatPoint),
    [stations],
  );
  const markerPoints = useMemo(
    () => stations.map((s) => [s.lat, s.lon] as [number, number]),
    [stations],
  );

  useEffect(() => {
    // Hint heatmap canvas for frequent readbacks to avoid warnings.
    enableCanvasReadbackHint();
    (window as unknown as { L?: typeof L }).L = L;

    if ((L as typeof L & { heatLayer?: unknown }).heatLayer) {
      setHeatReady(true);
      return;
    }

    import("leaflet.heat")
      .then(() => setHeatReady(true))
      .catch(() => setHeatReady(false));
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (!hasStations) return [20.5937, 78.9629];
    const avgLat = stations.reduce((sum, station) => sum + station.lat, 0) / stations.length;
    const avgLon = stations.reduce((sum, station) => sum + station.lon, 0) / stations.length;
    return [avgLat, avgLon];
  }, [hasStations, stations]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border bg-white">
      {!hasStations && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground bg-white/70">
          No station data available for this area.
        </div>
      )}
      <MapContainer center={center} zoom={11} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasStations && <HeatLayer points={points} enabled={heatReady} />}
        {hasStations && <FitBounds points={markerPoints} />}
        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lon]}
            radius={6}
            pathOptions={{
              color: "#0f766e",
              weight: 2,
              fillColor: "#14b8a6",
              fillOpacity: 0.8,
            }}
          >
            <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.9}>
              <div className="text-xs font-medium">{station.name}</div>
            </LeafletTooltip>
            <Popup>
              <div className="text-sm font-semibold">{station.name}</div>
              <div className="text-xs text-muted-foreground">{station.city_name}</div>
              <div className="text-xs mt-2">PM2.5: {station.pm25.toFixed(1)} µg/m³</div>
              <div className="text-xs">PM10: {station.pm10.toFixed(1)} µg/m³</div>
              <div className="text-xs">NO₂: {station.no2.toFixed(1)} ppb</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur border border-border/50 text-xs font-medium shadow-sm z-20">
        {cityName} · {stations.length} stations
      </div>
      <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-white/95 backdrop-blur border border-border/50 text-xs shadow-sm z-20">
        <div className="font-semibold text-foreground mb-1">PM2.5 intensity</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-green-500" /> Good
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-amber-500" /> Moderate
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-orange-500" /> Unhealthy
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-red-600" /> Hazardous
        </div>
      </div>
    </div>
  );
}
