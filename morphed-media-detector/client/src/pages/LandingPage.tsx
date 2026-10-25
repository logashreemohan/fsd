import { Link } from 'react-router-dom';
import { Shield, ScanLine, Video, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center gap-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-4">
          <Shield className="w-4 h-4" />
          College-Level AI/ML Project
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 pb-2">
          Detect AI Manipulation<br />in Seconds
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload images or videos to instantly analyze faces for deepfakes, morphing, and AI generation using our state-of-the-art inference pipeline.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-8">
          <Link to="/dashboard" className="px-8 py-4 bg-brand-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            Analyze Media Now
          </Link>
          <a href="#how-it-works" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
            How it works
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-12"
        id="how-it-works"
      >
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <ScanLine className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Image Analysis</h3>
          <p className="text-slate-400 text-sm">Detects face-swaps and manipulation in images with detailed explanations and probability scores.</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Video Deepfakes</h3>
          <p className="text-slate-400 text-sm">Frame-by-frame temporal analysis to identify inconsistencies in video deepfakes over time.</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">History & Reporting</h3>
          <p className="text-slate-400 text-sm">Keep track of all your analyses in a secure dashboard with detailed charts and statistics.</p>
        </div>
      </motion.div>

      <div className="text-sm text-slate-500 max-w-lg mt-8">
        <strong>Note:</strong> AI-generated predictions are probabilistic and should not be treated as definitive proof of manipulation.
      </div>
    </div>
  );
};

export default LandingPage;
