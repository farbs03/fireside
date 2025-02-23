"use client";

import dynamic from "next/dynamic";
import Navbar from "~/components/navbar";
import Dashboard from "./components/Dashboard";
import { useState } from "react";

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
  const [marker, setMarker] = useState<MarkerData | null>(null);
  const [nearbyFiresides, setNearbyFiresides] = useState<NearbyFireside[]>([]);
  const [focusPosition, setFocusPosition] = useState<[number, number]>();

  const handleAddressSelect = (
    lat: number,
    lon: number,
    displayName: string,
  ) => {
    setMarker({ position: [lat, lon], displayName });
  };

  const handleFiresideClick = (lat: number, lng: number) => {
    setFocusPosition([lat, lng]);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex h-full w-full flex-grow">
        <div className="w-full flex-grow">
          <LazyMap
            marker={marker}
            onNearbyFiresidesUpdate={setNearbyFiresides}
            focusPosition={focusPosition}
          />
        </div>
        <div className="w-full max-w-[300px] flex-grow">
          <Dashboard
            marker={marker}
            onAddressSelect={handleAddressSelect}
            nearbyFiresides={nearbyFiresides}
            onFiresideClick={handleFiresideClick}
          />
        </div>
      </div>
    </main>
  );
}
