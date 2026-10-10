

const BASE_URL = "http://localhost:3000";

function toggleForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
}

async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (response.ok) {
    alert(result.message);
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("metro-section").style.display = "block";
  } else {
    alert(result.message);
  }
}

async function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),

  });



  const result = await response.json();
  if (response.ok) {
    alert(result.message);
    toggleForms();
  } else {
    alert(result.message);
  }
}

window.onload = loadStations;

// Load and process the GeoJSON file to populate station names
async function loadStations() {
  try {
    const response = await fetch('metro-lines-stations.geojson');
    const geoJsonData = await response.json();

    // Extract station names from the GeoJSON
    const stations = geoJsonData.features.map(feature => feature.properties.name);

    // Sort station names alphabetically
    stations.sort();

    // Populate the source and destination dropdowns
    const sourceDropdown = document.getElementById('source');
    const destinationDropdown = document.getElementById('destination');

    stations.forEach(station => {
      const option1 = document.createElement('option');
      option1.value = station;
      option1.textContent = station;

      const option2 = option1.cloneNode(true);

      sourceDropdown.appendChild(option1);
      destinationDropdown.appendChild(option2);
    });
  } catch (error) {
    console.error('Error loading stations:', error);
  }
}
async function loadStations() {
  const response = await fetch(`${BASE_URL}/stations`);
  const stations = await response.json();

  const sourceDropdown = document.getElementById("source");
  const destinationDropdown = document.getElementById("destination");

  stations.forEach((station) => {
    const option = document.createElement("option");
    option.value = station;
    option.textContent = station;
    sourceDropdown.appendChild(option);
    destinationDropdown.appendChild(option.cloneNode(true));
  });
}

window.onload = loadStations;
// Find the shortest path using Dijkstra's algorithm
function findShortestPath(graph, start, end) {
  const distances = {};
  const previous = {};
  const queue = new Set(Object.keys(graph));

  // Initialize distances to infinity, except for the start station
  Object.keys(graph).forEach(station => {
    distances[station] = station === start ? 0 : Infinity;
    previous[station] = null;
  });

  while (queue.size) {
    // Find the station with the smallest distance
    const currentStation = Array.from(queue).reduce((minStation, station) =>
      distances[station] < distances[minStation] ? station : minStation
    );

    queue.delete(currentStation);

    // Stop if we've reached the destination
    if (currentStation === end) break;

    // Update distances to neighbors
    for (const [neighbor, distance] of Object.entries(graph[currentStation] || {})) {
      const alt = distances[currentStation] + distance;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentStation;
      }
    }
  }

  // Reconstruct the shortest path
  const path = [];
  for (let at = end; at; at = previous[at]) {
    path.unshift(at);
  }

  return path.length && path[0] === start ? path : null;
}



// Load stations on page load
window.onload = loadStations;

async function calculate() {
  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;

  if (!source || !destination) {
    alert("Please select both source and destination stations.");
    return;
  }

  const response = await fetch(`${BASE_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination }),
  });

  const result = await response.json();

  if (response.ok) {
    document.getElementById("fare").textContent = `₹${result.fare}`;
    document.getElementById("distance").textContent = `${result.distance} km`;
    document.getElementById("route").textContent = result.route;
  } else {
    alert(result.message);
  }
}


  function bookTicket() {
    const username = document.getElementById('login-username').value;
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;

    if (!username || !source || !destination ) {
      alert('Please ensure all details are filled and calculated.');
      return;
    }

    const message = `Dear ${username}, your ticket is booked.`;
    const proceed = confirm(message);

    if (proceed) {
      document.getElementById('metro-section').style.display = 'none';
      document.getElementById('ticket-page').style.display = 'block';

      document.getElementById('ticket-username').innerText = username;
      document.getElementById('ticket-source').innerText = source;
      document.getElementById('ticket-destination').innerText = destination;
    } else {
      document.getElementById('metro-section').style.display = 'block';
    }
  }

  


