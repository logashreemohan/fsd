import Analysis from '../models/Analysis.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFilePromise = promisify(execFile);
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const downloadFromUrl = async (mediaUrl, preferredType = 'auto') => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const isVideoPlatform = /youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|twitter\.com|x\.com|instagram\.com|facebook\.com|fb\.watch|reddit\.com|dailymotion\.com/i.test(mediaUrl);
  const ytDlpPath = path.join(process.cwd(), '..', 'ai-service', 'venv', 'Scripts', 'yt-dlp.exe');

  if (isVideoPlatform && fs.existsSync(ytDlpPath)) {
    const baseId = `url-video-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const outputTemplate = path.join(uploadsDir, `${baseId}.%(ext)s`);
    const nodeRuntime = process.execPath ? `node:${process.execPath}` : 'node';

    await execFilePromise(ytDlpPath, [
      '--no-playlist',
      '--js-runtimes', nodeRuntime,
      '-f', 'best[ext=mp4]/bestvideo[ext=mp4]/bestvideo/best',
      '--max-filesize', '100M',
      '-o', outputTemplate,
      mediaUrl
    ], { timeout: 120000 });

    const matchingFiles = fs.readdirSync(uploadsDir).filter(f => f.startsWith(baseId));
    if (matchingFiles.length === 0) {
      throw new Error('Downloaded video file could not be located on disk.');
    }
    const filename = matchingFiles[0];
    const outputPath = path.join(uploadsDir, filename);
    const stats = fs.statSync(outputPath);
    return {
      filePath: outputPath,
      fileName: filename,
      fileType: 'video',
      fileSize: stats.size
    };
  }

  const response = await fetch(mediaUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media from URL (${response.status} ${response.statusText})`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  let urlPath = '';
  try {
    urlPath = new URL(mediaUrl).pathname;
  } catch (e) {
    urlPath = mediaUrl;
  }
  let ext = path.extname(urlPath).toLowerCase();

  let fileType = 'video';
  if (preferredType === 'image') {
    fileType = 'image';
  } else if (preferredType === 'video') {
    fileType = 'video';
  } else if (contentType.startsWith('image/')) {
    fileType = 'image';
  } else if (contentType.startsWith('video/')) {
    fileType = 'video';
  } else if (/\.(jpe?g|png|webp|gif|bmp)$/i.test(ext)) {
    fileType = 'image';
  } else {
    fileType = 'video';
  }

  if (!ext || ext.length > 5) {
    ext = fileType === 'image' ? '.jpg' : '.mp4';
  }

  const filename = `url-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const outputPath = path.join(uploadsDir, filename);

  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });

  const stats = fs.statSync(outputPath);
  return {
    filePath: outputPath,
    fileName: filename,
    fileType,
    fileSize: stats.size
  };
};

export const analyzeImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const startTime = Date.now();
  
  try {
    // 1. Create Initial Analysis Record
    const analysis = await Analysis.create({
      userId: req.user ? req.user._id : null,
      fileName: req.file.filename,
      fileType: 'image',
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'PROCESSING'
    });

    // 2. Prepare Form Data to send to AI Service
    const formData = new FormData();
    const filePath = path.join(process.cwd(), req.file.path);
    formData.append('file', fs.createReadStream(filePath));

    // 3. Send to Python AI Service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/detection/image`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Service Error: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();

    // 4. Update Analysis Record with results
    const processingTime = Date.now() - startTime;
    
    analysis.status = 'COMPLETED';
    analysis.confidence = aiResult.confidence;
    analysis.realProbability = aiResult.real_probability;
    analysis.manipulationProbability = aiResult.manipulation_probability;
    analysis.facesDetected = aiResult.faces_detected;
    analysis.result = aiResult.label;
    analysis.explanation = aiResult.explanation;
    analysis.boundingBoxes = aiResult.faces;
    analysis.processingTime = processingTime;
    
    await analysis.save();

    res.json(analysis);
  } catch (error) {
    console.error('Image Analysis Error:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
};

export const analyzeVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const startTime = Date.now();
  
  try {
    // 1. Create Initial Analysis Record
    const analysis = await Analysis.create({
      userId: req.user ? req.user._id : null,
      fileName: req.file.filename,
      fileType: 'video',
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'PROCESSING'
    });

    // 2. Prepare Form Data
    const formData = new FormData();
    const filePath = path.join(process.cwd(), req.file.path);
    formData.append('file', fs.createReadStream(filePath));

    // 3. Send to Python AI Service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/detection/video`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Service Error: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();

    // 4. Update Analysis Record with results
    const processingTime = Date.now() - startTime;
    
    analysis.status = 'COMPLETED';
    analysis.confidence = aiResult.confidence;
    analysis.realProbability = aiResult.real_probability;
    analysis.manipulationProbability = aiResult.manipulation_probability;
    analysis.facesDetected = aiResult.faces_detected ?? 0;
    analysis.framesAnalyzed = aiResult.frames_analyzed;
    analysis.suspiciousFrames = aiResult.suspicious_frames;
    analysis.result = aiResult.label;
    analysis.explanation = aiResult.explanation;
    analysis.frameResults = aiResult.frame_results;
    analysis.processingTime = processingTime;
    
    await analysis.save();

    res.json(analysis);
  } catch (error) {
    console.error('Video Analysis Error:', error);
    res.status(500).json({ message: 'Error processing video', error: error.message });
  }
};

export const analyzeUrl = async (req, res) => {
  const { url, mediaType } = req.body;
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return res.status(400).json({ message: 'A valid HTTP/HTTPS URL is required.' });
  }

  const startTime = Date.now();

  try {
    const downloadedMedia = await downloadFromUrl(url.trim(), mediaType);
    const { filePath, fileName, fileType, fileSize } = downloadedMedia;

    const analysis = await Analysis.create({
      userId: req.user ? req.user._id : null,
      fileName,
      fileType,
      fileSize,
      fileUrl: `/uploads/${fileName}`,
      sourceUrl: url.trim(),
      status: 'PROCESSING'
    });

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const endpoint = fileType === 'image' ? '/api/detection/image' : '/api/detection/video';
    const aiResponse = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Service Error: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const processingTime = Date.now() - startTime;

    analysis.status = 'COMPLETED';
    analysis.confidence = aiResult.confidence;
    analysis.realProbability = aiResult.real_probability;
    analysis.manipulationProbability = aiResult.manipulation_probability;
    analysis.facesDetected = aiResult.faces_detected ?? 0;

    if (fileType === 'video') {
      analysis.framesAnalyzed = aiResult.frames_analyzed;
      analysis.suspiciousFrames = aiResult.suspicious_frames;
      analysis.frameResults = aiResult.frame_results;
    } else {
      analysis.boundingBoxes = aiResult.faces;
    }

    analysis.result = aiResult.label;
    analysis.explanation = aiResult.explanation;
    analysis.processingTime = processingTime;

    await analysis.save();
    res.json(analysis);
  } catch (error) {
    console.error('URL Analysis Error:', error);
    res.status(500).json({ message: error.message || 'Error processing URL media' });
  }
};
