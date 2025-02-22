// const position: [number, number] = [34.0549, -118.2451];

"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Navbar from "~/components/navbar"; // Adjust if necessary
import DashboardAddressSearch from "./DashboardAddressSearch";
import { MapPinMarker } from "./MapPinMarker";

interface MarkerData {
  position: [number, number];
  displayName: string;
}

interface MapProps {
  marker: MarkerData | null;
}

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
}

export default function Map({ marker }: MapProps) {
  const defaultPosition: [number, number] = [34.0549, -118.2451];

  useEffect(() => {
    console.log("Map - Received marker prop:", marker);
    return () => {
      const containers = document.querySelectorAll(".leaflet-container");
      containers.forEach((container) => {
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }
      });
    };
  }, [marker]);

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
          <>
            <MapUpdater position={marker.position} />
            <Marker
              icon={MapPinMarker}
              position={marker.position}
              draggable={true}
            >
              <Popup>{marker.displayName}</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
