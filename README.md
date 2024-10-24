# Hydrosense API

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Hydrosense API is a backend application developed with Node.js and Express that facilitates the management and storage of real-time sensor data using Firebase and Firestore. This API is designed to receive sensor data, validate the information, authenticate users, and securely store the data in firestore database.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Welcome Route `/`](#welcome-route-)
  - [Data Route `/data`](#data-route-data)
    - [GET `/data`](#get-data)
    - [POST `/data`](#post-data)
- [Validation and Security](#validation-and-security)
- [Error Handling](#error-handling)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:** Verifies UID using Firebase Authentication.
- **Data Storage:** Inserts sensor data into Firestore under user-specific collections.
- **Data Validation:** Comprehensive validation of incoming data to ensure integrity.
- **CORS Support:** Allows requests from different origins.
- **EJS Templating Engine:** Renders dynamic views.
- **Environment Variable Configuration:** Enables secure and flexible configuration.

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express:** Minimalist web framework for Node.js.
- **Firebase Admin SDK:** Manages authentication and Firestore access.
- **Firestore:** Firebase's NoSQL database for data storage.
- **EJS:** Templating engine for rendering views.
- **dotenv:** Manages environment variables.
- **cors:** Middleware to enable CORS.
- **path:** Node.js module for handling file paths.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/VicentCodes/HydroSenseApi.git
   cd hydrosense-api
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed.

   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables:**

   Create a `.env` file in the root of the project and add the following variables:

   ```env
   PORT=3000
   ```

   You can adjust the port as needed.

2. **Firebase Credentials:**

   - Obtain the `serviceAccountKey.json` file from the Firebase console:
     - Navigate to **Project Settings** > **Service Accounts**.
     - Generate a new private key and download the JSON file.
   - Place the `serviceAccountKey.json` file in the root of the project.

3. **Directory Structure:**

   Ensure you have a `views` folder in the root of the project containing the `index.ejs` file.

## Project Structure

```
hydrosense-api/
├── fire.js
├── package.json
├── package-lock.json
├── serviceAccountKey.json
├── .env
├── views/
│   └── index.ejs
└── server.js
```

- **server.js:** Main file that configures and runs the Express server.
- **fire.js:** Firebase Firestore configuration.
- **views/index.ejs:** EJS template for the welcome route.
- **serviceAccountKey.json:** Firebase credentials.
- **.env:** Environment variables.

## API Endpoints

### Welcome Route `/`

**Method:** GET

**Description:** Renders the welcome page using the `index.ejs` template.

**Response:**

- **Status 200:** Successfully rendered page.

### Data Route `/data`

Supports both **GET** and **POST** methods for handling sensor data.

#### GET `/data`

**Description:** Allows insertion of sensor data through query parameters.

**Query Parameters:**

- `temp` (required): Temperature.
- `TDS` (required): Total Dissolved Solids.
- `pH` (required): pH level.
- `UID` (required): Unique user identifier.
- `ORP` (optional): Oxidation-Reduction Potential.
- `TUR` (optional): Turbidity.

**Response:**

- **Status 200:** Data successfully inserted.
- **Status 400:** Invalid or missing request data.
- **Status 404:** UID does not exist.
- **Status 500:** Internal server error.

**Example Request:**

```
GET http://localhost:3000/data?temp=25&TDS=500&pH=7.0&UID=user123&ORP=300&TUR=5
```

#### POST `/data`

**Description:** Allows insertion of sensor data through the request body.

**Request Body (JSON):**

- `temp` (string, required): Temperature.
- `TDS` (string, required): Total Dissolved Solids.
- `pH` (string, required): pH level.
- `UID` (string, required): Unique user identifier.
- `ORP` (string, required): Oxidation-Reduction Potential.
- `TUR` (string, required): Turbidity.

**Response:**

- **Status 200:** Data successfully inserted.
- **Status 400:** Invalid or missing request data.
- **Status 404:** UID does not exist.
- **Status 500:** Internal server error.

**Example Request:**

```json
POST http://localhost:3000/data
Content-Type: application/json

{
  "temp": "25",
  "TDS": "500",
  "pH": "7.0",
  "UID": "user123",
  "ORP": "300",
  "TUR": "5"
}
```

## Validation and Security

- **Data Validation:**
  - Ensures required fields (`temp`, `TDS`, `pH`, `UID`) are present.
  - Validates that `UID` is a non-empty string.
  - For requests requiring `ORP` and `TUR`, their presence is also validated.

- **User Authentication:**
  - Utilizes Firebase Authentication to verify the existence of `UID`.
  - The `verifyUID` middleware handles verification before processing POST requests to `/data`.

- **CORS:**
  - Implements CORS to allow requests from different origins, configured via the `cors()` middleware.

## Error Handling

- **Validation Errors:** Returns responses with status code 400 and descriptive messages.
- **Authentication Errors:** Returns responses with status code 404 if `UID` does not exist.
- **Server Errors:** Returns responses with status code 500 for unexpected failures during processing.
- **Logging:** Errors are logged to the console to facilitate debugging.

## Running the Application

1. **Start the Server:**

   ```bash
   npm start
   ```

   The server will run on the port specified in the `.env` file or default to port 3000.

2. **Access the Welcome Route:**

   Open your browser and navigate to `http://localhost:3000/` to view the welcome page.

3. **Send Requests to `/data`:**

   - **GET Request:**

     You can send a GET request with the necessary parameters in the URL.

     ```
     GET http://localhost:3000/data?temp=25&TDS=500&pH=7.0&UID=user123&ORP=300&TUR=5
     ```

   - **POST Request:**

     Send a POST request with a JSON body.

     ```json
     POST http://localhost:3000/data
     Content-Type: application/json

     {
       "temp": "25",
       "TDS": "500",
       "pH": "7.0",
       "UID": "user123",
       "ORP": "300",
       "TUR": "5"
     }
     ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

