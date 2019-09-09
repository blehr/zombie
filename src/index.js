import * as d3 from "d3";
import "./index.css";

import loadData from "./loadData";
import { addStateAndCountiesToMap } from "./add_state_and_counties";
import { renderMap } from "./render_map";
import { createLegend, updateLegend } from "./legend";
import {
  createXScale,
  createXAxisGroup,
  createRangeTitle,
  setRangeTitleText,
  appendXAxis,
  createBrush
} from "./brush";
import { getFilteredMarkers } from "./helpers";

// Import images directly that got missed via the CSS imports above.
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";

// Import JS from Leaflet and plugins.
import "leaflet/dist/leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster";

// bounds for state of Ohio
const bounds = [[38.403202, -84.820159], [41.977523, -80.518693]];
let ohio, counties, zombies, legendG, x, axisG, rangeTitle, brush, brushHandle, features;

let map = renderMap(bounds);

loadData().then(res => {
  console.log(res.zombies)
  ohio = res.ohio;
  counties = res.counties;
  zombies = res.zombies;

  render(map, ohio, counties, zombies);
});

const render = (map, ohio, counties, zombies) => {
  addStateAndCountiesToMap(map, ohio, counties);

  // create legend get selection for update
  legendG = createLegend();

  const svg = d3.select("#overlay").append("svg");

  var margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 700 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  const initialExtent = d3.extent(
    zombies.features.map(d => {
      const dateTime = new Date(d.properties.timestamp);
      return dateTime;
    })
  );

  x = createXScale(initialExtent, width);

  axisG = createXAxisGroup(svg, width, height, margin, map);

  rangeTitle = createRangeTitle(svg, margin);

  appendXAxis(axisG, x, height);

  const brushed = () => {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    var d0 = d3.event.selection.map(x.invert),
      d1 = d0.map(Math.round);
    // If empty when rounded, use floor & ceil instead.
    if (d1[0] >= d1[1]) {
      d1[0] = Math.floor(d0[0]);
      d1[1] = d1[0] + 1;
    }
    setRangeTitleText(rangeTitle, d1[0], d1[1]);
    updateMarkersForBrush(d1[0], d1[1]);

    // rest brush handle location
    brushHandle
      .attr("display", null)
      .attr(
        "transform",
        "translate(" + [d3.event.selection[1], -height / 4] + ")"
      );

      // map.fitBounds(features)
  };

  [brush, brushHandle] = createBrush(
    axisG,
    width,
    height,
    initialExtent,
    x,
    brushed
  );

  function legendClick(d) {
    // create a reversed copy of the coordinates so we don't modify the in memory object
    const latLng = [...d.geometry.coordinates].reverse();
    map.flyTo(latLng, 15);
  }
 

  const createRScaleDomain = items => {
    return d3.extent(items.map(d => d.properties.current_number_infected));
  };
  const rScale = d3.scaleSqrt().range([6, 12]);

  const createIcon = d => {
    return L.divIcon({
      className: "my-div-icon",
      html: `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle class="circle-marker" cy="12" cx="12" r="${rScale(
        d.properties.current_number_infected
      )}" ><animate attributeType="SVG" attributeName="r" begin="0s" dur="1.5s" repeatCount="indefinite" from="4" to="${rScale(
        d.properties.current_number_infected
      )}"/>
    <animate attributeType="CSS" attributeName="stroke-width" begin="0s"  dur="1.5s" repeatCount="indefinite" from="1" to="0" />
    <animate attributeType="CSS" attributeName="opacity" begin="0s"  dur="1.5s" repeatCount="indefinite" from="1" to="0.1"/>
  </circle>
</svg></circle></svg>`
    });
  };

  let markerClusters;

  const updateMarkersForBrush = (start, end) => {
    map.removeLayer(markerClusters);

    markerClusters = new L.MarkerClusterGroup({animateAddingMarkers: true});

    features = getFilteredMarkers(start, end, zombies);
    rScale.domain(createRScaleDomain(features));
    updateLegend(legendG, features, legendClick);

    features.forEach(m => {
      const popup = `${m.properties.location_name}: Number Infected: ${m.properties.current_number_infected}`;

      const marker = L.marker(
        [m.geometry.coordinates[1], m.geometry.coordinates[0], true],
        { icon: createIcon(m) }
      ).bindPopup(`${popup}`, { offset: [6, 7] });

      markerClusters.addLayer(marker);
    });
    map.addLayer(markerClusters);
    // map.fitBounds(markerClusters.getBounds())
  };

  const addInitialMarkers = () => {
    const initial = getFilteredMarkers(null, null, zombies);
    rScale.domain(createRScaleDomain(initial));
    updateLegend(legendG, initial, legendClick);
    markerClusters = L.markerClusterGroup({animateAddingMarkers: true});

    initial.forEach(m => {
      const popup = `${m.properties.location_name}: Number Infected: ${m.properties.current_number_infected}`;

      const marker = L.marker(
        [m.geometry.coordinates[1], m.geometry.coordinates[0]],
        { icon: createIcon(m) }
      ).bindPopup(String(popup), { offset: [6, 7] });

      markerClusters.addLayer(marker);
    });

    map.addLayer(markerClusters);
    map.fitBounds(markerClusters.getBounds())
  };

  

  // for initial display
  setRangeTitleText(rangeTitle, initialExtent[0], initialExtent[1]);
  addInitialMarkers();

  
};
