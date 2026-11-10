import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Sparkles,
  Plus,
  Play,
  Film,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { MediaItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface MediaLibraryProps {
  media: MediaItem[];
  onMediaUpdated: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  media,
  onMediaUpdated,
  onSelectTab,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeMediaPreview, setActiveMediaPreview] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = [
    'Character Face & Identity',
    'Hairstyle & Appearance',
    'Costume & Attire',
    'Product Design',
    'Environment & Background',
    'Cinematic Style Board',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          await api.uploadMedia({
            fileData: base64,
            fileName: file.name,
            mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
            type: isVideo ? 'video' : 'image',
            label: isVideo ? 'Reference Footage' : 'Character Reference',
          });
          onMediaUpdated();
        } catch (err: any) {
          setUploadError(err.message || 'Failed to upload media item.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'File upload error.');
      setIsUploading(false);
    }

    if (e.target) e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this media reference?')) return;
    try {
      await api.deleteMedia(id);
      onMediaUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete media');
    }
  };

  const filteredMedia = media.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesLabel = selectedLabel === 'all' || item.label === selectedLabel;
    return matchesType && matchesLabel;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Reference Media Library
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {media.length} Assets
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Store character references, product designs, and style footage for consistent multi-clip video generation.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Media Asset'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime,video/mov"
        onChange={handleFileUpload}
        className="hidden"
      />

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
          {uploadError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0e0f18] border border-white/10">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141525] border border-white/10 text-xs font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'image' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Images ({media.filter((m) => m.type === 'image').length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'video' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Footage ({media.filter((m) => m.type === 'video').length})
          </button>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Persistent Disk Storage: <span className="text-cyan-400">/data/media/</span>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e0f18] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-sans">
              No media assets uploaded yet
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload character portraits, product renderings, or video clips to use as consistency references in your AI video generations.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Reference File</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const sizeKb = (item.sizeBytes / 1024).toFixed(0);
            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col"
              >
                {/* Media Preview Box */}
                <div
                  onClick={() => setActiveMediaPreview(item)}
                  className="relative aspect-video bg-black/80 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Type Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 border border-white/10 flex items-center gap-1">
                    {item.type === 'video' ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span className="capitalize">{item.type}</span>
                  </div>

                  {/* Hover action preview */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 rounded-lg bg-black/70 text-white text-xs font-mono border border-white/10">
                      View
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate font-sans" title={item.name}>
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-mono text-purple-300 block mt-0.5">
                      {item.label}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>{sizeKb} KB</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Preview Modal */}
      {activeMediaPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0e0f18] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  {activeMediaPreview.name}
                </h3>
                <span className="text-xs text-purple-400 font-mono">
                  {activeMediaPreview.label} • {activeMediaPreview.mimeType}
                </span>
              </div>
              <button
                onClick={() => setActiveMediaPreview(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
              {activeMediaPreview.type === 'video' ? (
                <video src={activeMediaPreview.url} controls autoPlay loop className="max-h-[60vh] w-full" />
              ) : (
                <img src={activeMediaPreview.url} alt={activeMediaPreview.name} className="max-h-[60vh] object-contain" />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveMediaPreview(null);
                  onSelectTab('create');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110"
              >
                Use in Create Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
