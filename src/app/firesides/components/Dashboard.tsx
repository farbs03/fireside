"use client";
import { Button } from "~/components/ui/button";
import DashboardAddressSearch from "./DashboardAddressSearch";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

interface DashboardProps {
  marker: MarkerData | null;
  onAddressSelect: (lat: number, lon: number, displayName: string) => void;
}

export default function Dashboard({ marker, onAddressSelect }: DashboardProps) {
  const addFireside = api.fireside.create.useMutation();
  const { data: sessionData } = useSession();
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

  return (
    <div className="h-full flex-grow bg-zinc-100 p-4">
      {sessionData?.user.email === "chrisgfarber@gmail.com" ? (
        <div className="mb-4">
          <p className="mb-1 text-sm font-semibold">Address</p>
          <DashboardAddressSearch onSelect={onAddressSelect} />
          {!marker ? (
            <p className="text-zinc-500">No address selected</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p>Selected: {marker.displayName}</p>
              <Button onClick={handleAddFireside}>Confirm</Button>
            </div>
          )}
        </div>
      ) : (
        <div>Not authorized to add a fireside</div>
      )}
    </div>
  );
}
