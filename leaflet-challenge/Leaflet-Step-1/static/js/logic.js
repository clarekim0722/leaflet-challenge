const link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// GET request to the query URL
d3.json(link, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3> Where: " + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<br><h2> Magnitude: " + feature.properties.mag + "</h2>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  function createCircleMarker(feature,latlng){
    let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: .5,
        fillOpacity: 0.30
    }
    return L.circleMarker(latlng, options);
}
  
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
  });
  
  // Send earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Color circles based on mag
function chooseColor(mag) {
  switch(true) {
      case (-1.0 <= mag && mag <= 1.0):
        return "#DAF7A6";
      case (1.0 <= mag && mag <= 3.0):
        return "#FFC300";
      case (3.0 <= mag && mag <= 5.0):
        return "#FF5733";
      case (5.0 <= mag && mag <= 7.0):
        return "#C70039";
      case (7.0 <= mag && mag <= 9.0):
        return "#900C3F";
      default:
        return "#581845";
  }
}

let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [-1.0, 1.0, 3.0, 5.0, 7.0, 9.0],
        labels = [];

    // loop through density intervals
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

function createMap(earthquakes) {

  // Define outdoors and graymap layers
  let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v10",
    accessToken: API_KEY
  });

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetstylemap,
    "Gray Map": graymap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      39.5501 , -105.7821
    ],
    zoom: 5,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}