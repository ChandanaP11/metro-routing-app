// Import required modules
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs  from "fs";
import connetDB from "./config/db.mjs";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Create the app
const app = express();
app.use(bodyParser.json());
app.use(cors());
connetDB()

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// API: Register User
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username or password is empty
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password cannot be empty.",
      });
    }
    const usernameRegex = /^(?=.*[a-zA-Z])[A-Za-z\d]{3,}$/;

if (!usernameRegex.test(username)) {
  return res.status(400).json({
    message: "Username must be at least 3 characters long and contain at least one alphabet character",
  });
}


    // Validate password rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
  });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Save user to database
    const user = new User({ username, password }); // No hashing for password
    await user.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// API: Login User
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username){
      return res.status(400).json({
        message: "Username cannot be empty.",
      });}

      if (!password){
        return res.status(400).json({
          message: "Password cannot be empty.",
        });}

    // Check if username or password is empty
    if (!username && !password) {
      return res.status(400).json({
        message: "Username and password cannot be empty.",
      });
    }
    const usernameRegex = /^(?=.*[a-zA-Z])[A-Za-z\d]{3,}$/;

if (!usernameRegex.test(username)) {
  return res.status(400).json({
    message: "Username must be at least 3 characters long and contain at least one alphabet character",
  });
}


    // Validate password rules
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
  });
}


    // Find user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "User not registered." });
    }

    // Compare passwords (no hashing)
    if (password !== user.password) {
      return res.status(401).json({ message: "Password not matching." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, "your_secret_key", {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful.", token });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});




let stations = [];
let lines = [];

// Load GeoJSON data
fs.readFile("./metro-lines-stations.geojson", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading GeoJSON file:", err);
    return;
  }

  const geojson = JSON.parse(data);

  // Extract stations
  stations = geojson.features
    .filter((feature) => feature.geometry.type === "Point")
    .map((feature) => ({
      name: feature.properties.Name,
      coordinates: feature.geometry.coordinates,
    }));

  // Extract metro lines
  lines = geojson.features
    .filter((feature) => feature.geometry.type === "LineString")
    .map((feature) => ({
      name: feature.properties.Name,
      geometry: feature.geometry,
    }));

});

// API: Get list of stations
app.get("/stations", (req, res) => {
  const stationNames = stations.map((station) => station.name);
  res.json(stationNames);
});

// Fare calculation based on distance
function calculateFare(distance) {
  if (distance <= 2) return 10;
  if (distance <= 4) return 15;
  if (distance <= 6) return 20;
  if (distance <= 8) return 25;
  if (distance <= 10) return 30;
  if (distance <= 15) return 40;
  if (distance <= 20) return 50;
  return 60; // Maximum fare for distances > 25 km
}




// API: Calculate Fare
app.post("/calculate", (req, res) => {
  const { source, destination } = req.body;

  const sourceStation = stations.find((station) => station.name === source);
  const destinationStation = stations.find((station) => station.name === destination);

  if (!sourceStation || !destinationStation) {
    return res.status(400).json({ message: "Invalid stations." });
  }

  // Calculate Euclidean distance between source and destination
  const [x1, y1] = sourceStation.coordinates;
  const [x2, y2] = destinationStation.coordinates;
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 111; // Convert degrees to km

  const fare = calculateFare(distance);

  res.json({
    fare,
    distance: distance.toFixed(2), // Show up to 2 decimal places
    route: `${source} → ${destination}`,
  });
});

async function loadStations() {
  try {
    const response = await fetch('http://localhost:3000/stations'); // Backend API endpoint
    const stationNames = await response.json();

    // Sort station names alphabetically
    stationNames.sort();

    // Populate the source and destination dropdowns
    const sourceDropdown = document.getElementById('source');
    const destinationDropdown = document.getElementById('destination');

    stationNames.forEach(station => {
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
async function calc() {
  const source = document.getElementById('source').value;
  const destination = document.getElementById('destination').value;

  if (!source || !destination) {
    alert('Please select both source and destination stations.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source, destination }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        `Fare: ₹${result.fare}\nDistance: ${result.distance} km\nRoute: ${result.route}`
      );
    } else {
      alert(result.message || 'Error calculating fare.');
    }
  } catch (error) {
    console.error('Error calculating fare:', error);
  }
}


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});