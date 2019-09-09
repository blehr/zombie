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
  setupLegendToggle()
  return legendG;
};

const setupLegendToggle = () => {
  const legend = document.getElementById('legend')
  document.querySelector('.toggle-legend').addEventListener('click', function(e) {
    if (legend.classList.contains("show-legend")) {
      legend.classList.remove("show-legend");
      legend.classList.add("hide-legend")
      this.innerHTML = '<i class="fas fa-chevron-circle-right"></i>'
    } else {
      legend.classList.remove("hide-legend");
      legend.classList.add("show-legend")
      this.innerHTML = '<i class="fas fa-chevron-circle-left"></i>'
    }
  })
}

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
      .attr('x', 0)
      .attr('y', 0)
      .html(`<span xmlns="http://www.w3.org/1999/xhtml"><i class='fas fa-eye'></i> <span class="number-infected">${d.properties.current_number_infected}</span> : Infected - ${d.properties.location_name}</span>`)
      .on("click", () => legendClick(d))
  });
};

