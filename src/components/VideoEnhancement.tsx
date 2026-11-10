import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Maximize2,
  Activity,
  Sliders,
  Volume2,
  Share2,
  Download,
  Film,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { VideoItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface VideoEnhancementProps {
  videos: VideoItem[];
  onVideoEnhanced: (video: VideoItem) => void;
  onSelectVideo: (video: VideoItem) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const VideoEnhancement: React.FC<VideoEnhancementProps> = ({
  videos,
  onVideoEnhanced,
  onSelectVideo,
  onSelectTab,
}) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'neural' | 'social'>('neural');

  // Neural tools state
  const [toolType, setToolType] = useState<
    'upscale' | 'interpolate_fps' | 'stabilize' | 'color_lut' | 'audio_enhance'
  >('upscale');
  const [targetResolution, setTargetResolution] = useState<'1080p' | '4k'>('4k');
  const [lutPreset, setLutPreset] = useState<'teal_orange' | 'noir' | 'cyberpunk' | 'warm_cinema'>('teal_orange');

  // Social format state
  const [socialPlatform, setSocialPlatform] = useState<'youtube' | 'tiktok' | 'reels' | 'square' | 'facebook'>('tiktok');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultVideo, setResultVideo] = useState<VideoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedVideo = videos.find((v) => v.id === selectedVideoId);

  const handleProcessEnhancement = async () => {
    if (!selectedVideoId) {
      setError('Please select a video from your library to enhance.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResultVideo(null);

      const enhanced = await api.enhanceVideo({
        videoId: selectedVideoId,
        toolType,
        lutPreset,
        targetResolution,
      });

      setResultVideo(enhanced);
      onVideoEnhanced(enhanced);
    } catch (err: any) {
      setError(err.message || 'Enhancement processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessSocialExport = async () => {
    if (!selectedVideoId) {
      setError('Please select a video from your library to format.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResultVideo(null);

      const social = await api.exportSocial({
        videoId: selectedVideoId,
        platform: socialPlatform,
      });

      setResultVideo(social);
      onVideoEnhanced(social);
    } catch (err: any) {
      setError(err.message || 'Social export processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Video Enhancement &amp; Social Master Suite
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              Production Grading &amp; Upscaling
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Apply 4K Lanczos neural upscaling, 60fps frame interpolation, Steadicam motion stabilization, Hollywood color LUTs, and social platform formatting with zero watermarks.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs animate-fadeIn">
          {error}
        </div>
      )}

      {/* Result Box */}
      {resultVideo && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#0f111f] to-cyan-950/40 border border-cyan-400/40 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Enhancement Processing Complete!</span>
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {resultVideo.title} • {resultVideo.dimensions || resultVideo.resolution} • 100% Watermark-Free Export
              </p>
            </div>
            <a
              href={api.getDownloadUrl(resultVideo.id)}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110"
            >
              <Download className="w-4 h-4" />
              <span>Download Clean Video</span>
            </a>
          </div>
          <div className="aspect-video max-h-[360px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
            <video src={resultVideo.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Main Suite Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Select Video & Monitor Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Select Video to Process
              </label>
              {videos.length === 0 ? (
                <div className="text-xs text-gray-500">
                  No videos generated yet. Please create a video first.
                </div>
              ) : (
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                >
                  {videos.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#121320]">
                      {v.title} ({v.duration}, {v.resolution})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedVideo && (
              <div className="space-y-3">
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                  <video src={selectedVideo.videoUrl} controls playsInline className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Current: {selectedVideo.dimensions || selectedVideo.resolution}</span>
                  <span className="text-cyan-400">{selectedVideo.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tools & Social Export (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl space-y-5">
            {/* Tab switch: Neural Enhancement vs Social Export */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('neural')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeTab === 'neural'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Neural Enhancement Suite
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeTab === 'social'
                    ? 'bg-cyan-500 text-black shadow-lg font-bold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                Social Media Export
              </button>
            </div>

            {/* View A: Neural Tools */}
            {activeTab === 'neural' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setToolType('upscale')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      toolType === 'upscale'
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs font-mono text-purple-300">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>AI Upscaling (4K/1080p)</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      Lanczos polynomial filter upscaling preserving fine edges.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setToolType('interpolate_fps')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      toolType === 'interpolate_fps'
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs font-mono text-cyan-300">
                      <Activity className="w-3.5 h-3.5" />
                      <span>60fps Motion Interpolation</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      Motion compensated frame doubling for buttery smoothness.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setToolType('stabilize')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      toolType === 'stabilize'
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs font-mono text-indigo-300">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Steadicam Stabilization</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      Removes jitter and camera shakes with optical stabilization.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setToolType('color_lut')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      toolType === 'color_lut'
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs font-mono text-amber-300">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Cinematic Color LUTs</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      Professional color grading presets for cinema contrast.
                    </p>
                  </button>
                </div>

                {/* Sub-parameters based on tool */}
                {toolType === 'upscale' && (
                  <div className="p-3.5 rounded-xl bg-[#141525] border border-white/5 space-y-2">
                    <label className="block text-xs font-mono text-gray-300">Target Upscale Scale</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetResolution('4k')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                          targetResolution === '4k' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        4K Ultra HD (3840x2160)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetResolution('1080p')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                          targetResolution === '1080p' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        1080p Full HD (1920x1080)
                      </button>
                    </div>
                  </div>
                )}

                {toolType === 'color_lut' && (
                  <div className="p-3.5 rounded-xl bg-[#141525] border border-white/5 space-y-2">
                    <label className="block text-xs font-mono text-gray-300">Color Grading Preset</label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setLutPreset('teal_orange')}
                        className={`p-2 rounded-lg text-left ${
                          lutPreset === 'teal_orange' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        Hollywood Teal &amp; Orange
                      </button>
                      <button
                        type="button"
                        onClick={() => setLutPreset('noir')}
                        className={`p-2 rounded-lg text-left ${
                          lutPreset === 'noir' ? 'bg-white/20 border border-white text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        Film Noir Monochrome
                      </button>
                      <button
                        type="button"
                        onClick={() => setLutPreset('cyberpunk')}
                        className={`p-2 rounded-lg text-left ${
                          lutPreset === 'cyberpunk' ? 'bg-purple-950/80 border border-purple-400 text-purple-300' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        Cyberpunk Neon Bloom
                      </button>
                      <button
                        type="button"
                        onClick={() => setLutPreset('warm_cinema')}
                        className={`p-2 rounded-lg text-left ${
                          lutPreset === 'warm_cinema' ? 'bg-amber-950/80 border border-amber-400 text-amber-300' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        Warm Golden Sunset
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleProcessEnhancement}
                    disabled={isProcessing || !selectedVideoId}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering Enhancement...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run Enhancement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* View B: Social Media Export */}
            {activeTab === 'social' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSocialPlatform('tiktok')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      socialPlatform === 'tiktok'
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono text-cyan-300">TikTok Format</div>
                    <span className="text-[10px] text-gray-400">9:16 Vertical • 1080x1920</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPlatform('reels')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      socialPlatform === 'reels'
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono text-purple-300">Instagram Reels</div>
                    <span className="text-[10px] text-gray-400">9:16 Vertical • Faststart MP4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPlatform('youtube')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      socialPlatform === 'youtube'
                        ? 'bg-red-950/60 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono text-red-300">YouTube Widescreen</div>
                    <span className="text-[10px] text-gray-400">16:9 Landscape • 1920x1080</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialPlatform('square')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      socialPlatform === 'square'
                        ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono text-indigo-300">Square Feed (1:1)</div>
                    <span className="text-[10px] text-gray-400">1:1 Centered • 1080x1080</span>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleProcessSocialExport}
                    disabled={isProcessing || !selectedVideoId}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Formatting Video...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Export for {socialPlatform.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
