const fs = require("fs");

const locations = [
  {
    location_name: "Bloomingburg Trailer Park",
    coordinates: [-83.394563, 39.610193]
  },
  {
    location_name: "Pettit's",
    coordinates: [-83.3969592, 39.606607]
  },
  {
    location_name: "Walmart",
    coordinates: [-83.4560865, 39.5225792]
  },
  {
    location_name: "Kroger",
    coordinates: [-83.4459818, 39.5342875]
  },
  {
    location_name: "Jeffersonville Pool",
    coordinates: [-83.5679579, 39.6543824]
  },
  {
    location_name: "Flying J Travel Center",
    coordinates: [-83.5388228,39.646335]
  }
];



const generateRandomTimeStamp = () => {
  return new Date(
    Date.UTC(
      2019,
      5,
      7,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 59)
    )
  ).getTime();
};

const zombieDataFeatures = locations.map((d, i) => {
  const numberOfCasesToCreate = Math.floor(Math.random() * 26);
  const locationFeatures = [];
  for (var i = 1; i <= numberOfCasesToCreate; i++) {
    locationFeatures.push({
      type: "Feature",
      properties: {
        location_name: d.location_name,
        timestamp: generateRandomTimeStamp()
      },
      geometry: {
        type: "Point",
        coordinates: d.coordinates
      }
    });
  }
  return locationFeatures;
});

let f = []
const features = zombieDataFeatures.forEach(d => {
  d.forEach(f1 => f.push(f1))
})

const format = {
  type: "FeatureCollection",
  features: f
};

let data = JSON.stringify(format);
fs.writeFileSync("created-zombie.json", data);
