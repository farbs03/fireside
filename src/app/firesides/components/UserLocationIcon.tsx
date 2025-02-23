import L from "leaflet";

// red means owner
export const UserLocationIcon = new L.DivIcon({
html: `<div style="width: 26; height: 26; background-color: white; border-radius: 50%; display: grid; place-items: center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-person-standing"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg></div>`,
    className: "user-location-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});