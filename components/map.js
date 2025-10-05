import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PointOfInterestMarker } from "./PointOfInterestMarker";
import { PopulationOverlay } from "./PopulationOverlay";
import { AODOverlay } from "./AODOverlay";

// Dynamically import all react-leaflet components
const AutoPopup = dynamic(() => import("./AutoPopup"), { ssr: false });
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Small helper that moves the map when focusedPointOfInterest changes. Again we have to import dynamically to ensure it loads only in browser to avoid window not found errors.
const FlyToFocusedPoint = dynamic(
  () => import("./FlyToFocusedPoint"),
  { ssr: false }
);

export default function MapC({ pointsOfInterest, filters, focusedPointOfInterest, setFocus, onPointHover, onPointLeave }) {
  const [L, setLeaflet] = useState(null);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    // ✅ Import leaflet dynamically so it only loads in browser
    (async () => {
      const leaflet = await import("leaflet");
      const newIcon = new leaflet.Icon({
        iconUrl: "/leaflet/marker-icon-2x.png",
        iconSize: [24, 40],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
      setLeaflet(leaflet);
      setIcon(newIcon);
    })();
  }, []);

  // Wait for leaflet to load before rendering
  if (!L || !icon) return null;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[47.6062, -122.3321]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToFocusedPoint focusedPointOfInterest={focusedPointOfInterest} />

        {pointsOfInterest.map((p, keyId) => (
          <PointOfInterestMarker
            key={keyId}
            {...p}
            setFocus={setFocus}
            onPointHover={onPointHover}
            onPointLeave={onPointLeave}
          />
        ))}
        {filters[0] &&<PopulationOverlay />}
        {filters[1] && <AODOverlay />}
      </MapContainer>
    </div>
  );
}
