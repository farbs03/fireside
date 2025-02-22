"use client";
import DashboardAddressSearch from "./DashboardAddressSearch";

interface DashboardProps {
  onAddressSelect: (lat: number, lon: number, displayName: string) => void;
}

export default function Dashboard({ onAddressSelect }: DashboardProps) {
  console.log("Dashboard - Received onAddressSelect prop:", !!onAddressSelect);
  return (
    <div className="h-full flex-grow bg-zinc-100 p-4">
      <div className="mb-4">
        <DashboardAddressSearch onSelect={onAddressSelect} />
      </div>
      <p>Dashboard</p>
    </div>
  );
}
