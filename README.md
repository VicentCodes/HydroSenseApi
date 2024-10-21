# Hydrosense Project - API Server for Water Quality Monitoring

Welcome to the Hydrosense project! This is a backend server developed using Node.js and Express that enables the insertion and retrieval of sensor data for monitoring water quality. It leverages Firebase for authentication and data storage, ensuring security and scalability.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Secure Authentication**: User verification through Firebase Authentication.
- **Real-time Data Storage**: Sensor data stored in Firebase Firestore with timestamps.
- **RESTful API**: Endpoints for inserting and retrieving sensor data.
- **View Engine**: Uses EJS for dynamic view rendering.
- **Environmental Configuration**: Environment variables managed with dotenv.
- **Middleware**: Utilizes CORS and body-parser for HTTP request handling.

## Technologies Used

- Node.js
- Express.js
- Firebase (Firestore and Authentication)
- EJS (Embedded JavaScript templates)
- Dotenv
- Cors
- Body-parser

## Installation

### Prerequisites

- Node.js (version 12 or higher)
- NPM (Node Package Manager)
- Firebase account with a configured project
- `serviceAccountKey.json` file downloaded from Firebase Console

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your_username/hydrosense.git
   cd hydrosense
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Add Firebase Credentials**

   Place the `serviceAccountKey.json` file in the root directory of the project.

4. **Configure Environment Variables**

   Create a `.env` file in the root directory with the following content:

   ```env
   PORT=3000
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Configuration

Ensure all the fields in the `.env` file are correctly set with the values provided by Firebase.

## Usage

### Start the Server

```bash
npm start
```

The server will run at `http://localhost:3000`.

### Access the Home Page

Open your browser and navigate to `http://localhost:3000` to view the page rendered with EJS.

## API Endpoints

### POST `/data`

Inserts new sensor data into the database.

#### Request Body Parameters (JSON)

- `temp` (string): Temperature (required)
- `TDS` (string): Total Dissolved Solids (required)
- `pH` (string): pH level (required)
- `ORP` (string): Oxidation-Reduction Potential (required)
- `TUR` (string): Turbidity (required)
- `UID` (string): Unique User Identifier (required)

#### Example Request

```json
{
  "temp": "25",
  "TDS": "500",
  "pH": "7",
  "ORP": "650",
  "TUR": "5",
  "UID": "user123"
}
```

#### Responses

- **200 OK**: Data inserted successfully.
- **400 Bad Request**: Missing values or invalid UID.
- **404 Not Found**: UID does not exist in Firebase Authentication.
- **500 Internal Server Error**: Server error while inserting data.

### GET `/data`

Retrieves sensor data based on filters and UID.

**Note**: Ensure you provide the necessary parameters in the request body.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
---