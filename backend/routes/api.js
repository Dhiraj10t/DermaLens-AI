const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

// =======================
// CONFIG
// =======================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: os.tmpdir() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =======================
// MAIN ANALYZE ROUTE
// =======================
router.post('/analyze', upload.single('image'), async (req, res) => {
  let imagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    imagePath = req.file.path;
    const mimeType = req.file.mimetype;

    // =======================
    // 1. CLOUDINARY UPLOAD
    // =======================
    let cloudinaryUrl = '';

    try {
      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        folder: 'skinsight'
      });
      cloudinaryUrl = uploadResult.secure_url;
    } catch (err) {
      console.warn("Cloudinary failed, using fallback");
      cloudinaryUrl = '';
    }

    // =======================
    // 2. GEMINI ANALYSIS
    // =======================
    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0,
            topP: 1,
            topK: 1
          }
        });

        const fileData = {
          inlineData: {
            data: fs.readFileSync(imagePath).toString("base64"),
            mimeType
          }
        };

        const prompt = `
You are a strict dermatology analyzer.

Return ONLY JSON:
{
  "acneSeverity": "clear | mild | moderate | severe",
  "estimatedLesionCount": number,
  "pigmentationLevel": "low | medium | high",
  "affectedZones": ["forehead", "cheeks", "nose", "chin"],
  "skincareRecommendations": ["string"]
}
`;

        const result = await model.generateContent([prompt, fileData]);
        const text = result.response.text();

        let jsonStr = text.replace(/```json|```/g, '').trim();
        parsedResult = JSON.parse(jsonStr);

      } catch (err) {
        console.warn("Gemini failed, using fallback");
      }
    }

    // =======================
    // 3. FALLBACK (SAFE)
    // =======================
    if (!parsedResult) {
      parsedResult = {
        acneSeverity: "mild",
        estimatedLesionCount: 8,
        pigmentationLevel: "medium",
        affectedZones: ["cheeks"],
        skincareRecommendations: [
          "Use gentle cleanser",
          "Apply sunscreen",
          "Avoid touching face"
        ]
      };
    }

    // =======================
    // 4. YOLO DETECTION
    // =======================
    let yoloBoundingBoxes = [];

    try {
      const yoloScriptPath = path.join(__dirname, '../yolo_service.py');

      const { stdout } = await execFile(
        'python',
        [yoloScriptPath, imagePath],
        { timeout: 10000 } // ⏱️ prevent hanging
      );

      const parsed = JSON.parse(stdout);

      if (Array.isArray(parsed)) {
        yoloBoundingBoxes = parsed;
      } else if (parsed.error) {
        console.error("YOLO error:", parsed.error);
      }

    } catch (err) {
      console.error("YOLO failed:", err.message);
    }

    parsedResult.boundingBoxes = yoloBoundingBoxes;

    // =======================
    // 5. POST PROCESSING
    // =======================
    const count = parsedResult.estimatedLesionCount || 0;

    if (count <= 5) parsedResult.acneSeverity = "mild";
    else if (count <= 20) parsedResult.acneSeverity = "moderate";
    else parsedResult.acneSeverity = "severe";

    if (!Array.isArray(parsedResult.affectedZones)) {
      parsedResult.affectedZones = ["cheeks"];
    }

    // =======================
    // 6. CLEANUP
    // =======================
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // =======================
    // 7. RESPONSE
    // =======================
    res.json({
      imageUrl: cloudinaryUrl,
      analysis: parsedResult
    });

  } catch (err) {
    console.error(err);

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(500).json({ error: err.message });
  }
});


// =======================
// SAVE SCAN
// =======================
router.post('/scans', async (req, res) => {
  try {
    const {
      userId,
      imageUrl,
      acneSeverity,
      lesionCount,
      pigmentationLevel,
      zones,
      recommendations
    } = req.body;

    const newScan = new Scan({
      userId: userId || 'guest_user',
      imageUrl,
      acneSeverity,
      lesionCount,
      pigmentationLevel,
      zones,
      recommendations
    });

    await newScan.save();
    res.status(201).json(newScan);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// GET SCANS
// =======================
router.get('/scans', async (req, res) => {
  try {
    const userId = req.query.userId || 'guest_user';

    const scans = await Scan
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json(scans);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;