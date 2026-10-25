import Analysis from '../models/Analysis.js';

export const getStats = async (req, res) => {
  try {
    const total = await Analysis.countDocuments();
    const images = await Analysis.countDocuments({ fileType: 'image' });
    const videos = await Analysis.countDocuments({ fileType: 'video' });
    const suspicious = await Analysis.countDocuments({ result: 'SUSPICIOUS' });
    
    // Average confidence of suspicious files (or overall)
    const statsResult = await Analysis.aggregate([
      { $match: { result: 'SUSPICIOUS' } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);
    
    const avgConfidence = statsResult.length > 0 ? statsResult[0].avgConfidence : 0;
    
    const recent = await Analysis.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      total,
      images,
      videos,
      suspicious,
      avgConfidence: avgConfidence,
      recent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
