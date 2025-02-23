"use client";

import { useState, useRef, useEffect } from "react";
import { useLoadScript, type Libraries } from "@react-google-maps/api";
import type { Autocomplete, PlaceResult } from "@googlemaps/types";

const libraries: Libraries = ["places"];

interface AddressSearchProps {
  onSelect: (lat: number, lon: number, displayName: string) => void;
}

const DashboardAddressSearch: React.FC<AddressSearchProps> = ({ onSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPlace, setSelectedPlace] = useState("");

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete: Autocomplete =
      new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        types: ["geocode"],
        fields: ["formatted_address", "geometry"],
      });

    autocomplete.addListener("place_changed", () => {
      const place: PlaceResult = autocomplete.getPlace();

      if (!place.geometry?.location) {
        console.error("No geometry available for selected place");
        return;
      }

      const address = place.formatted_address ?? "Unknown place";
      setSelectedPlace(address);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onSelect(lat, lng, address);
    });
  }, [isLoaded, onSelect]);

  if (!isLoaded) return <div className="mt-2">Loading...</div>;

  return (
    <div className="w-full max-w-2xl">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for an address..."
        className="w-full rounded-md border p-2"
      />
    </div>
  );
};

export default DashboardAddressSearch;
