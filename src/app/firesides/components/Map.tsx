"use client"

import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import { MapContainer, Marker, Popup, TileLayer, useMap, Polygon } from "react-leaflet"
import { FiresideOwnerMarker } from "./FiresideOwnerMarker"
import { api } from "~/trpc/react"
import { useSession } from "next-auth/react"
import { OtherFiresideMarker } from "./OtherFiresideMarker"
import L from "leaflet"
import "leaflet-routing-machine"
import { UserLocationIcon } from "./UserLocationIcon";

// Replace the existing routingStyles constant with this enhanced version
const routingStyles = `
  .leaflet-routing-container {
    background-color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    margin: 16px;
    max-width: 350px;
    max-height: 500px;
    overflow-y: auto;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .leaflet-routing-container::-webkit-scrollbar {
    width: 6px;
  }

  .leaflet-routing-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .leaflet-routing-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .leaflet-routing-container h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #111827;
  }

  .leaflet-routing-alt {
    max-height: none !important;
    color: #374151;
    font-size: 14px;
    line-height: 1.5;
  }

  .leaflet-routing-alt tr {
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .leaflet-routing-alt tr:last-child {
    border-bottom: none;
  }

  .leaflet-routing-alt tr:hover {
    background-color: #f9fafb;
    transition: background-color 0.2s ease;
  }

  .leaflet-routing-icon {
    background-image: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #6366F1;
    margin: 6px;
    position: relative;
  }

  .leaflet-routing-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
  }

  .leaflet-routing-alt-minimized {
    background-color: white;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .leaflet-routing-alt-minimized:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .leaflet-routing-container.leaflet-routing-container-hide {
    opacity: 0.95;
    transition: opacity 0.2s ease;
  }

  .leaflet-routing-container.leaflet-routing-container-hide:hover {
    opacity: 1;
  }
`;

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
  marker: MarkerData | null;
  onNearbyFiresidesUpdate: (
    firesides: Array<{
      displayName: string;
      distance: number;
      lat: number;
      lng: number;
      water: number;
      food: number;
      medical: number;
      capacity: number;
    }>,
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

// Custom routing control component
function RoutingMachine({ start, end }: { start: L.LatLng; end: L.LatLng }) {
  const map = useMap();

  // Add the custom styles to the document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = routingStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        start,
        L.latLng(start.lat + 0.02, start.lng),
        L.latLng(end.lat + 0.02, end.lng),
        end,
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [
          {
            color: "#6366F1",
            weight: 4,
            opacity: 0.7,
          },
        ],
      },
      show: true,
      showAlternatives: false,
      fitSelectedRoutes: true,
      addWaypoints: false,
      draggableWaypoints: false,
      router: L.Routing.osrmv1({
        language: "en",
        formatter: new L.Routing.Formatter({
          units: "imperial", // Use miles instead of kilometers
        }),
      }),
      formatter: new L.Routing.Formatter({
        units: "imperial",
        roundingSensitivity: 1,
      }),
    }).addTo(map);

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
  mapStyle,
}: MapProps) {
  const defaultPosition: [number, number] = [34.0522, -118.2437];
  const fixedStart = L.latLng(34.0522, -118.2637); // West of the polygon
  const [selectedEnd, setSelectedEnd] = useState<L.LatLng | null>(null);
  const [showRouting, setShowRouting] = useState(false);
  const { data: sessionData } = useSession();
  const { data: firesides, refetch } = api.fireside.getAll.useQuery();

  // Define a more organic, fire-like polygon shape
  const laBounds = [
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
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute left-0 right-0 top-4 z-[1000] flex w-60 flex-col gap-2"
        style={{ marginInline: "auto" }}
      >
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

