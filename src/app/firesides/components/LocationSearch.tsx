"use client";

import { useLoadScript, Libraries } from "@react-google-maps/api";
import { useState, useRef, useEffect } from "react";

const libraries: Libraries = ["places"];

interface LocationSearchProps {
  onPlaceSelected: (lat: number, lng: number) => void; // Add callback prop
}

export default function LocationSearch({ onPlaceSelected }: LocationSearchProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCdGLdUL_wmKGJzU-PRkKvxa1jHiba6-rI",
    libraries,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPlace, setSelectedPlace] = useState("");

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["geocode"],
      fields: ["formatted_address", "geometry"], // Request geometry data
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry?.location) {
        console.error("No geometry available for selected place");
        return;
      }

      setSelectedPlace(place.formatted_address || "Unknown place");
      
      // Extract coordinates and call the callback
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onPlaceSelected(lat, lng);
    });
  }, [isLoaded, onPlaceSelected]);

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="p-2 pl-4 pr-4">
      <input 
        ref={inputRef} 
        type="text" 
        placeholder="Enter a location" 
        className="border mr-12 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}