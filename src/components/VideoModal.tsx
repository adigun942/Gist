import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Trash2,
  Copy,
  Check,
  Film,
  Clock,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { VideoItem } from '../types';
import { api } from '../services/api';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  onDelete,
}) => {
  if (!video) return null;

  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(video.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this video?')) return;
    try {
      setIsDeleting(true);
      await api.deleteVideo(video.id);
      onDelete(video.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fileSizeMb = (video.fileSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Background dismissal */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#0e0f18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121320]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Film className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-bold text-white truncate font-sans">
                {video.title}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-0.5">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">{video.duration}</span>
                <span>•</span>
                <span>{video.dimensions || video.resolution}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Watermark-Free Certified Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Clean Export (No Watermark)</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Cinema Video Player */}
          <div className="relative rounded-xl overflow-hidden bg-black/90 border border-white/10 shadow-inner flex items-center justify-center max-h-[50vh]">
            <video
              ref={videoRef}
              src={video.videoUrl}
              controls
              autoPlay
              playsInline
              loop
              className="w-full h-full max-h-[50vh] object-contain"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#131422] border border-white/5">
            <div className="flex items-center gap-2">
              <a
                href={api.getDownloadUrl(video.id)}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Clean Video (.MP4)</span>
              </a>

              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium transition-colors border border-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121320] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>DURATION</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{video.duration}</div>
              <span className="text-[11px] text-gray-400">Min 15s Guaranteed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121320] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>ASPECT RATIO</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{video.aspectRatio}</div>
              <span className="text-[11px] text-gray-400">{video.dimensions || '1080p'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121320] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-1">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>CAMERA MOTION</span>
              </div>
              <div className="text-sm font-bold text-white truncate">{video.cameraMovement}</div>
              <span className="text-[11px] text-gray-400 truncate">{video.style}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121320] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WATERMARK STATUS</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">None (Raw)</div>
              <span className="text-[11px] text-gray-400">{fileSizeMb} MB MP4</span>
            </div>
          </div>

          {/* Full Prompt Inspector */}
          <div className="p-4 rounded-xl bg-[#121320] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
                Generation Prompt
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {video.prompt.length} characters
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans bg-black/30 p-3.5 rounded-lg border border-white/5">
              {video.prompt}
            </p>

            {video.negativePrompt && (
              <div className="pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-red-400">
                  Negative Prompt
                </span>
                <p className="text-xs text-gray-400 mt-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                  {video.negativePrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
