// components/AutoPopup.js
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function AutoPopup({ focusedPointOfInterest, points }) {
  const map = useMap();

  useEffect(() => {
    if (!focusedPointOfInterest || !map) return;

    // Find the POI object that matches the focused coordinates
    const poi = (points || []).find((p) => {
      if (!Array.isArray(p.center)) return false;
      return p.center[0] === focusedPointOfInterest[0] && p.center[1] === focusedPointOfInterest[1];
    });

    // Build safe-ish HTML content for the popup
    const title = poi?.title ?? "";
    const description = poi?.description ?? "";
    const content = `<div style="font-size:14px"><strong>${title}</strong><br/>${description}</div>`;

    // Open popup at the focused coordinates — Leaflet's helper
    map.openPopup(content, focusedPointOfInterest);

    // Optionally close the popup when component unmounts or focusedPointOfInterest is cleared
    return () => {
      // only close if the open popup is at that location
      const open = map._popup; // Leaflet stores currently open popup on map._popup
      if (open && open.getLatLng && focusedPointOfInterest) {
        const latlng = open.getLatLng();
        if (latlng.lat === focusedPointOfInterest[0] && latlng.lng === focusedPointOfInterest[1]) {
          map.closePopup();
        }
      }
    };
  }, [focusedPointOfInterest, map, points]);

  return null;
}
