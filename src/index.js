import * as d3 from 'd3';
import * as topojson from 'topojson-client'
import moment from 'moment'
import './index.css'


// Import images directly that got missed via the CSS imports above.
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';

// Import JS from Leaflet and plugins.
import 'leaflet/dist/leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';


const bounds = [[38.403202, -84.820159], [41.977523, -80.518693]];

const map = L.map("map", {
  maxBounds: bounds,
  center: [0, 0],
  zoom: 0
}).fitBounds(bounds);

map.addLayer(
  new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
);

// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
// 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
// 	maxZoom: 18,
// 	id: 'mapbox.streets',
// 	accessToken: 'pk.eyJ1IjoiYmxlaHIiLCJhIjoiY2swNWE2NTltMDMxYjNkcDNwbHV2ZjRxbiJ9.1hhUy1-LDu0V0Yj1kPfYVw'
// }).addTo(mymap);

Promise.all([
  d3.json("json/ohio.json"),
  d3.json("json/ohio-counties.json"),
  d3.json("json/zombie-geo.json")
]).then(([collection, counties, zombies]) => {
  var countyjson;

  // console.log(collection, counties, zombies);

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
    countyjson.resetStyle(e.target);
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

  L.geoJson(collection, {
    style
  }).addTo(map);

  countyjson = L.geoJson(
    topojson.feature(counties, counties.objects.cb_2015_ohio_county_20m)
      .features,
    { style, onEachFeature }
  ).addTo(map);

  // create legend
  const svgLegend = d3.select("#legend").append("svg");

  var legendMargin = { top: 20, right: 20, bottom: 20, left: 20 },
    legendWidth = 380 - legendMargin.left - legendMargin.right,
    legendHeight = 500 - legendMargin.top - legendMargin.bottom;

  const legendG = svgLegend
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .append("g")
    .attr(
      "transform",
      "translate(" + legendMargin.left + "," + legendMargin.top + ")"
    );

  const createLegend = items => {
    legendG.selectAll("g").remove();
    const sorted = items.sort(
      (a, b) =>
        b.properties.current_number_infected -
        a.properties.current_number_infected
    );
    sorted.forEach((d, i) => {
      legendG
        .append("g")
        .attr("class", "legend-g")
        .attr("transform", `translate(0, ${i * 20})`)
        .append("text")
        .text(
          `Number Infected: ${d.properties.current_number_infected}, ${d.properties.location_name}`
        );
    });
  };

  // BRUSH AND SCALES

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

  // console.log(initialExtent);

  var x = d3
    .scaleUtc()
    .domain(initialExtent)
    .range([0, width]);

  const axisG = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const rangeTitle = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")")
    .append("text");

  const setRangeTitleText = (start, end) => {
    const startMoment = moment.utc(start);
    const endMoment = moment.utc(end);
    if (startMoment.isSame(endMoment, "day")) {
      rangeTitle.text(
        `${startMoment.format("dddd MMM D, YYYY")}: ${startMoment.format(
          "h:mm a"
        )} - ${endMoment.format("h:mm a")}`
      );
    } else {
      rangeTitle.text(
        `2019   ${startMoment.format(
          "dddd MMM D h:mm a"
        )}  -  ${endMoment.format("dddd MMM D h:mm a")}`
      );
    }
  };

  axisG
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(10)
        .tickPadding(0)
    )
    .attr("text-anchor", null)
    .selectAll("text")
    .attr("x", -20)
    .attr("y", -20);

  const brush = d3
    .brushX()
    .extent([[0, 0], [width, height]])
    .on("brush", brushended);

  const brushG = axisG
    .append("g")
    .attr("class", "brush")
    .call(brush);

  // sets the initial brush
  brushG.call(brush.move, initialExtent.map(x));

  // removes crosshair cursor can't create a new brush
  d3.selectAll(".brush>.overlay").remove();

  // removes crosshair cursor can't create a new brush
  d3.selectAll(".brush>.handle--w").remove();


  function brushended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    var d0 = d3.event.selection.map(x.invert),
      d1 = d0.map(Math.round);
    // If empty when rounded, use floor & ceil instead.
    if (d1[0] >= d1[1]) {
      d1[0] = Math.floor(d0[0]);
      d1[1] = d1[0] + 1;
    }

    setRangeTitleText(d1[0], d1[1]);
    updateMarkersForBrush(d1[0], d1[1]);
   
    // rest brush handle location
    brushHandle
      .attr("display", null)
      .attr(
        "transform",
        "translate(" + [d3.event.selection[1], -height / 4] + ")"
      );
  }

  var brushResizePath = function(d) {
    var e = +(d.type == "e");
    const x = e ? 1 : -1;
    const y = height / 2;
    return (
      "M" +
      0.5 * x +
      "," +
      y +
      "A6,6 0 0 " +
      e +
      " " +
      6.5 * x +
      "," +
      (y + 6) +
      "V" +
      (2 * y - 6) +
      "A6,6 0 0 " +
      e +
      " " +
      0.5 * x +
      "," +
      2 * y +
      "Z" +
      "M" +
      2.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8) +
      "M" +
      4.5 * x +
      "," +
      (y + 8) +
      "V" +
      (2 * y - 8)
    );
  };

  const brushHandle = brushG
    .selectAll(".handle--custom")
    .data([{ type: "e" }])
    .join(enter =>
      enter
        .append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath)
    );

  // this sets the brush handle with the initial selection from the brush move call
  brushHandle
    .attr("display", null)
    .attr(
      "transform",
      "translate(" + [initialExtent.map(x)[1], -height / 4] + ")"
    );

  // markers and groups

  const getFilteredMarkers = (start, end) => {
    let timeFiltered;
    if (start && end) {
      timeFiltered = zombies.features.filter(d => {
        return d.properties.timestamp >= start && d.properties.timestamp <= end;
      });
    } else {
      timeFiltered = zombies.features;
    }

    const filteredMarkersObj = timeFiltered.reduce((acc, curr) => {
      const name = curr.properties.location_name;

      if (acc[name]) {
        const original = acc[name];
        if (curr.properties.timestamp > original.properties.timestamp) {
          acc[name] = curr;
        }
      } else {
        acc[name] = curr;
      }
      return acc;
    }, {});

    return Object.values(filteredMarkersObj);
  };

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
    // map.removeLayer(layer_group);

    map.removeLayer(markerClusters);

    markerClusters = new L.MarkerClusterGroup();

    const initial = getFilteredMarkers(start, end);
    rScale.domain(createRScaleDomain(initial));
    createLegend(initial);

    initial.forEach(m => {
      const popup = `${m.properties.location_name}: Number Infected: ${m.properties.current_number_infected}`;

      const marker = L.marker(
        [m.geometry.coordinates[1], m.geometry.coordinates[0], true],
        { icon: createIcon(m) }
      ).bindPopup(`${popup}`, { offset: [6, 7] });

      markerClusters.addLayer(marker);
    });
    map.addLayer(markerClusters);
    // layer_group = L.geoJson(initial, {
    //   onEachFeature: (feature, layer) => {
    //     layer.bindPopup(
    //       `${feature.properties.location_name}: Number Infected: ${feature.properties.current_number_infected}`
    //     );
    //   }
    // }).addTo(map);
  };

  const addInitialMarkers = () => {
    const initial = getFilteredMarkers();
    rScale.domain(createRScaleDomain(initial));
    createLegend(initial);
    markerClusters = L.markerClusterGroup();

    initial.forEach(m => {
      const popup = `${m.properties.location_name}: Number Infected: ${m.properties.current_number_infected}`;

      const marker = L.marker(
        [m.geometry.coordinates[1], m.geometry.coordinates[0]],
        { icon: createIcon(m) }
      ).bindPopup(String(popup), { offset: [6, 7] });

      markerClusters.addLayer(marker);
    });

    map.addLayer(markerClusters);

    // layer_group = L.geoJson(initial, {
    //   onEachFeature: (feature, layer) => {
    //     layer.bindPopup(
    //       `${feature.properties.location_name}: Number Infected: ${feature.properties.current_number_infected}`
    //     );
    //   }
    // }).addTo(map);
  };

  setRangeTitleText(initialExtent[0], initialExtent[1]);
  addInitialMarkers();

  // var markerClusters = L.markerClusterGroup();

  // filterMarkers();

  // filteredMarkers.forEach(m => {
  //   const popup = m.name;

  //   const marker = L.marker([m.lat, m.lng]).bindPopup(popup);

  //   markerClusters.addLayer(marker);
  // });

  // map.addLayer(markerClusters);

  // console.log("Friday June 7, 2019 12:00 am ", new Date(Date.UTC(2019, 5, 7, 00, 00)).getTime())
  // console.log("Friday June 7, 2019 1:00 am ", new Date(Date.UTC(2019, 5, 7, 01, 00)).getTime())
  // console.log("Friday June 7, 2019 2:00 am ", new Date(Date.UTC(2019, 5, 7, 02, 00)).getTime())
  // console.log("Friday June 7, 2019 4:00 am ", new Date(Date.UTC(2019, 5, 7, 04, 00)).getTime())
  // console.log("Friday June 7, 2019 6:00 am ", new Date(Date.UTC(2019, 5, 7, 06, 00)).getTime())
  // console.log("Friday June 7, 2019 8:00 am ", new Date(Date.UTC(2019, 5, 7, 08, 00)).getTime())
  // console.log("Friday June 7, 2019 10:00 am ", new Date(Date.UTC(2019, 5, 7, 10, 00)).getTime())
  // console.log("Friday June 7, 2019 12:00 pm ", new Date(Date.UTC(2019, 5, 7, 12, 00)).getTime())
  // console.log("Friday June 7, 2019 2:00 pm ", new Date(Date.UTC(2019, 5, 7, 14, 00)).getTime())
  // console.log("Friday June 7, 2019 4:00 pm ", new Date(Date.UTC(2019, 5, 7, 16, 00)).getTime())
  // console.log("Friday June 7, 2019 6:00 pm ", new Date(Date.UTC(2019, 5, 7, 18, 00)).getTime())
  // console.log("Friday June 7, 2019 8:00 pm ", new Date(Date.UTC(2019, 5, 7, 20, 00)).getTime())
  // console.log("Friday June 7, 2019 10:00 pm ", new Date(Date.UTC(2019, 5, 7, 22, 00)).getTime())
  // console.log("Friday June 7, 2019 11:00 pm ", new Date(Date.UTC(2019, 5, 7, 23, 00)).getTime())

  // Friday June 7, 2019 12:00 am  1559865600000
  // Friday June 7, 2019 1:00 am  1559869200000
  // Friday June 7, 2019 2:00 am  1559872800000
  // Friday June 7, 2019 4:00 am  1559880000000
  // Friday June 7, 2019 6:00 am  1559887200000
  // Friday June 7, 2019 8:00 am  1559894400000
  // Friday June 7, 2019 10:00 am  1559901600000
  // Friday June 7, 2019 12:00 pm  1559908800000
  // Friday June 7, 2019 2:00 pm  1559916000000
  // Friday June 7, 2019 4:00 pm  1559923200000
  // Friday June 7, 2019 6:00 pm  1559930400000
  // Friday June 7, 2019 8:00 pm  1559937600000
  // Friday June 7, 2019 10:00 pm  1559944800000
  // Friday June 7, 2019 11:00 pm  1559948400000
});
