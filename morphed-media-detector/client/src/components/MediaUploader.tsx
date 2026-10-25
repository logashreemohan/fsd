import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  FileImage, 
  FileVideo, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ScanLine, 
  Link as LinkIcon, 
  Globe,
  Film
} from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

interface MediaUploaderProps {
  onAnalysisComplete: (result: any) => void;
}

const MediaUploader = ({ onAnalysisComplete }: MediaUploaderProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState(false);

  // Link Upload State
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaTypeChoice, setMediaTypeChoice] = useState<'auto' | 'video' | 'image'>('video');

  // Processing & Error State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const isVideo = selectedFile.type.startsWith('video/') || 
                      /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(selectedFile.name);
      
      setFile(selectedFile);
      setIsVideoFile(isVideo);
      setError(null);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setIsVideoFile(false);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStage(1);

    const formData = new FormData();
    formData.append('media', file);

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(file.name);
    const endpoint = isVideo ? '/detection/video' : '/detection/image';

    const stageTimer1 = setTimeout(() => setProcessingStage(2), 1200);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 2600);

    try {
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      onAnalysisComplete(response.data);
      removeFile();
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred during analysis');
    } finally {
      setIsProcessing(false);
      setProcessingStage(1);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      setError('Please provide a valid media URL.');
      return;
    }

    if (!linkUrl.trim().startsWith('http://') && !linkUrl.trim().startsWith('https://')) {
      setError('URL must begin with http:// or https://');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStage(1);

    const stageTimer1 = setTimeout(() => setProcessingStage(2), 1500);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 3200);

    try {
      const response = await api.post('/detection/url', {
        url: linkUrl.trim(),
        mediaType: mediaTypeChoice
      });
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      onAnalysisComplete(response.data);
      setLinkUrl('');
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred while downloading and analyzing the link.');
    } finally {
      setIsProcessing(false);
      setProcessingStage(1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Method Switcher */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('upload'); setError(null); }}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
            activeTab === 'upload'
              ? "bg-brand-primary text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          )}
        >
          <FileVideo className="w-4 h-4 text-cyan-400" />
          <span>MP4 / File Upload</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('link'); setError(null); }}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
            activeTab === 'link'
              ? "bg-brand-primary text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          )}
        >
          <LinkIcon className="w-4 h-4 text-emerald-400" />
          <span>Link Upload (URL)</span>
        </button>
      </div>

      {/* Tab 1: File Upload (MP4 / Images) */}
      {activeTab === 'upload' && (
        <div>
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-brand-primary bg-brand-primary/10 scale-[1.01]' 
                  : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <Film className="w-7 h-7" />
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Upload className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-100">
                Drag & drop MP4 Video or Image here
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-5 leading-relaxed">
                Dedicated support for <strong className="text-cyan-400">MP4, MOV, AVI, WEBM</strong> video deepfake detection and <strong className="text-blue-400">JPG, PNG, WEBP</strong> images (Max 100MB).
              </p>
              <button 
                type="button"
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Browse MP4 or Image
              </button>
            </div>
          ) : (
            <div className="glass-card p-6">
              {/* Media Preview Box */}
              <div className="mb-4">
                {isVideoFile ? (
                  <div className="rounded-xl overflow-hidden bg-black border border-slate-700 shadow-inner">
                    <video 
                      src={preview || undefined} 
                      controls 
                      className="w-full max-h-72 object-contain bg-black"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex justify-center items-center">
                    <img 
                      src={preview || undefined} 
                      alt="Preview" 
                      className="w-full max-h-72 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* File Info Bar */}
              <div className="flex items-center justify-between mb-6 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    {isVideoFile ? (
                      <FileVideo className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <FileImage className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm truncate max-w-[220px] sm:max-w-md text-slate-200">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {isVideoFile ? 'Video (MP4/Format)' : 'Image'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={removeFile}
                  disabled={isProcessing}
                  title="Remove file"
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3.5 rounded-lg mb-5 text-sm border border-red-500/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isProcessing ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Analyzing {isVideoFile ? 'Video Frames' : 'Image'} with Deepfake AI...</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300 pl-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>File stream received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {processingStage >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      )}
                      <span>{isVideoFile ? 'Sampling video frames & detecting faces' : 'Detecting faces & facial boundaries'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {processingStage >= 3 ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                      <span>{isVideoFile ? 'Executing temporal consistency & artifact inference' : 'Evaluating morphing & synthesis artifacts'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleFileUpload}
                  className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-5 h-5" />
                  <span>Analyze {isVideoFile ? 'MP4 Video' : 'Image'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Link Upload (URL) */}
      {activeTab === 'link' && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1 text-slate-200">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">Analyze from Video / Media Link</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Paste a direct URL to an MP4 video, online video link, or image URL. The server will download the stream and run AI detection.
            </p>
          </div>

          <form onSubmit={handleLinkSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Media URL (HTTP / HTTPS)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => { setLinkUrl(e.target.value); setError(null); }}
                  placeholder="https://example.com/video.mp4 or video URL..."
                  disabled={isProcessing}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm"
                />
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                {linkUrl && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => setLinkUrl('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Media Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Media Type
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMediaTypeChoice('video')}
                  className={clsx(
                    "py-2.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all",
                    mediaTypeChoice === 'video'
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white"
                  )}
                >
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>MP4 / Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeChoice('image')}
                  className={clsx(
                    "py-2.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all",
                    mediaTypeChoice === 'image'
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white"
                  )}
                >
                  <FileImage className="w-3.5 h-3.5" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeChoice('auto')}
                  className={clsx(
                    "py-2.5 px-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all",
                    mediaTypeChoice === 'auto'
                      ? "bg-purple-500/20 border-purple-500 text-purple-300"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white"
                  )}
                >
                  <span>Auto-Detect</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3.5 rounded-lg text-sm border border-red-500/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing ? (
              <div className="space-y-4 py-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching media stream & analyzing...</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300 pl-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Connecting to remote URL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processingStage >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    )}
                    <span>Buffering stream & inspecting frames</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processingStage >= 3 ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600" />
                    )}
                    <span>Executing deepfake neural model inference</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <ScanLine className="w-5 h-5" />
                <span>Analyze Link</span>
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
