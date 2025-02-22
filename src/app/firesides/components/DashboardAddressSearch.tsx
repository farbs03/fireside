"use client";

import { useState, useEffect } from "react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSearchProps {
  onSelect: (lat: number, lon: number, displayName: string) => void;
}

const DashboardAddressSearch: React.FC<AddressSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query,
      )}`,
    )
      .then((res) => res.json())
      .then((data: Suggestion[]) => {
        setSuggestions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching suggestions:", err);
        setIsLoading(false);
      });
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    setQuery("");
    setSuggestions([]);

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    console.log("DashboardAddressSearch - Selected:", {
      lat,
      lon,
      displayName: suggestion.display_name,
    });
    onSelect(lat, lon, suggestion.display_name);
  };

  return (
    <div className="w-full max-w-2xl">
      <input
        type="text"
        placeholder="Search for an address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border p-2"
      />
      {isLoading && <div className="mt-2">Loading...</div>}
      {suggestions.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border bg-white">
          {suggestions.map((sug, index) => (
            <li
              key={index}
              className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-gray-100"
              onClick={() => handleSelect(sug)}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardAddressSearch;
