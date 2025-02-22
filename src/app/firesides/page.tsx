"use client";

import dynamic from "next/dynamic";
import Navbar from "~/components/navbar";
import Dashboard from "./components/Dashboard";
import { useState, useEffect } from "react";

interface MarkerData {
  position: [number, number];
  displayName: string;
}

const LazyMap = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  const [marker, setMarker] = useState<MarkerData | null>(null);

  const handleAddressSelect = (
    lat: number,
    lon: number,
    displayName: string,
  ) => {
    console.log("Page - Setting marker:", { lat, lon, displayName });
    setMarker({ position: [lat, lon], displayName });
  };

  useEffect(() => {
    console.log("Page - Current marker state:", marker);
  }, [marker]);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex h-full w-full flex-grow mx-auto">
        <div className="w-full flex-grow">
          <LazyMap marker={marker} />
        </div>
        <div className="w-full max-w-[300px] flex-grow">
          <Dashboard onAddressSelect={handleAddressSelect} />
        </div>
      </div>
    </main>
  );
}
