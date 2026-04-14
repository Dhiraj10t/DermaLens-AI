const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { analyzeImage, saveScan, getScans } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ dest: os.tmpdir() });

// Analyze is public (guest scanning allowed)
router.post('/analyze', upload.single('image'), analyzeImage);

// Save and Get Scans are protected
router.post('/', protect, saveScan);
router.get('/', protect, getScans);

module.exports = router;
