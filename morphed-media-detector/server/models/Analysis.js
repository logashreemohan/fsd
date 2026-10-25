import mongoose from 'mongoose';

const frameResultSchema = new mongoose.Schema({
  timestamp: Number,
  frameNumber: Number,
  confidence: Number,
  label: String,
  faceCount: Number,
  boundingBoxes: Array
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous analysis for testing, or set true to enforce auth
  },
  fileName: String,
  fileType: String,
  fileSize: Number,
  fileUrl: String,
  sourceUrl: String,
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  confidence: Number,
  realProbability: Number,
  manipulationProbability: Number,
  facesDetected: Number,
  framesAnalyzed: Number,
  suspiciousFrames: Number,
  processingTime: Number,
  result: {
    type: String,
    enum: ['REAL', 'SUSPICIOUS', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  explanation: String,
  frameResults: [frameResultSchema],
  boundingBoxes: Array, // For image analysis
  errorMessage: String,
}, { timestamps: true });

export default mongoose.model('Analysis', AnalysisSchema);
