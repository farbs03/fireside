"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { control } from "leaflet";

// Import the geocoder plugin and its CSS
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

// Note: TypeScript types may not be available for leaflet-control-geocoder,
// so we use `any` where necessary.
const GeocoderControl: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    //@ts-ignore: leaflet-control-geocoder might not have complete TS typings
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true,
    })
      .on("markgeocode", (e: any) => {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
          bbox.getSouthEast(),
          bbox.getNorthEast(),
          bbox.getNorthWest(),
          bbox.getSouthWest(),
        ]);
        map.fitBounds(poly.getBounds());
      })
      .addTo(map);

    // Cleanup: remove the control when the component unmounts
    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
};

export default GeocoderControl;
