// const position: [number, number] = [34.0549, -118.2451];

"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Navbar from "~/components/navbar"; // Adjust if necessary
import GeocoderControl from "./GeocoderControl"; // Existing geocoder control (optional)
import AddressSearch from "./AddressSearch";
import { MapPinMarker } from "./MapPinMarker";

interface MarkerData {
  position: [number, number];
  displayName: string;
}

export default function Map() {
  const defaultPosition: [number, number] = [34.0549, -118.2451];
  const [marker, setMarker] = useState<MarkerData | null>(null);
  
  useEffect(() => {
    return () => {
      const containers = document.querySelectorAll(".leaflet-container");
      containers.forEach((container) => {
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }
      });
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <MapContainer
        id="map"
        center={!marker ? defaultPosition : marker.position}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full flex-grow"
        zoomControl={false}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Render marker if an address has been searched */}
        {marker && (
          <Marker
            icon={MapPinMarker}
            position={marker.position}
            draggable={true}
          >
            <Popup>{marker.displayName}</Popup>
          </Marker>
        )}
        {/* Optionally include the basic geocoder control */}
        <GeocoderControl />
        {/* Include the new autocomplete search and pass the onSelect callback */}
        <div className="">
          <AddressSearch
            onSelect={(lat, lon, displayName) => {
              setMarker({ position: [lat, lon], displayName });
            }}
          />
        </div>
      </MapContainer>
    </div>
  );
}
