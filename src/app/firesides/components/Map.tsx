"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import GeocoderControl from "./GeocoderControl"; // Existing geocoder control (optional)
import { MapPinMarker } from "./MapPinMarker";
import LocationSearch from "./LocationSearch";
interface MarkerData {
  position: [number, number];
  displayName: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
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
          <MapController center={marker?.position || defaultPosition} />
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
        <div style={{
        position: "absolute",
        top: 10,
        left: 0,
        right: 0,
        marginInline: "auto",
        width: "300px",
        zIndex: 1000,
        background: "white",
        padding: "5px",
        borderRadius: "4px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
      className="border border-black border-3">
      <LocationSearch 
        onPlaceSelected={(lat, lng) => {
          setMarker({
            position: [lat, lng],
            displayName: "Selected Location" // Add a default display name
          });
        }} 
      />
        </div>
      </MapContainer>
    </div>
  );
}
