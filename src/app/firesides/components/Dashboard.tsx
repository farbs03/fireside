"use client";

import {
  Droplet,
  Package,
  AmbulanceIcon as FirstAid,
  Navigation,
  ChevronRight,
  Users,
  Flame,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Plus,
  Ban,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import DashboardAddressSearch from "./DashboardAddressSearch";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState } from "react";

// Define the MarkerData type
interface MarkerData {
  position: [number, number];
  displayName: string;
}

// Dummy data for supplies
const getRandomSupplies = () => ({
  water: Math.floor(Math.random() * 1000) + 100,
  food: Math.floor(Math.random() * 500) + 50,
  medical: Math.floor(Math.random() * 100) + 10,
  capacity: Math.floor(Math.random() * 200) + 50,
});

// Add this interface above the DashboardProps
interface Alert {
  id: string;
  type: "fire" | "road" | "help";
  title: string;
  description: string;
  timestamp: Date;
  reporter?: string;
}

interface DashboardProps {
  marker: MarkerData | null;
  onAddressSelect: (lat: number, lon: number, displayName: string) => void;
  nearbyFiresides: Array<{
    displayName: string;
    distance: number;
    lat: number;
    lng: number;
  }>;
  onFiresideClick: (lat: number, lng: number) => void;
}

export default function Dashboard({
  marker,
  onAddressSelect,
  nearbyFiresides,
  onFiresideClick,
}: DashboardProps) {
  const addFireside = api.fireside.create.useMutation();
  const { data: sessionData } = useSession();

  // Add this state for alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "fire",
      title: "New fire near Golden Gate Park",
      description: "Reported by John D.",
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    },
    {
      id: "2",
      type: "road",
      title: "Highway 101 North Closed",
      description: "Heavy smoke conditions",
      timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    },
    {
      id: "3",
      type: "help",
      title: "Need evacuation help",
      description: "Elderly couple at 123 Pine St",
      timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    },
  ]);

  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "fire" as const,
    title: "",
    description: "",
  });

  const handleAddFireside = () => {
    if (marker && sessionData?.user && sessionData.user.id) {
      addFireside.mutate({
        creatorId: sessionData?.user.id,
        displayName: marker?.displayName,
        lat: marker.position[0],
        lng: marker.position[1],
      });
    }
  };

  const handleAddAlert = () => {
    if (newAlert.title && newAlert.description) {
      const alert: Alert = {
        id: Date.now().toString(),
        type: newAlert.type,
        title: newAlert.title,
        description: newAlert.description,
        timestamp: new Date(),
        reporter: sessionData?.user?.name ?? "Anonymous",
      };
      setAlerts((prev) => [alert, ...prev]);
      setIsAddingAlert(false);
      setNewAlert({ type: "fire", title: "", description: "" });
    }
  };

  return (
    <div className="flex h-full flex-grow flex-col bg-zinc-50 p-4">
      {/* Admin section for adding firesides */}
      {sessionData?.user.email === "chrisgfarber@gmail.com" ||
      sessionData?.user.email === "vijayvittal23@gmail.com" ? (
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Add New Fireside</h3>
          <div className="space-y-3">
            <DashboardAddressSearch onSelect={onAddressSelect} />
            {!marker ? (
              <p className="text-sm text-zinc-500">No address selected</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-zinc-700">
                  Selected: {marker.displayName}
                </p>
                <button
                  onClick={handleAddFireside}
                  className="w-fit rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  Confirm Location
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Nearby Firesides Section */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Closest Firesides
          </h3>
          <span className="text-sm text-gray-500">
            {nearbyFiresides.length} locations
          </span>
        </div>
        <div className="grid gap-2">
          {nearbyFiresides.map((fireside, index) => {
            const supplies = getRandomSupplies();
            return (
              <button
                key={index}
                onClick={() => onFiresideClick(fireside.lat, fireside.lng)}
                className="w-full cursor-pointer rounded-lg bg-white p-3 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {fireside.displayName}
                      </h4>
                      {index === 0 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Nearest
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <Navigation className="h-4 w-4" />
                      <span>{fireside.distance.toFixed(2)} km away</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-blue-500" />
                    <span>{supplies.water}L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-orange-500" />
                    <span>{supplies.food}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FirstAid className="h-3 w-3 text-red-500" />
                    <span>{supplies.medical}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-purple-500" />
                    <span>{supplies.capacity}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Alert System */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Community Alerts
          </h3>
          <button
            onClick={() => setIsAddingAlert(true)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium hover:bg-gray-50"
          >
            <Plus className="h-3 w-3" />
            New Alert
          </button>
        </div>

        {isAddingAlert && (
          <div className="mb-4 space-y-3 rounded-md border border-gray-200 p-3">
            <select
              value={newAlert.type}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  type: e.target.value as "fire" | "road" | "help",
                }))
              }
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="fire">Fire Sighting</option>
              <option value="road">Road Closure</option>
              <option value="help">Help Request</option>
            </select>
            <input
              type="text"
              placeholder="Alert Title"
              value={newAlert.title}
              onChange={(e) =>
                setNewAlert((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border p-2 text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={newAlert.description}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-md border p-2 text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddAlert}>Add Alert</Button>
              <Button variant="outline" onClick={() => setIsAddingAlert(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => {
            const timeAgo = Math.floor(
              (Date.now() - alert.timestamp.getTime()) / 60000,
            );
            const timeDisplay =
              timeAgo < 60
                ? `${timeAgo} min ago`
                : `${Math.floor(timeAgo / 60)}h ago`;

            const alertStyles = {
              fire: {
                bg: "bg-red-50",
                border: "border-red-100",
                text: "text-red-800",
                textMuted: "text-red-600",
                Icon: Flame,
              },
              road: {
                bg: "bg-orange-50",
                border: "border-orange-100",
                text: "text-orange-800",
                textMuted: "text-orange-600",
                Icon: Ban,
              },
              help: {
                bg: "bg-blue-50",
                border: "border-blue-100",
                text: "text-blue-800",
                textMuted: "text-blue-600",
                Icon: MessageSquare,
              },
            }[alert.type];

            return (
              <div
                key={alert.id}
                className={`rounded-md border ${alertStyles.border} ${alertStyles.bg} p-3`}
              >
                <div className={`flex items-center gap-2 ${alertStyles.text}`}>
                  <alertStyles.Icon className="h-4 w-4" />
                  <span className="font-medium">{alert.title}</span>
                </div>
                <p className={`mt-1 text-xs ${alertStyles.textMuted}`}>
                  {timeDisplay} • {alert.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
