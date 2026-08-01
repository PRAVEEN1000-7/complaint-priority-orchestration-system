import { useEffect, useRef } from "react";
import type { Station } from "@/lib/api";

type HeatmapCanvasProps = {
  stations: Station[];
  cityName?: string;
};

export function HeatmapCanvas({ stations, cityName = "Selected City" }: HeatmapCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      draw(ctx, w, h, stations);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [stations]);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, data: Station[]) => {
    // base
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#e6f4f1");
    grad.addColorStop(1, "#cfe7e1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // grid roads
    ctx.strokeStyle = "rgba(20,80,80,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (data.length === 0) {
      ctx.fillStyle = "rgba(15, 118, 110, 0.8)";
      ctx.font = "600 14px sans-serif";
      ctx.fillText("No station data available", 20, 28);
      return;
    }

    // heat blobs
    const lats = data.map((s) => s.lat);
    const lons = data.map((s) => s.lon);
    const minLat = Math.min(...lats) - 0.04;
    const maxLat = Math.max(...lats) + 0.04;
    const minLon = Math.min(...lons) - 0.04;
    const maxLon = Math.max(...lons) + 0.04;

    data.forEach((s) => {
      const x = ((s.lon - minLon) / (maxLon - minLon)) * w;
      const y = h - ((s.lat - minLat) / (maxLat - minLat)) * h;
      const intensity = Math.min(1, s.pm25 / 200);
      const r = 60 + intensity * 70;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      const color =
        intensity > 0.7 ? "239, 68, 68" : intensity > 0.45 ? "249, 115, 22" : "234, 179, 8";
      rg.addColorStop(0, `rgba(${color}, 0.55)`);
      rg.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // markers
    data.forEach((s) => {
      const x = ((s.lon - minLon) / (maxLon - minLon)) * w;
      const y = h - ((s.lat - minLat) / (maxLat - minLat)) * h;
      ctx.fillStyle = "#0f766e";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <canvas ref={ref} className="w-full h-full block" />
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur border border-border text-xs font-medium">
        {cityName} · {stations.length} stations
      </div>
      <div className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-background/90 backdrop-blur border border-border text-xs space-y-1">
        <div className="font-semibold mb-1">PM2.5 intensity</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-yellow-400" /> Moderate
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-orange-500" /> Unhealthy
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-red-500" /> Hazardous
        </div>
      </div>
    </div>
  );
}
