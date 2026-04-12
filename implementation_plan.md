# SkinSight AI Implementation Plan

Provide a complete production-ready MERN stack web application called **SkinSight AI** that analyzes facial skin conditions from uploaded photos.

## Goal Description
Build a facial skin analysis web app using React (Vite) and TailwindCSS on the frontend, and Node.js with Express and MongoDB on the backend. It will integrate with Cloudinary for image storage, Google Gemini Vision API for skin condition analysis, and MediaPipe for facial mesh rendering.

## User Review Required
> [!IMPORTANT]
> The backend requires external API keys for Cloudinary, MongoDB, and Google Gemini API. I will set up the `.env.example` templates, but you will need to provide valid API keys in `.env` files for the app to fully function!
> I'll create a local environment ready for you to configure. For MongoDB, I can use a local connection URI (`mongodb://localhost:27017/skinsight`) to start, but you can change it to a Mongo Atlas URI if preferred. 

## Proposed Changes

We will separate the project into a `frontend/` folder and `backend/` folder inside the workspace.

### Backend Infrastructure
We will initialize a Node.js project in the `backend/` directory with Express, Mongoose, Cloudinary, Multer, and the Google Gen AI SDK.

#### [NEW] `backend/package.json`
Dependencies: `express`, `mongoose`, `cors`, `dotenv`, `cloudinary`, `multer`, `multer-storage-cloudinary`, `@google/generative-ai`

#### [NEW] `backend/server.js`
The main Express application file configuring middleware (CORS, JSON), connecting to MongoDB, and setting up the API routes.

#### [NEW] `backend/models/Scan.js`
Mongoose model for `Scan` containing fields:
- `userId`
- `imageUrl`
- `acneSeverity`
- `lesionCount`
- `pigmentationLevel`
- `zones`
- `recommendations`
- `createdAt`

*Note: Since standard user authentication is not defined, we'll use a mocked `userId` for demonstration or standard guest usage for the tracking.*

#### [NEW] `backend/routes/api.js`
Setting up backend endpoints:
- `POST /api/analyze` - receives uploaded image, uploads it to Cloudinary, calls Gemini Vision API, and returns structured JSON analysis.
- `GET /api/scans` - return all scans.
- `POST /api/scans` - save analysis result to MongoDB.

### Frontend Infrastructure
We will initialize a React project using Vite in the `frontend/` directory with TailwindCSS, Context API (for state), React Router, Chart.js, and MediaPipe (@mediapipe/face_mesh).

#### [NEW] `frontend/package.json`
Dependencies: `react`, `react-router-dom`, `tailwindcss`, `chart.js`, `react-chartjs-2`, `@mediapipe/face_mesh`, `@mediapipe/camera_utils` (if needed for camera), `lucide-react` (for icons).

#### [NEW] `frontend/src/main.jsx` & `frontend/src/App.jsx`
Routing setup with Pages: Home, Scan, Dashboard.

#### [NEW] `frontend/src/pages/Home.jsx`
Landing page introducing the SkinSight AI capabilities with a sleek modern design.

#### [NEW] `frontend/src/pages/Scan.jsx`
Main functionality page accommodating:
- `ImageUploader`
- `FaceMeshOverlay`
- `AnalysisResults`

#### [NEW] `frontend/src/pages/Dashboard.jsx`
Dashboard to track progress using `Chart.js` for historical analysis data (severity, lesion count across dates).

#### [NEW] `frontend/src/components/ImageUploader.jsx`
Drag and drop uploader component for face images.

#### [NEW] `frontend/src/components/FaceMeshOverlay.jsx`
Component wrapping MediaPipe's FaceMesh to draw landmarks on the uploaded image.

#### [NEW] `frontend/src/components/AnalysisResults.jsx`
Component receiving JSON analysis output to render visual statistics, severities, and AI skincare suggestions in an aesthetically pleasing UI.

## Open Questions
> [!NOTE]
> 1. Authentication: Do you want a simple mock `userId` to be used for the tracking features, or should we implement dummy login fields? (I will use a default `userId` for now if no auth is preferred).
> 2. Environment Variables: Have you prepared the API keys for Cloudinary and Gemini?

## Verification Plan

### Automated Tests
- Validate successful compilation of `frontend` (`npm run build`).
- Ensure no build errors or unresolved dependencies.

### Manual Verification
- We will start the backend via `npm run server` and the frontend via `npm run dev`.
- Ensure routes return successful status codes up to the point of API interaction (API keys required for full E2E run).
- Check the face mesh overlay effectively runs over the image in the UI.
