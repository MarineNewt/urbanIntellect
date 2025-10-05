import dynamic from "next/dynamic";
import aodData from "../assets/seattle_aod.json";

// Dynamically import HeatmapLayer to avoid SSR issues
const HeatmapLayer = dynamic(
  () => import("react-leaflet-heatmap-layer-v3").then((mod) => mod.HeatmapLayer),
  { ssr: false }
);

// AOD (Aerosol Optical Depth) overlay as a heatmap
export const AODOverlay = () => {
  // Convert GeoJSON features → heatmap data format [lat, lng, intensity]
  const heatmapPoints = aodData.features.map((feature) => {
    const { lat, lon, aod } = feature.properties;
    return [lat, lon, aod]; // intensity = aod
  });

  return (
    <HeatmapLayer
      fitBoundsOnLoad
      fitBoundsOnUpdate
      points={heatmapPoints}
      longitudeExtractor={(p) => p[1]}
      latitudeExtractor={(p) => p[0]}
      intensityExtractor={(p) => p[2]}
      radius={35}            // controls spread
      blur={20}              // controls smoothness
      max={0.5}              // max intensity (tune to your data range)
      minOpacity={0.3}
    />
  );
};
