"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { FiresideOwnerMarker } from "./FiresideOwnerMarker";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { OtherFiresideMarker } from "./OtherFiresideMarker";

interface MapProps {
  marker: MarkerData | null;
}

// This component handles map view updates
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function Map({ marker }: MapProps) {
  const defaultPosition: [number, number] = [34.0549, -118.2451];
  const { data: sessionData } = useSession();
  const { data: firesides, refetch } = api.fireside.getAll.useQuery();

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
        className="h-full flex-grow"
        zoomControl={false}
      >
        <MapController center={marker?.position ?? defaultPosition} />
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Render marker if an address has been searched */}
        {marker && (
          <>
            <MapUpdater position={marker.position} />
            <Marker
              icon={FiresideOwnerMarker}
              position={marker.position}
              draggable={true}
            >
              <Popup>{marker.displayName}</Popup>
            </Marker>
          </>
        )}
        {firesides?.map((fireside) => (
          <button key={fireside.displayName} onClick={() => console.log("Hi")}>
            <Marker
              icon={
                sessionData?.user.id === fireside.creatorId
                  ? FiresideOwnerMarker
                  : OtherFiresideMarker
              }
              position={{ lat: fireside.lat, lng: fireside.lng }}
            >
              <Popup>{fireside.displayName}</Popup>
            </Marker>
          </button>
        ))}
      </MapContainer>
    </div>
  );
}
