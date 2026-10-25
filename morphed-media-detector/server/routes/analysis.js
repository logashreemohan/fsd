import express from 'express';
import { getHistory, getAnalysisById, deleteAnalysis } from '../controllers/analysisController.js';

const router = express.Router();

router.route('/').get(getHistory);
router.route('/:id').get(getAnalysisById).delete(deleteAnalysis);

export default router;
