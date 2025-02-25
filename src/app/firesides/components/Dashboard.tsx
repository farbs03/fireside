"use client"

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
  Carrot,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import DashboardAddressSearch from "./DashboardAddressSearch";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import UpdateFireside from "./UpdateFireside";
import { type Fireside } from "@prisma/client";

interface FiresideAlert {
  id: string;
  type: "fire" | "road" | "help";
  title: string;
  description: string;
  timestamp?: Date;
  reporter?: string;
}

interface DashboardProps {
  marker: MarkerData | undefined;
  onAddressSelect: (lat: number, lon: number, displayName: string) => void;
  nearbyFiresides: Array<
    {
      distance: number;
    } & Fireside
  >;
  onFiresideClick: (lat: number, lng: number) => void;
  handleMapStyleChange: (prev: "satellite" | "roadmap") => void;
  mapStyle: "satellite" | "roadmap";
  showRouting: boolean;
  setShowRouting: (prev: boolean) => void;
}

export default function Dashboard({
  marker,
  onAddressSelect,
  nearbyFiresides,
  onFiresideClick,
  mapStyle,
  handleMapStyleChange,
}: DashboardProps) {
  const { data: sessionData } = useSession();
  const addFireside = api.fireside.create.useMutation();
  const { data: userFiresides } = api.fireside.getByUser.useQuery();
  const { data: user } = api.user.getCurrent.useQuery();

  const handleAddFireside = () => {
    if (marker && sessionData?.user && sessionData.user.id) {
      console.log(marker);
      addFireside.mutate(
        {
          creatorId: sessionData?.user.id,
          displayName: marker?.displayName,
          lat: marker.position[0],
          lng: marker.position[1],
        },
        {
          onSuccess: () => {
            console.log("Success!");
          },
        },
      );
    }
  };

  // Add this state for alerts
  const [alerts, setAlerts] = useState<FiresideAlert[]>([
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
  const [newAlert, setNewAlert] = useState<FiresideAlert | null>();

  const handleAddAlert = () => {
    if (newAlert?.title && newAlert.description) {
      const alert: FiresideAlert = {
        id: Date.now().toString(),
        type: newAlert.type,
        title: newAlert.title,
        description: newAlert.description,
        timestamp: new Date(),
        reporter: sessionData?.user?.name ?? "Anonymous",
      };
      setAlerts((prev) => [alert, ...prev]);
      setIsAddingAlert(false);
      setNewAlert(null);
    }
  };

  return (
    <div className="flex h-full max-h-[90vh] flex-col overflow-auto bg-zinc-50 p-4">
      <button
        className="mb-4 rounded border bg-white px-4 py-2 shadow-md"
        onClick={() =>
          handleMapStyleChange(
            mapStyle === "satellite" ? "roadmap" : "satellite",
          )
        }
      >
        Switch to {mapStyle === "satellite" ? "Roadmap" : "Satellite"}
      </button>
      {/* Admin section for adding firesides */}
      {user?.role === "organization" ? (
        <>
          <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">Add New Fireside</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Address
                </p>
                <DashboardAddressSearch onSelect={onAddressSelect} />
              </div>
              {!marker ? (
                <p className="text-sm text-zinc-500">No address selected</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-zinc-700">
                    Selected: {marker.displayName}
                  </p>
                  <Button onClick={handleAddFireside}>Confirm Location</Button>
                </div>
              )}
            </div>
          </div>
          <div>
            {userFiresides?.map((fireside: Fireside) => (
              <UpdateFireside key={fireside.id} fireside={fireside} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Closest Firesides
            </h3>
            <span className="text-sm text-gray-500">
              {nearbyFiresides.length} locations found
            </span>
          </div>

          <div className="grid gap-4">
            {nearbyFiresides.map((fireside, index) => {
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
                      <span>{fireside.water}L</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Carrot className="h-3 w-3 text-orange-500" />
                      <span>{fireside.food}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FirstAid className="h-3 w-3 text-red-500" />
                      <span>{fireside.medical}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-500" />
                      <span>{fireside.capacity}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Alert System */}
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-md">
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
              value={newAlert?.type}
              onChange={(e) =>
                setNewAlert((prev: FiresideAlert | null) => ({
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

