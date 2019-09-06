
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
