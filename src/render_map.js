import * as d3 from "d3";
// Import JS from Leaflet and plugins.
import "leaflet/dist/leaflet";

export const renderMap = (bounds) => {
  const map = L.map("map", {
    maxBounds: bounds,
    center: [0, 0],
    zoom: 0,
    zoomControl:false
  }).fitBounds(bounds);

  map.addLayer(
    new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  );
  return map;
};