// Import dependencies
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const admin = require("firebase-admin");
const fire = require("./fire");
const serviceAccount = require("./serviceAccountKey.json");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore
const db = fire.firestore();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine and specify views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route that renders index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

/**
 * Helper function to validate request data
 * @param {Object} data - The request body or query parameters
 * @param {boolean} requireORP - Whether ORP is required
 * @param {boolean} requireTUR - Whether TUR is required
 * @returns {Object|null} - Returns an error object if validation fails, otherwise null
 */
const validateData = (data, requireORP = false, requireTUR = false) => {
  const { temp, TDS, pH, ORP, TUR, UID } = data;

  if (!temp || !TDS || !pH || !UID) {
    return { status: 400, message: "Missing required values in the request." };
  }

  if (typeof UID !== "string" || UID.trim() === "") {
    return { status: 400, message: "Invalid UID." };
  }

  if (requireORP && !ORP) {
    return { status: 400, message: "Missing ORP value in the request." };
  }

  if (requireTUR && !TUR) {
    return { status: 400, message: "Missing TUR value in the request." };
  }

  return null;
};

/**
 * Middleware to verify UID existence in Firebase Authentication
 */
const verifyUID = async (req, res, next) => {
  const { UID } = req.body;

  try {
    await admin.auth().getUser(UID);
    next();
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error("UID does not exist:", UID);
      return res.status(404).json({ error: "UID does not exist." });
    }
    console.error("Error verifying UID:", error);
    return res.status(500).json({ error: "Error verifying UID." });
  }
};

/**
 * Handler function to process /data requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {boolean} requireORPAndTUR - Whether ORP and TUR are required (for POST)
 */
const handleData = async (req, res, requireORPAndTUR) => {
  // Validate request data
  const validationError = validateData(req.body, requireORPAndTUR, requireORPAndTUR);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.message });
  }

  const { temp, TDS, pH, ORP, TUR, UID } = req.body;
  const timestamp = Date.now();

  const sensorData = {
    temp,
    tds: TDS,
    ph: pH,
    orp: ORP || null,
    tur: TUR || null,
    date: timestamp,
  };

  try {
    const userRef = db.collection("hydrosense").doc("users").collection(UID);
    await userRef.add(sensorData);

    res.status(200).json({
      ...sensorData,
      status: "Values inserted into the sensors collection.",
    });
  } catch (error) {
    console.error("Error inserting values:", error);
    res.status(500).json({ error: "Error inserting values." });
  }
};

/**
 * Route handler for /data supporting both GET and POST methods
 */
app.route("/data")
  .get(async (req, res) => {
    req.body = req.query;
    const validationError = validateData(req.body, false, false);
    if (validationError) {
      return res.status(validationError.status).json({ error: validationError.message });
    }

    try {
      await handleData(req, res, false);
    } catch (error) {
      console.error("Error handling GET /data:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  })
  .post(verifyUID, async (req, res) => {
    // For POST requests, data is expected in the request body
    await handleData(req, res, true);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
