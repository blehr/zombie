const fs = require("fs");

const locations = [
  {
    location_name: "Bloomingburg Trailer Park",
    coordinates: [-83.394563, 39.610193]
  },
  {
    location_name: "Pettit's",
    coordinates: [-83.3975342, 39.6067609]
  },
  {
    location_name: "Walmart",
    coordinates: [-83.4581394, 39.5224967]
  },
  {
    location_name: "Kroger",
    coordinates: [-83.4481005, 39.5340456]
  },
  {
    location_name: "Jeffersonville Pool",
    coordinates: [-83.5700062, 39.6543082]
  },
  {
    location_name: "Flying J Travel Center",
    coordinates: [-83.5408617, 39.6462517]
  }
];



const generateRandomTimeStamp = () => {
  return new Date(
    Date.UTC(
      2019,
      5,
      7,
      Math.floor(Math.random() * 25),
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

console.log(zombieDataFeatures)
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
