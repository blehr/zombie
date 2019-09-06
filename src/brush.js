import * as d3 from "d3";
import moment from "moment";

var margin = { top: 20, right: 20, bottom: 20, left: 20 },
  width = 700 - margin.left - margin.right,
  height = 100 - margin.top - margin.bottom;

let x, rangeTitle, map;

export const createXScale = (initialExtent, width) => {
  x = d3
    .scaleUtc()
    .domain(initialExtent)
    .range([0, width]);

  return x;
};

export const createXAxisGroup = (selection, width, height, margin, m) => {
  m = map;
  const axisG = selection
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return axisG;
};

export const createRangeTitle = (selection, margin) => {
  rangeTitle = selection
    .append("g")
    .attr("transform", "translate(" + (width) / 2 + "," + margin.top / 2 + ")")
    .append("text")
    .attr("text-anchor", "middle")

  return rangeTitle;
};

export const setRangeTitleText = (selection, start, end) => {
  const startMoment = moment.utc(start);
  const endMoment = moment.utc(end);
  if (startMoment.isSame(endMoment, "day")) {
    selection.text(
      `${startMoment.format("dddd MMM D, YYYY")}: ${startMoment.format(
        "h:mm a"
      )} - ${endMoment.format("h:mm a")}`
    );
  } else {
    selection.text(
      `2019   ${startMoment.format("dddd MMM D h:mm a")}  -  ${endMoment.format(
        "dddd MMM D h:mm a"
      )}`
    );
  }
};

export const appendXAxis = (selection, x, height) => {
  selection
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
    .attr("y", 10);
};

export const createBrush = (
  selection,
  width,
  height,
  initialExtent,
  x,
  callback
) => {
  const brush = d3
    .brushX()
    .extent([[0, 0], [width, height]])
    .on("brush", callback);

  const brushG = selection
    .append("g")
    .attr("class", "brush")
    .call(brush);

  // sets the initial brush
  brushG.call(brush.move, initialExtent.map(x));

  // removes crosshair cursor can't create a new brush
  d3.selectAll(".brush>.overlay").remove();

  // removes crosshair cursor can't create a new brush
  d3.selectAll(".brush>.handle--w").remove();

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

  return [brush, brushHandle];
};

export const brushResizePath = function(d) {
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
