// Import dependencies
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const admin = require("firebase-admin");
const fire = require("./fire");
const serviceAccount = require("./serviceAccount.js");
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
 * Helper function to validate request data for GET requests
 * @param {Object} data - The query parameters
 * @returns {Object|null} - Returns an error object if validation fails, otherwise null
 */

const validateGetData = (data) => {
  const { UID, filter } = data;

  if (!UID) {
    return { status: 400, message: "UID is required." };
  }

  if (typeof UID !== "string" || UID.trim() === "") {
    return { status: 400, message: "Invalid UID." };
  }

  const validFilters = ["top10", "1h", "2h", "4h", "8h", "12h", "24h", "*"];
  if (filter && !validFilters.includes(filter)) {
    return { status: 400, message: "Invalid filter value." };
  }

  return null;
};

/**
 * Middleware to verify UID existence in Firebase Authentication
 */

const verifyUID = async (req, res, next) => {
  const UID = req.body.UID || req.query.UID;

  if (!UID) {
    return res.status(400).json({ error: "UID is required." });
  }

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
 * Route handler for /data supporting both GET and POST methods
 */

app.route("/data")
  .get(verifyUID, async (req, res) => {
    const validationError = validateGetData(req.query);
    if (validationError) {
      return res.status(validationError.status).json({ error: validationError.message });
    }

    const { UID, filter } = req.query;

    // Fetch data from database
    try {
      const userRef = db.collection("hydrosense").doc("users").collection(UID);
      let query = userRef.orderBy("date", "desc");

      const now = Date.now();

      if (filter) {
        if (filter === "top10") {
          query = query.limit(10);
        } else if (filter !== "*") {
          const hoursMatch = filter.match(/^(\d+)h$/);
          if (hoursMatch) {
        const startTime = now - parseInt(hoursMatch[1]) * 60 * 60 * 1000;
        query = query.where("date", ">=", startTime);
          } else {
        return res.status(400).json({ error: "Invalid filter value." });
          }
        }
      } else {
        query = query.limit(100);
      }

      const snapshot = await query.get();
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({ data });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  })
  .post(verifyUID, async (req, res) => {
    // For POST requests, data is expected in the request body
    await handleData(req, res, true);
  });

/**
 * Handler function to process POST /data requests
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
 * Helper function to validate request data for POST requests
 * @param {Object} data - The request body
 * @param {boolean} requireORP - Whether ORP is required
 * @param {boolean} requireTUR - Whether TUR is required
 * @returns {Object|null} - Returns an error object if validation fails, otherwise null
 */

const validateData = (data, requireORP = false, requireTUR = false) => {
  const { temp, TDS, pH, ORP, TUR, UID } = data;

  if (!temp || !TDS || !pH || !UID || (requireORP && !ORP) || (requireTUR && !TUR)) {
    return { status: 400, message: "Missing required values in the request." };
  }

  if (typeof UID !== "string" || UID.trim() === "") {
    return { status: 400, message: "Invalid UID." };
  }

  return null;
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
