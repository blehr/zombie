import * as d3 from 'd3'

const loadData = () => {
  return Promise.all([
    d3.json("json/ohio.json"),
    d3.json("json/ohio-counties.json"),
    d3.json("json/created-zombie.json")
  ]).then(([ohio, counties, zombies]) => {
    return {
      ohio,
      counties,
      zombies
    };
  });
};

export default loadData;