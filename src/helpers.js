
export const getFilteredMarkers = (start, end, zombies) => {
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
      acc[name].properties.current_number_infected += 1 
    } else {
      acc[name] = curr;
      acc[name].properties.current_number_infected = 1
    }
    return acc;
  }, {});

  return Object.values(filteredMarkersObj);
};
