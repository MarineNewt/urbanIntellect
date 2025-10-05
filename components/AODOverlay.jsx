import dynamic from "next/dynamic";
import aodData from "../assets/seattle_aod.json"; // adjust filename if needed

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export const AODOverlay = () => {
  return aodData.features.map((feature, index) => {
    const { lat, lon, aod } = feature.properties;

    // Optional: scale circle size and color by AOD
    const radius = aod * 40; // adjust scaling to your liking
    const fillColor =
      aod > 0.4 ? "red" : aod > 0.3 ? "orange" : aod > 0.2 ? "yellow" : "green";

    return (
      <CircleMarker
        key={index}
        center={[lat, lon]}
        pathOptions={{ fillColor, color: fillColor, fillOpacity: 0.6, stroke: false }}
        radius={radius}
      >
        <Popup>
          <b>Aerosol Optical Depth (AOD)</b>
          <br />
          Value: {aod.toFixed(3)}
          <br />
          Lat: {lat.toFixed(3)} | Lon: {lon.toFixed(3)}
        </Popup>
      </CircleMarker>
    );
  });
};