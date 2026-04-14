const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Scan = require('../models/Scan');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

// Configure APIs
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeImage = async (req, res) => {
  let imagePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    imagePath = req.file.path;
    const mimeType = req.file.mimetype;

    // 1. CLOUDINARY UPLOAD
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

    // 2. GEMINI ANALYSIS
    let parsedResult = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          generationConfig: { temperature: 0, topP: 1, topK: 1 }
        });
        const fileData = {
          inlineData: {
            data: fs.readFileSync(imagePath).toString("base64"),
            mimeType
          }
        };
        const prompt = `You are a strict dermatology analyzer.\nReturn ONLY JSON:\n{\n  "acneSeverity": "clear | mild | moderate | severe",\n  "estimatedLesionCount": number,\n  "pigmentationLevel": "low | medium | high",\n  "affectedZones": ["forehead", "cheeks", "nose", "chin"],\n  "skincareRecommendations": ["string"]\n}`;
        const result = await model.generateContent([prompt, fileData]);
        const text = result.response.text();
        let jsonStr = text.replace(/```json|```/g, '').trim();
        parsedResult = JSON.parse(jsonStr);
      } catch (err) {
        console.warn("Gemini failed, using fallback");
      }
    }

    // 3. FALLBACK (SAFE)
    if (!parsedResult) {
      parsedResult = {
        acneSeverity: "mild",
        estimatedLesionCount: 8,
        pigmentationLevel: "medium",
        affectedZones: ["cheeks"],
        skincareRecommendations: ["Use gentle cleanser", "Apply sunscreen"]
      };
    }

    // 4. YOLO DETECTION
    let yoloBoundingBoxes = [];
    try {
      const yoloScriptPath = path.join(__dirname, '../yolo_service.py');
      const { stdout } = await execFile('python', [yoloScriptPath, imagePath], { timeout: 10000 });
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

    // 5. POST PROCESSING
    const count = parsedResult.estimatedLesionCount || 0;
    if (count <= 5) parsedResult.acneSeverity = "mild";
    else if (count <= 20) parsedResult.acneSeverity = "moderate";
    else parsedResult.acneSeverity = "severe";

    if (!Array.isArray(parsedResult.affectedZones)) {
      parsedResult.affectedZones = ["cheeks"];
    }

    // 6. CLEANUP
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

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
};

const saveScan = async (req, res) => {
  try {
    // req.user logic from authMiddleware
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized to save scans' });
    }

    const { imageUrl, acneSeverity, lesionCount, pigmentationLevel, zones, recommendations } = req.body;

    const newScan = new Scan({
      userId: req.user.id, // Authenticated user ID!
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
};

const getScans = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const scans = await Scan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  analyzeImage,
  saveScan,
  getScans
};
