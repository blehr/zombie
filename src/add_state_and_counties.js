import * as d3 from "d3";
import * as topojson from "topojson-client";
// Import JS from Leaflet and plugins.
import "leaflet/dist/leaflet";

export const addStateAndCountiesToMap = (map, ohio, counties) => {
  var countyJson;

  function style(feature) {
    return {
      fillColor: "#ddd",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3"
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.01
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    countyJson.resetStyle(e.target);
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  L.geoJson(ohio, {
    style
  }).addTo(map);

  countyJson = L.geoJson(
    topojson.feature(counties, counties.objects.cb_2015_ohio_county_20m)
      .features,
    { style, onEachFeature }
  ).addTo(map);
};
