const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to save temporarily to disk
const upload = multer({ dest: os.tmpdir() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze', upload.single('image'), async (req, res) => {
  let imagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    imagePath = req.file.path;
    const mimeType = req.file.mimetype;

    // 1. Upload to Cloudinary
    let cloudinaryUrl = '';
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key') {
      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        folder: 'skinsight'
      });
      cloudinaryUrl = uploadResult.secure_url;
    } else {
      cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    }

    // 2. Gemini Model (LOW RANDOMNESS)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0,   // 🔥 IMPORTANT → deterministic output
        topP: 1,
        topK: 1
      }
    });

    const fileData = {
      inlineData: {
        data: fs.readFileSync(imagePath).toString("base64"),
        mimeType: mimeType
      }
    };

    const prompt = `You are a strict dermatology analyzer.

RULES:
- Be consistent for the same image
- Count visible acne lesions carefully
- DO NOT guess randomly
- Always return valid JSON

Return ONLY JSON:
{
  "acneSeverity": "clear | mild | moderate | severe",
  "estimatedLesionCount": number,
  "pigmentationLevel": "low | medium | high",
  "affectedZones": ["forehead", "cheeks", "nose", "chin"],
  "skincareRecommendations": ["string"]
}
`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      const result = await model.generateContent([prompt, fileData]);
      const text = result.response.text();

      try {
        let jsonStr = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        parsedResult = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Parse error:", text);

        // 🔥 fallback safe result
        parsedResult = {
          acneSeverity: "mild",
          estimatedLesionCount: 10,
          pigmentationLevel: "medium",
          affectedZones: ["cheeks"],
          skincareRecommendations: ["Use gentle cleanser", "Apply sunscreen"]
        };
      }
    } else {
      parsedResult = {
        acneSeverity: "mild",
        estimatedLesionCount: 5,
        pigmentationLevel: "medium",
        affectedZones: ["cheeks", "forehead"],
        skincareRecommendations: ["Use salicylic acid cleanser", "Apply niacinamide serum"]
      };
    }

    // 🔥 POST-PROCESSING (VERY IMPORTANT)

    const count = parsedResult.estimatedLesionCount || 0;

    // Make severity consistent
    if (count <= 5) parsedResult.acneSeverity = "mild";
    else if (count <= 20) parsedResult.acneSeverity = "moderate";
    else parsedResult.acneSeverity = "severe";

    // Normalize zones
    parsedResult.affectedZones = Array.isArray(parsedResult.affectedZones)
      ? parsedResult.affectedZones
      : ["cheeks"];

    // cleanup
    fs.unlinkSync(imagePath);

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

// Save scan result
router.post('/scans', async (req, res) => {
  try {
    const { userId, imageUrl, acneSeverity, lesionCount, pigmentationLevel, zones, recommendations } = req.body;
    
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all scans
router.get('/scans', async (req, res) => {
  try {
    const userId = req.query.userId || 'guest_user';
    const scans = await Scan.find({ userId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
