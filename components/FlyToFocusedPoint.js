import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FlyToFocusedPoint({ focusedPointOfInterest }) {
  const map = useMap();

  useEffect(() => {
    if (focusedPointOfInterest && map) {
      let focusedoffset = [focusedPointOfInterest[0], focusedPointOfInterest[1] - .01]
      map.flyTo(focusedoffset, 14, { duration: 1.5 });
    }
  }, [focusedPointOfInterest, map]);

  return null;
}
