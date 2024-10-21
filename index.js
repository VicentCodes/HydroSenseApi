// Server application for handling sensor data

// Import dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fire = require('./fire');
const serviceAccount = require('./serviceAccountKey.json');
const path = require('path'); // Added to work with file paths

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Firestore
const db = fire.firestore();
db.settings({ timestampsInSnapshots: true });

// Welcome route that renders index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

// GET /data - Retrieve sensor data based on filter and UID
app.post('/data', async (req, res) => {
  try {
    const { temp, TDS, pH, ORP, TUR, UID } = req.body;

    if (!temp || !TDS || !pH || !UID) {
      return res.status(400).send({ error: 'Missing values in the request body' });
    }

    if (typeof UID !== 'string' || UID.trim() === '') {
      return res.status(400).send({ error: 'Invalid UID' });
    }

    // Verify if the UID exists in Firebase Authentication
    try {
      await admin.auth().getUser(UID);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error('UID does not exist:', UID);
        return res.status(404).send({ error: 'UID does not exist' });
      } else {
        console.error('Error verifying UID:', error);
        return res.status(500).send({ error: 'Error verifying UID' });
      }
    }

    const timestamp = Date.now();

    const userRef = db.collection('hydrosense2').doc('users').collection(UID);
    const sensorData = {
      temp,
      tds: TDS,
      ph: pH,
      orp: ORP,
      tur: TUR,
      date: timestamp,
    };

    await userRef.add(sensorData);

    res.status(200).send({
      ...sensorData,
      status: 'Values inserted into the sensors collection.',
    });
  } catch (error) {
    console.error('Error inserting values:', error);
    res.status(500).send({ error: 'Error inserting values' });
  }
});
// POST /data - Insert new sensor data
app.post('/data', async (req, res) => {
  try {
    const { temp, TDS, pH, ORP, TUR, UID } = req.body;

    if (!temp || !TDS || !pH || !UID) {
      return res.status(400).send({ error: 'Missing values in the request body' });
    }

    if (typeof UID !== 'string' || UID.trim() === '') {
      return res.status(400).send({ error: 'Invalid UID' });
    }

    const timestamp = Date.now();

    const userRef = db.collection('hydrosense').doc('users').collection(UID);
    const sensorData = {
      temp,
      tds: TDS,
      ph: pH,
      orp: ORP,
      tur: TUR,
      date: timestamp,
    };

    await userRef.add(sensorData);

    res.status(200).send({
      ...sensorData,
      status: 'Values inserted into the sensors collection.',
    });
  } catch (error) {
    console.error('Error inserting values:', error);
    res.status(500).send({ error: 'Error inserting values' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
