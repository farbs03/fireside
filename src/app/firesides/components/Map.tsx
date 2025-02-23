"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { FiresideOwnerMarker, MapPinMarker } from "./FiresideOwnerMarker";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { OtherFiresideMarker } from "./OtherFiresideMarker";
import {
  useLoadScript,
  GoogleMap,
  StreetViewPanorama,
  Polygon,
} from "@react-google-maps/api";

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
  const [isSatellite, setIsSatellite] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Add polygon coordinates for circular/jagged area around downtown LA
  const laPolygon = [
    { lat: 34.0522, lng: -118.2437 }, // Center point
    { lat: 34.0622, lng: -118.2537 }, // North-West
    { lat: 34.0672, lng: -118.2437 }, // North
    { lat: 34.0622, lng: -118.2337 }, // North-East
    { lat: 34.0522, lng: -118.2237 }, // East
    { lat: 34.0422, lng: -118.2337 }, // South-East
    { lat: 34.0372, lng: -118.2437 }, // South
    { lat: 34.0422, lng: -118.2537 }, // South-West
    { lat: 34.0522, lng: -118.2637 }, // West
    { lat: 34.0522, lng: -118.2437 }, // Back to start
  ];

  const mapOptions = {
    mapTypeId: isSatellite ? "satellite" : "roadmap",
    mapTypeControl: false,
  };

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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <button
        onClick={() => setIsSatellite(!isSatellite)}
        className="absolute right-4 top-4 z-[1000] rounded-md bg-white px-4 py-2 shadow-md"
      >
        Switch to {isSatellite ? "Map" : "Satellite"} View
      </button>

      <GoogleMap
        mapContainerClassName="h-full flex-grow"
        center={marker?.position ?? { lat: 34.0549, lng: -118.2451 }}
        zoom={11}
        options={mapOptions}
      >
        {!isSatellite && (
          <Polygon
            paths={laPolygon}
            options={{
              fillColor: "#FF0000",
              fillOpacity: 0.2,
              strokeColor: "#FF0000",
              strokeOpacity: 1,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
