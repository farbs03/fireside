"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polygon,
  Polyline,
  Circle,
} from "react-leaflet";
import { FiresideOwnerMarker } from "./FiresideOwnerMarker";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { OtherFiresideMarker } from "./OtherFiresideMarker";
import L, { DragEndEvent, Point } from "leaflet";
import "leaflet-routing-machine";
import { UserLocationIcon } from "./UserLocationIcon";
import { type Fireside } from "@prisma/client";
import { time } from "console";

// Update the MapFocusHandler to be more precise
function MapFocusHandler({
  position,
  mapStyle,
}: {
  position?: [number, number];
  mapStyle: "satellite" | "roadmap";
}) {
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
  marker: MarkerData | undefined;
  handleMarkerPositionChange: (position: L.LatLng) => void;
  onNearbyFiresidesUpdate: (
    firesides: (Fireside & { distance: number })[],
  ) => void;
  focusPosition?: [number, number];
  mapStyle: "satellite" | "roadmap";
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

type RouteInstruction = {
  text: string;
  interval: [number, number];
};

interface GraphHopperResponse {
  paths: {
    points: {
      coordinates: [number, number][]; // Array of [lon, lat] pairs
    };
    instructions: RouteInstruction[];
  }[];
}

export default function Map({
  marker,
  handleMarkerPositionChange,
  onNearbyFiresidesUpdate,
  focusPosition,
  mapStyle,
}: MapProps) {
  const defaultPosition: [number, number] = [34.0522, -118.2437];
  const fixedStart = L.latLng(34.0522, -118.2637); // West of the polygon

  const [selectedEnd, setSelectedEnd] = useState<L.LatLng | null>(null);
  const [route, setRoute] = useState<L.LatLngExpression[]>([]);
  const [instructions, setInstructions] = useState<RouteInstruction[]>([]);
  const [showRouting, setShowRouting] = useState(true);
  const [routePoint, setRoutePoint] = useState<L.LatLngExpression>();

  const markerRef = useRef(null);
  const eventHandlers = {
    click() {
      if (marker) {
        setSelectedEnd(L.latLng(marker.position[0], marker.position[1]));
        setShowRouting(true);
      }
    },
    dragend() {
      const newMarker = markerRef.current;
      if (newMarker != null) {
        console.log(marker);
        const latLng: L.LatLng = newMarker.getLatLng();
        console.log(latLng);
        handleMarkerPositionChange(latLng);
      }
    },
  };

  const { data: sessionData } = useSession();
  const { data: firesides } = api.fireside.getAll.useQuery();

  // Define a more organic, fire-like polygon shape
  const firePolygon = [
    [34.0522, -118.2437], // Center point
    [34.0535, -118.246], // Irregular edge
    [34.0548, -118.2455],
    [34.0555, -118.247],
    [34.056, -118.2485],
    [34.0552, -118.25],
    [34.0558, -118.2515],
    [34.0545, -118.2525],
    [34.0535, -118.2515],
    [34.0525, -118.253],
    [34.0515, -118.252],
    [34.0505, -118.2525],
    [34.05, -118.251],
    [34.049, -118.25],
    [34.0495, -118.2485],
    [34.0485, -118.247],
    [34.0495, -118.2455],
    [34.051, -118.2445],
    [34.0522, -118.2437], // Close the polygon
  ] as L.LatLngExpression[];

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
            ...fireside,
            displayName: fireside.displayName,
            distance,
            lat: fireside.lat,
            lng: fireside.lng,
            water: fireside.water,
            food: fireside.food,
            capacity: fireside.capacity,
            medical: fireside.medical,
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
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }
      });
    };
  }, []);

  useEffect(() => {
    if (selectedEnd) {
      const getRoute = async () => {
        try {
          const response = await fetch(
            `https://graphhopper.com/api/1/route?point=${fixedStart.lat},${fixedStart.lng}&point=${selectedEnd?.lat},${selectedEnd?.lng}&points_encoded=false&avoid=polygon:${firePolygon
              .map((coord) => coord.join(","))
              .join(":")}&key=${process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY}`,
          );
          if (!response.ok) throw new Error("Failed to fetch route");
          const data = (await response.json()) as GraphHopperResponse;
          console.log(data);
          if (data.paths?.[0]?.points) {
            const coordinates = data.paths[0].points?.coordinates.map(
              (coord) => [coord[1], coord[0]] as L.LatLngExpression,
            );
            setRoute(coordinates);
          }
          if (data.paths?.[0]?.instructions) {
            const instructions = data.paths[0].instructions.map(
              (instruction) => {
                return {
                  text: instruction.text,
                  interval: instruction.interval,
                };
              },
            );
            setInstructions(instructions);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getRoute();
    }
  }, [selectedEnd]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute right-4 top-4 z-[1000] flex w-60 flex-col gap-2"
        style={{ marginInline: "auto" }}
      >
        {selectedEnd && (
          <button
            className="rounded bg-white px-4 py-2 shadow-md"
            onClick={() => {
              setShowRouting((prev) => !prev);
            }}
          >
            {showRouting ? "Hide" : "Show"} Route
          </button>
        )}
      </div>

      {instructions && route.length > 0 && showRouting && (
        <div className="absolute right-4 top-16 z-[1000] rounded-md bg-white p-1">
          <div className="flex h-40 w-60 flex-col gap-1 overflow-auto">
            {instructions.map((instruction) => (
              <div
                onMouseOver={() =>
                  setRoutePoint(route[instruction.interval[0]])
                }
                onMouseLeave={() => setRoutePoint(undefined)}
                key={instruction.text}
                className="select-none p-2 text-xs transition duration-100 ease-in hover:bg-zinc-100"
              >
                <p>{instruction.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        id="map"
        center={defaultPosition}
        zoom={13}
        className="h-full flex-grow"
      >
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
          positions={firePolygon}
          pathOptions={{
            color: "#FF4500", // Orange-red color
            fillColor: "#FF6347", // Tomato red
            fillOpacity: 0.3,
            weight: 2,
            dashArray: "5, 5", // Creates a dashed line effect
          }}
        >
          <Popup>Wildfire Area</Popup>
        </Polygon>

        <Marker icon={UserLocationIcon} position={fixedStart}>
          <Popup>Starting Point</Popup>
        </Marker>

        {route && showRouting && (
          <Polyline positions={route} color="#2b7fff" weight={4} />
        )}
        {routePoint && (
          <Circle
            center={routePoint}
            radius={12}
            fill={true}
            fillColor="#1447e6"
            color="#1447e6"
            fillOpacity={1}
          />
        )}

        {marker && (
          <Marker
            icon={FiresideOwnerMarker}
            position={marker.position}
            ref={markerRef}
            draggable={true}
            eventHandlers={eventHandlers}
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
                setShowRouting(true);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

