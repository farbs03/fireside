"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polygon,
} from "react-leaflet";
import { FiresideOwnerMarker } from "./FiresideOwnerMarker";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { OtherFiresideMarker } from "./OtherFiresideMarker";
import L from "leaflet";
import "leaflet-routing-machine";

// Update the MapFocusHandler to be more precise
function MapFocusHandler({ position }: { position?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (position && map) {
      console.log("Focusing on position:", position); // Debug log
      map.setView(position, 17, {
        // Increased zoom level
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

interface MapProps {
  marker: MarkerData | null;
  onNearbyFiresidesUpdate: (
    firesides: Array<{
      displayName: string;
      distance: number;
      lat: number;
      lng: number;
    }>,
  ) => void;
  focusPosition?: [number, number];
}

// Update MapUpdater to handle position changes more reliably
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      console.log("MapUpdater - Moving to position:", position);
      // Fly to the new position with animation
      map.flyTo(position, 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
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

// Custom routing control component
function RoutingMachine({ start, end }: { start: L.LatLng; end: L.LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    console.log("Creating route from", start, "to", end); // Debug log

    const northOffset = 0.02; // About 2km north
    const waypoints = [
      start,
      L.latLng(start.lat + northOffset, start.lng), // Go north
      L.latLng(end.lat + northOffset, end.lng), // Go east (above polygon)
      end,
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#6366F1", weight: 4 }],
      },
      show: true, // Changed to true
      showAlternatives: false,
      fitSelectedRoutes: true,
      addWaypoints: false,
      draggableWaypoints: false,
    }).addTo(map);

    // Force route calculation
    routingControl.route();

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
}

export default function Map({
  marker,
  onNearbyFiresidesUpdate,
  focusPosition,
}: MapProps) {
  const defaultPosition: [number, number] = [34.0522, -118.2437];
  const fixedStart = L.latLng(34.0522, -118.2637); // West of the polygon
  const [selectedEnd, setSelectedEnd] = useState<L.LatLng | null>(null);
  const [mapStyle, setMapStyle] = useState<"satellite" | "roadmap">(
    "satellite",
  );
  const [showRouting, setShowRouting] = useState(false);
  const { data: sessionData } = useSession();
  const { data: firesides, refetch } = api.fireside.getAll.useQuery();

  // Define LA downtown area polygon coordinates
  const laBounds = [
    [34.0522, -118.2437],
    [34.0522, -118.2537],
    [34.0622, -118.2537],
    [34.0622, -118.2437],
  ];

  // Debug log for marker updates
  useEffect(() => {
    console.log("Map component - Marker updated:", marker);
  }, [marker]);

  // Calculate distances from fixed starting point
  useEffect(() => {
    if (firesides) {
      const nearbyFiresides = firesides
        .map((fireside) => {
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const lat1 = (fixedStart.lat * Math.PI) / 180;
          const lat2 = (fireside.lat * Math.PI) / 180;
          const dLat = ((fireside.lat - fixedStart.lat) * Math.PI) / 180;
          const dLon = ((fireside.lng - fixedStart.lng) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return {
            displayName: fireside.displayName,
            distance,
            lat: fireside.lat,
            lng: fireside.lng,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      onNearbyFiresidesUpdate(nearbyFiresides);
    }
  }, [firesides, onNearbyFiresidesUpdate]);

  // Cleanup function to prevent map initialization issues
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

  // Add debug logging for focusPosition changes
  useEffect(() => {
    console.log("Focus position updated:", focusPosition);
  }, [focusPosition]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        <button
          className="rounded bg-white px-4 py-2 shadow-md"
          onClick={() =>
            setMapStyle((prev) =>
              prev === "satellite" ? "roadmap" : "satellite",
            )
          }
        >
          Switch to {mapStyle === "satellite" ? "Roadmap" : "Satellite"}
        </button>
        {selectedEnd && (
          <button
            className="rounded bg-white px-4 py-2 shadow-md"
            onClick={() => {
              setShowRouting((prev) => !prev);
              if (!showRouting) {
                setSelectedEnd(null);
              }
            }}
          >
            {showRouting ? "Hide" : "Show"} Route
          </button>
        )}
      </div>
      <MapContainer
        id="map"
        center={marker ? marker.position : defaultPosition}
        zoom={13}
        className="h-full flex-grow"
        zoomControl={false}
        dragging={true}
      >
        {focusPosition && <MapFocusHandler position={focusPosition} />}
        {marker && <MapUpdater position={marker.position} />}
        <MapController center={marker?.position ?? defaultPosition} />
        <TileLayer
          attribution={
            mapStyle === "satellite"
              ? "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              : "&copy; Google Maps"
          }
          url={
            mapStyle === "satellite"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          }
        />
        <Polygon
          positions={laBounds}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.2,
            weight: 2,
          }}
        >
          <Popup>Downtown LA Area</Popup>
        </Polygon>
        <Marker icon={FiresideOwnerMarker} position={fixedStart}>
          <Popup>Starting Point</Popup>
        </Marker>
        {showRouting && selectedEnd && (
          <RoutingMachine start={fixedStart} end={selectedEnd} />
        )}
        {marker && (
          <Marker
            icon={FiresideOwnerMarker}
            position={marker.position}
            draggable={true}
            eventHandlers={{
              click: () => {
                setSelectedEnd(
                  L.latLng(marker.position[0], marker.position[1]),
                );
              },
            }}
          >
            <Popup>{marker.displayName}</Popup>
          </Marker>
        )}
        {firesides?.map((fireside) => (
          <Marker
            key={fireside.displayName}
            icon={
              sessionData?.user.id === fireside.creatorId
                ? FiresideOwnerMarker
                : OtherFiresideMarker
            }
            position={{ lat: fireside.lat, lng: fireside.lng }}
            eventHandlers={{
              click: () => {
                setSelectedEnd(L.latLng(fireside.lat, fireside.lng));
              },
            }}
          >
            <Popup>{fireside.displayName}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
