import { createClientOnlyFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import type { Station } from "@/lib/api";

type GeographicalHeatmapProps = {
  stations: Station[];
  cityName?: string;
};

type ClientComponent = (props: GeographicalHeatmapProps) => JSX.Element;

const loadClientHeatmap = createClientOnlyFn(() => import("./GeographicalHeatmap.client"));

export function GeographicalHeatmap(props: GeographicalHeatmapProps) {
  const [ClientMap, setClientMap] = useState<ClientComponent | null>(null);

  useEffect(() => {
    let active = true;
    loadClientHeatmap
      ? loadClientHeatmap()
          .then((module) => {
            if (active && module?.GeographicalHeatmapClient) {
              setClientMap(() => module.GeographicalHeatmapClient);
            }
          })
          .catch(() => {
            if (active) setClientMap(null);
          })
      : setClientMap(null);
    return () => {
      active = false;
    };
  }, []);

  if (!ClientMap) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  return <ClientMap {...props} />;
}
