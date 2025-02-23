"use client"

import { Droplet, Package, AmbulanceIcon as FirstAid, Navigation, ChevronRight, Users } from "lucide-react"
import { Button } from "~/components/ui/button"
import DashboardAddressSearch from "./DashboardAddressSearch"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"

// Define the MarkerData type
interface MarkerData {
  position: [number, number]
  displayName: string
}

// Dummy data for supplies
const getRandomSupplies = () => ({
  water: Math.floor(Math.random() * 1000) + 100,
  food: Math.floor(Math.random() * 500) + 50,
  medical: Math.floor(Math.random() * 100) + 10,
  capacity: Math.floor(Math.random() * 200) + 50,
})

interface DashboardProps {
  marker: MarkerData | null
  onAddressSelect: (lat: number, lon: number, displayName: string) => void
  nearbyFiresides: Array<{
    displayName: string
    distance: number
    lat: number
    lng: number
  }>
  onFiresideClick: (lat: number, lng: number) => void
}

export default function Dashboard({ marker, onAddressSelect, nearbyFiresides, onFiresideClick }: DashboardProps) {
  const addFireside = api.fireside.create.useMutation()
  const { data: sessionData } = useSession()

  const handleAddFireside = () => {
    if (marker && sessionData?.user && sessionData.user.id) {
      addFireside.mutate({
        creatorId: sessionData?.user.id,
        displayName: marker?.displayName,
        lat: marker.position[0],
        lng: marker.position[1],
      })
    }
  }

  return (
    <div className="flex h-full flex-grow flex-col bg-zinc-50 p-4">
      {/* Admin section for adding firesides */}
      {sessionData?.user.email === "chrisgfarber@gmail.com" || sessionData?.user.email === "vijayvittal23@gmail.com" ? (
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Add New Fireside</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Address</p>
              <DashboardAddressSearch onSelect={onAddressSelect} />
            </div>
            {!marker ? (
              <p className="text-sm text-zinc-500">No address selected</p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-zinc-700">Selected: {marker.displayName}</p>
                <Button onClick={handleAddFireside}>Confirm Location</Button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Nearby Firesides Section */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Closest Firesides</h3>
          <span className="text-sm text-gray-500">{nearbyFiresides.length} locations found</span>
        </div>

        <div className="grid gap-4">
          {nearbyFiresides.map((fireside, index) => {
            const supplies = getRandomSupplies()
            return (
              <button
                key={index}
                onClick={() => onFiresideClick(fireside.lat, fireside.lng)}
                className="w-full cursor-pointer rounded-lg bg-white p-4 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{fireside.displayName}</h4>
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
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Water</p>
                      <p className="font-medium">{supplies.water}L</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-orange-50 p-2">
                      <Package className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Food</p>
                      <p className="font-medium">{supplies.food} units</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-50 p-2">
                      <FirstAid className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Medical</p>
                      <p className="font-medium">{supplies.medical} kits</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-purple-50 p-2">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="font-medium">{supplies.capacity} people</p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

