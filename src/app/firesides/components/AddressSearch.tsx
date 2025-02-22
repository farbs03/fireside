"use client";

import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const AddressSearch: React.FC = () => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only search if query is at least 3 characters
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Fetch suggestions from Nominatim
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
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
    // Update the input field and clear suggestions
    setQuery(suggestion.display_name);
    setSuggestions([]);

    // Parse coordinates and pan the map to the selected location
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    map.setView([lat, lon], 13);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1000,
        background: "white",
        padding: "5px",
        borderRadius: "4px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      <input
        type="text"
        placeholder="Search for an address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "300px", padding: "5px" }}
      />
      {isLoading && <div>Loading...</div>}
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: "0",
            margin: "5px 0 0 0",
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
          }}
        >
          {suggestions.map((sug, index) => (
            <li
              key={index}
              style={{
                padding: "5px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
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

export default AddressSearch;
