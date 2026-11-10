import React, { useState } from 'react';
import {
  Film,
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Play,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';
import { VideoItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface MyVideosProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: string) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const MyVideos: React.FC<MyVideosProps> = ({
  videos,
  onSelectVideo,
  onDeleteVideo,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const [selectedRatio, setSelectedRatio] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  // Filter & Sort
  const filteredVideos = videos
    .filter((v) => {
      const matchesSearch =
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRatio = selectedRatio === 'all' || v.aspectRatio === selectedRatio;
      const matchesStyle = selectedStyle === 'all' || v.style === selectedStyle;
      return matchesSearch && matchesRatio && matchesStyle;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        const durA = parseInt(a.duration) || 15;
        const durB = parseInt(b.duration) || 15;
        return durB - durA;
      }
    });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this video?')) return;
    try {
      await api.deleteVideo(id);
      onDeleteVideo(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              My Video Library
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {videos.length} {videos.length === 1 ? 'Production' : 'Productions'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Every completed AI video is saved permanently to disk and ready for clean, watermark-free download.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Video</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#0e0f18] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompts or titles..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono cursor-pointer"
          >
            <option value="newest" className="bg-[#121320]">Sort: Newest First</option>
            <option value="oldest" className="bg-[#121320]">Sort: Oldest First</option>
            <option value="duration" className="bg-[#121320]">Sort: Longest Duration</option>
          </select>
        </div>

        {/* Aspect Ratio Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={selectedRatio}
            onChange={(e) => setSelectedRatio(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="all" className="bg-[#121320]">All Aspect Ratios</option>
            <option value="16:9" className="bg-[#121320]">16:9 Landscape</option>
            <option value="9:16" className="bg-[#121320]">9:16 Portrait</option>
            <option value="1:1" className="bg-[#121320]">1:1 Square</option>
          </select>
        </div>

        {/* Visual Style Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono cursor-pointer"
          >
            <option value="all" className="bg-[#121320]">All Visual Styles</option>
            <option value="Cinematic" className="bg-[#121320]">Cinematic</option>
            <option value="Realistic" className="bg-[#121320]">Realistic</option>
            <option value="Commercial Advertisement" className="bg-[#121320]">Commercial Ad</option>
            <option value="Animation" className="bg-[#121320]">Animation</option>
            <option value="Anime" className="bg-[#121320]">Anime</option>
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e0f18] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-sans">
              {searchTerm || selectedRatio !== 'all' || selectedStyle !== 'all'
                ? 'No matching videos found'
                : 'Your video library is empty'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {searchTerm || selectedRatio !== 'all' || selectedStyle !== 'all'
                ? 'Try clearing filters or search terms to view all saved generations.'
                : 'Head over to the Create Video workstation to render your first 15s cinematic video.'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const fileSizeMb = (video.fileSizeBytes / (1024 * 1024)).toFixed(1);

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
              >
                {/* Thumbnail / Video Preview */}
                <div className="relative aspect-video bg-black/80 overflow-hidden flex items-center justify-center">
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

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                    {video.duration}
                  </div>

                  {/* Clean Export Verified Stamp */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Clean MP4</span>
                  </div>
                </div>

                {/* Video Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span>{formattedDate}</span>
                      <span className="text-cyan-400 font-bold">{video.resolution}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 font-sans">
                      {video.title}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {video.prompt}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                      {video.style}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                      {video.cameraMovement}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">
                      {fileSizeMb} MB
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-mono font-medium flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>Preview</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Direct Download */}
                      <a
                        href={api.getDownloadUrl(video.id)}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition-colors border border-white/10"
                        title="Download Watermark-Free MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(e, video.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors border border-white/10"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
