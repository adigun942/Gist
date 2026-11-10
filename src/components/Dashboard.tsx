import React from 'react';
import {
  Video,
  Film,
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Clock,
  Layers,
  Download,
  Play,
  Flame,
  CheckCircle2,
  HardDrive,
  FolderOpen,
} from 'lucide-react';
import { StudioStatus, VideoItem, PromptTemplate, MediaItem } from '../types';
import { NavTab } from './Sidebar';
import { api } from '../services/api';

interface DashboardProps {
  status: StudioStatus | null;
  videos: VideoItem[];
  prompts: PromptTemplate[];
  media: MediaItem[];
  onSelectTab: (tab: NavTab) => void;
  onSelectVideo: (video: VideoItem) => void;
  onApplyPrompt: (prompt: string, style?: string, camera?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  status,
  videos,
  prompts,
  media,
  onSelectTab,
  onSelectVideo,
  onApplyPrompt,
}) => {
  const recentVideos = videos.slice(0, 4);

  // Calculate total duration in seconds
  const totalSeconds = videos.reduce((acc, v) => {
    const s = parseInt(v.duration) || 15;
    return acc + s;
  }, 0);
  const totalMinutes = (totalSeconds / 60).toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17122e] via-[#0f1429] to-[#0a1622] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {/* Futuristic background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/15 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-indigo-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Next-Gen Veo Video Synthesis Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-sans">
              Welcome to <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">S.O ADIGUN</span> AI Video Studio.
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Your personal professional AI video production studio. Generate high-fidelity cinematic videos (minimum 15s) from detailed text prompts, uploaded reference photos, and video footage with zero watermarks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Watermark-Free Export
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                Single-Op 15s+ Productions
              </span>
              <span>•</span>
              <span className="text-gray-300">
                Powered by gemini-omni-1.2-flash
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('create')}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:brightness-110 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all group"
            >
              <Video className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Create Video Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onSelectTab('my-videos')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Browse My Videos ({videos.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Videos */}
        <div className="p-5 rounded-2xl bg-[#0f101a] border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Total Videos</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
            {videos.length}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Permanent</span> in local studio library
          </p>
        </div>

        {/* Metric 2: Duration Produced */}
        <div className="p-5 rounded-2xl bg-[#0f101a] border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Total Runtime</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
            {totalSeconds}s
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ~{totalMinutes} mins of cinematic footage
          </p>
        </div>

        {/* Metric 3: Media References */}
        <div className="p-5 rounded-2xl bg-[#0f101a] border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Media Assets</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
            {media.length}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Reference characters & videos
          </p>
        </div>

        {/* Metric 4: API Connection & Engine */}
        <div className="p-5 rounded-2xl bg-[#0f101a] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">API Status</span>
            <div className={`p-2 rounded-xl ${status?.hasApiKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status?.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-lg font-bold text-white font-mono">
              {status?.hasApiKey ? 'Connected' : 'Setup Key'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate font-mono">
            gemini-omni-1.2-flash
          </p>
        </div>
      </div>

      {/* Quick Launch Inspiration Prompts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-sans">
              Featured Prompt Inspirations
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('create')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prompts.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#10111d] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    {item.style}
                  </span>
                  <span className="text-cyan-400">{item.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {item.prompt}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400">
                  {item.cameraMovement}
                </span>
                <button
                  onClick={() => {
                    onApplyPrompt(item.prompt, item.style, item.cameraMovement);
                    onSelectTab('create');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/20 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Prompt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Videos Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-sans">
              Recent Video Productions
            </h2>
          </div>
          {videos.length > 0 && (
            <button
              onClick={() => onSelectTab('my-videos')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>View All ({videos.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentVideos.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0f101c] border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white font-sans">
                No videos generated yet
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Start producing your first 15-second cinematic AI video. Enter a prompt, select camera motion and style, and hit Generate.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Video Creator</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col"
              >
                {/* Video / Thumbnail preview container */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className="relative aspect-video bg-black/60 cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )}

                  {/* Play hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration tag */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                    {video.duration}
                  </div>

                  {/* No watermark verified */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md text-[9px] font-mono text-emerald-300 border border-emerald-500/30">
                    Clean MP4
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => onSelectVideo(video)}
                      className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {video.prompt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-400 text-[11px]">
                      {video.aspectRatio} • {video.dimensions || '1080p'}
                    </span>
                    <a
                      href={api.getDownloadUrl(video.id)}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="Download MP4 without watermark"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provider Details & Zero-Watermark Transparency Footer */}
      <div className="p-6 rounded-2xl bg-[#0d0e17] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Video Engine</span>
          </div>
          <h4 className="text-sm font-bold text-white">Google Veo (gemini-omni-1.2-flash)</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Direct integration with Google's state-of-the-art multimodal video generation foundation model.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Watermark Policy</span>
          </div>
          <h4 className="text-sm font-bold text-white">Zero Website Watermarks</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            S.O ADIGUN never stamps logos, captions, promotional overlays, or end screens on your downloaded videos.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Video Duration Guarantee</span>
          </div>
          <h4 className="text-sm font-bold text-white">15s Minimum Finished Video</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every finished video meets or exceeds the 15-second duration requirement, with multi-clip stitching for 20s–30s productions.
          </p>
        </div>
      </div>
    </div>
  );
};
