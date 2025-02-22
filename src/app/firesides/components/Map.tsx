"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Navbar from "~/components/navbar"; // Adjust if necessary
import GeocoderControl from "./GeocoderControl"; // Existing geocoder control (optional)
import AddressSearch from "./AddressSearch"; // New autocomplete search

export default function Map() {
  const position: [number, number] = [34.0549, -118.2451];

  useEffect(() => {
    return () => {
      const containers = document.querySelectorAll(".leaflet-container");
      containers.forEach((container) => {
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }
      });
    };
  }, []);

  return (
    <div>
      <Navbar />
      <MapContainer
        id="map"
        center={position}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "1000px", width: "100%" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        {/* Optionally include the basic geocoder control */}
        <GeocoderControl />
        {/* Include the new autocomplete search */}
        <AddressSearch />
      </MapContainer>
    </div>
  );
}
