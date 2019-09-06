import * as d3 from "d3";
// Import JS from Leaflet and plugins.
import "leaflet/dist/leaflet";



export const createLegend = () => {
  // create legend
  const svgLegend = d3.select("#legend").append("svg");

  var legendMargin = { top: 20, right: 10, bottom: 20, left: 10 },
    legendWidth = 360 - legendMargin.left - legendMargin.right,
    legendHeight = 500 - legendMargin.top - legendMargin.bottom;

  const legendG = svgLegend
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .append("g")
    .attr(
      "transform",
      "translate(" + legendMargin.left + "," + legendMargin.top + ")"
    );

  return legendG;
};

export const updateLegend = (selection, items, legendClick) => {
  selection.selectAll("g").remove();
  const sorted = items.sort(
    (a, b) =>
      b.properties.current_number_infected -
      a.properties.current_number_infected
  );
  sorted.forEach((d, i) => {
    selection
      .append("g")
      .attr("class", "legend-g")
      .attr("transform", `translate(0, ${i * 25})`)
      .append("foreignObject")
      .attr("width", 320)
      .attr("height", 24)
      .html(`<i class='fas fa-eye'></i> <span><span class="number-infected">${d.properties.current_number_infected}</span> : Infected - ${d.properties.location_name}</span>`)
      // .append("text")
      // .text(
      //   ` Number Infected: ${d.properties.current_number_infected}, ${d.properties.location_name}`
      // )
      .on("click", () => legendClick(d))
  });
};

