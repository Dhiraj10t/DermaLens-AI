# SkinSight AI
A modern MERN stack application for dermatological analysis using Google Gemini and MediaPipe.

## Setup Instructions

### Backend Setup
1. Open a terminal and run:
`cd backend`
2. Install dependencies (if not already installed):
`npm install`
3. Duplicate `.env.example` to a new `.env` file, and fill in your Cloudinary API keys and Gemini API key. Ensure MongoDB is running locally on port 27017 or provide a MongoDB URI.
4. Start the server:
`npm run server`

### Frontend Setup
1. Open another terminal and run:
`cd frontend`
2. Install dependencies (if not already installed):
`npm install`
3. Start the dev server:
`npm run dev`

### Usage
- Open `http://localhost:5173` in your browser.
- Upload a facial image to start the analysis!
