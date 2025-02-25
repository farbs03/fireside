"use client";

import dynamic from "next/dynamic";
import Navbar from "~/components/navbar";
import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import type L from "leaflet";

interface MarkerData {
  position: [number, number];
  displayName: string;
}

interface NearbyFireside {
  displayName: string;
  distance: number;
  lat: number;
  lng: number;
}

const LazyMap = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  const [marker, setMarker] = useState<MarkerData>();
  const [nearbyFiresides, setNearbyFiresides] = useState<NearbyFireside[]>([]);
  const [focusPosition, setFocusPosition] = useState<[number, number]>();

  const [showRouting, setShowRouting] = useState(false);
  const [selectedEnd, setSelectedEnd] = useState<L.LatLng | null>(null);

  const handleAddressSelect = (
    lat: number,
    lon: number,
    displayName: string,
  ) => {
    setMarker({ position: [lat, lon], displayName: displayName });
  };

  useEffect(() => {
    console.log(marker);
  }, [marker]);

  const [mapStyle, setMapStyle] = useState<"satellite" | "roadmap">(
    "satellite",
  );

  const handleFiresideClick = (lat: number, lng: number) => {
    setFocusPosition([lat, lng]);
  };

  function handleMarkerPositionChange(position: L.LatLng) {
    if (marker) {
      setMarker({
        displayName: marker.displayName,
        position: [position.lat, position.lng],
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex h-full w-full flex-grow">
        <div className="w-full flex-grow">
          <LazyMap
            marker={marker}
            handleMarkerPositionChange={handleMarkerPositionChange}
            onNearbyFiresidesUpdate={setNearbyFiresides}
            focusPosition={focusPosition}
            mapStyle={mapStyle}
          />
        </div>
        <div className="w-full max-w-[400px] flex-grow">
          <Dashboard
            mapStyle={mapStyle}
            handleMapStyleChange={(val) => setMapStyle(val)}
            marker={marker}
            onAddressSelect={handleAddressSelect}
            nearbyFiresides={nearbyFiresides}
            onFiresideClick={handleFiresideClick}
            setShowRouting={setShowRouting}
            showRouting={showRouting}
          />
        </div>
      </div>
    </main>
  );
}
