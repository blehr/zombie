export default loadData = () => {
  return Promise.all([
    d3.json("ohio.json"),
    d3.json("ohio-counties.json"),
    d3.json("zombie-geo.json")
  ]).then(([collection, counties, zombies]) => {
    return {
      collection,
      counties,
      zombies
    };
  });
};
