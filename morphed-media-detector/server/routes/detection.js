import express from 'express';
import { analyzeImage, analyzeVideo, analyzeUrl } from '../controllers/detectionController.js';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Optional: protect middleware if we want only logged-in users to analyze
router.post('/image', upload.single('media'), analyzeImage);
router.post('/video', upload.single('media'), analyzeVideo);
router.post('/url', analyzeUrl);

export default router;
