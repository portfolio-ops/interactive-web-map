// Initialize the map
const map = L.map('map').setView([37.77, -122.42], 12);

// Add a base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load crime data
let crimeData;
fetch('data/crime_data.geojson')
  .then(response => response.json())
  .then(data => {
    crimeData = data;
    updateMap(crimeData);
  });

// Function to update the map based on filters
function updateMap(data) {
  // Clear existing layers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.HeatLayer) {
      map.removeLayer(layer);
    }
  });

  // Add markers for each crime
  data.features.forEach(feature => {
    const { coordinates } = feature.geometry;
    const { crime_type } = feature.properties;
    L.marker([coordinates[1], coordinates[0]])
      .bindPopup(`Crime: ${crime_type}`)
      .addTo(map);
  });

  // Add heatmap
  const heatmapData = data.features.map(feature => [
    feature.geometry.coordinates[1],
    feature.geometry.coordinates[0],
    0.5 // Intensity
  ]);
  L.heatLayer(heatmapData, { radius: 25 }).addTo(map);
}

// Filter functionality
document.getElementById('apply-filters').addEventListener('click', () => {
  const crimeType = document.getElementById('crime-type').value;
  const dateRange = document.getElementById('date-range').value;

  const filteredData = {
    ...crimeData,
    features: crimeData.features.filter(feature => {
      const matchesCrimeType = crimeType === 'all' || feature.properties.crime_type === crimeType;
      const matchesDate = !dateRange || feature.properties.date === dateRange;
      return matchesCrimeType && matchesDate;
    })
  };

  updateMap(filteredData);
});
