import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Image as ImageIcon, Video, AlertTriangle, Link as LinkIcon, Film } from 'lucide-react';
import MediaUploader from '../components/MediaUploader';
import api from '../services/api';
import clsx from 'clsx';

const COLORS = ['#22c55e', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [currentResult, setCurrentResult] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);
      const historyRes = await api.get('/analysis');
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAnalysisComplete = (result: any) => {
    setCurrentResult(result);
    fetchDashboardData();
    setActiveTab('history');
  };

  const deleteAnalysis = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await api.delete(`/analysis/${id}`);
      fetchDashboardData();
      if (currentResult?._id === id) setCurrentResult(null);
    }
  };

  const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getMediaUrl = (item: any) => {
    if (!item?.fileUrl) return null;
    return item.fileUrl.startsWith('http') ? item.fileUrl : `${backendBase}${item.fileUrl}`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Activity /></div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Analyses</div>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400"><ImageIcon /></div>
            <div>
              <div className="text-2xl font-bold">{stats.images}</div>
              <div className="text-sm text-slate-400">Images</div>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><Video /></div>
            <div>
              <div className="text-2xl font-bold">{stats.videos}</div>
              <div className="text-sm text-slate-400">Videos (MP4)</div>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-400"><AlertTriangle /></div>
            <div>
              <div className="text-2xl font-bold">{stats.suspicious}</div>
              <div className="text-sm text-slate-400">Suspicious</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Uploader / Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-1 flex gap-2 w-fit">
            <button 
              className={clsx(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all", 
                activeTab === 'upload' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
              onClick={() => setActiveTab('upload')}
            >
              Analyze Media
            </button>
            <button 
              className={clsx(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all", 
                activeTab === 'history' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
              onClick={() => setActiveTab('history')}
            >
              Results & History
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="glass-card p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Deepfake & Morphing Analysis</h2>
                <p className="text-sm text-slate-400">
                  Analyze video files (MP4, MOV, WEBM) or submit online media links for facial AI detection.
                </p>
              </div>
              <MediaUploader onAnalysisComplete={handleAnalysisComplete} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {currentResult && (
                <div className="glass-card p-6 border-l-4 border-l-brand-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Analysis Result</h2>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        ID: {currentResult._id}
                      </div>
                    </div>
                    <div className={clsx(
                      "px-4 py-1.5 rounded-full font-bold text-sm tracking-wide border",
                      currentResult.result === 'SUSPICIOUS' 
                        ? "bg-red-500/20 text-red-400 border-red-500/30" 
                        : currentResult.result === 'REAL'
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    )}>
                      {currentResult.result}
                    </div>
                  </div>

                  {/* Media Playback / Preview */}
                  {getMediaUrl(currentResult) && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold uppercase text-slate-400 mb-2">
                        Analyzed Media Playback
                      </div>
                      {currentResult.fileType === 'video' ? (
                        <div className="rounded-xl overflow-hidden bg-black border border-slate-700">
                          <video 
                            src={getMediaUrl(currentResult)!} 
                            controls 
                            className="w-full max-h-80 object-contain bg-black"
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex justify-center">
                          <img 
                            src={getMediaUrl(currentResult)!} 
                            alt="Analyzed Target" 
                            className="w-full max-h-80 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Link if from URL */}
                  {currentResult.sourceUrl && (
                    <div className="mb-4 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-300 shrink-0">Source URL:</span>
                      <a 
                        href={currentResult.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-cyan-400 hover:underline truncate"
                      >
                        {currentResult.sourceUrl}
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Confidence</div>
                      <div className="font-mono font-medium text-lg">{currentResult.confidence}%</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Manipulation Prob</div>
                      <div className="font-mono font-medium text-lg">{(currentResult.manipulationProbability * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Media Type</div>
                      <div className="font-medium text-lg capitalize">{currentResult.fileType}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Faces Detected</div>
                      <div className="font-medium text-lg">{currentResult.facesDetected ?? '0'}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-slate-300">Explanation</h3>
                    <p className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700/50">
                      {currentResult.explanation}
                    </p>
                  </div>

                  {currentResult.fileType === 'video' && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-4 text-slate-300">Video Timeline Analysis</h3>
                      {currentResult.frameResults && currentResult.frameResults.length > 0 ? (
                        <div className="h-52 w-full bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentResult.frameResults}>
                              <defs>
                                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="timestamp" stroke="#94a3b8" unit="s" />
                              <YAxis stroke="#94a3b8" domain={[0, 100]} />
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}/>
                              <Area type="monotone" dataKey="confidence" stroke="#ef4444" fillOpacity={1} fill="url(#colorConf)" name="Confidence %" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                          No face-containing frames detected in this video to display timeline plots.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-slate-500">
                    AI-generated prediction. Results are probabilistic and should not be treated as definitive proof.
                  </div>
                </div>
              )}

              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                  <h3 className="font-bold">Recent Analyses</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase">
                      <tr>
                        <th className="px-6 py-3">File / Source</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Result</th>
                        <th className="px-6 py-3">Conf</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200 truncate max-w-[180px]">
                            <div className="flex items-center gap-2">
                              {item.sourceUrl ? (
                                <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : item.fileType === 'video' ? (
                                <Film className="w-4 h-4 text-cyan-400 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                              )}
                              <span className="truncate">{item.sourceUrl || item.fileName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize">{item.fileType}</td>
                          <td className="px-6 py-4">
                            <span className={clsx(
                              "px-2.5 py-1 rounded-full text-xs font-semibold border",
                              item.result === 'SUSPICIOUS' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                : item.result === 'REAL'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            )}>
                              {item.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{item.confidence}%</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setCurrentResult(item)} className="text-brand-primary hover:underline">View</button>
                              <button onClick={() => deleteAnalysis(item._id)} className="text-red-400 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {history.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No analyses found.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Charts */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Detection Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Real', value: stats?.total ? Math.max(0, stats.total - stats.suspicious) : 0 },
                      { name: 'Suspicious', value: stats?.suspicious || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>Real</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Suspicious</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
