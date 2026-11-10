import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Scissors,
  Plus,
  Play,
  Pause,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Type,
  Music,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  MoveRight,
} from 'lucide-react';
import { EditorClip, TextOverlay, VideoItem, VoiceoverItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface AIVideoEditorProps {
  videos: VideoItem[];
  audioList: VoiceoverItem[];
  onSelectTab: (tab: NavTab) => void;
  onVideoExported: (video: VideoItem) => void;
}

export const AIVideoEditor: React.FC<AIVideoEditorProps> = ({
  videos,
  audioList,
  onSelectTab,
  onVideoExported,
}) => {
  const [timelineClips, setTimelineClips] = useState<EditorClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [audioTracks, setAudioTracks] = useState<
    Array<{ id: string; audioUrl: string; name: string; volume: number }>
  >([]);

  // Export settings
  const [projectTitle, setProjectTitle] = useState('My Edited Master Video');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<VideoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Text Overlay Form
  const [newText, setNewText] = useState('');
  const [newTextPos, setNewTextPos] = useState<'top' | 'center' | 'bottom'>('bottom');

  const playerRef = useRef<HTMLVideoElement>(null);

  // Add clip from library to timeline
  const handleAddClip = (video: VideoItem) => {
    const durSec = parseInt(video.duration) || 15;
    const newClip: EditorClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      videoId: video.id,
      videoUrl: video.videoUrl,
      title: video.title,
      startTime: 0,
      duration: durSec,
      trimStart: 0,
      trimEnd: durSec,
      volume: 1.0,
      transition: 'dissolve',
    };
    setTimelineClips((prev) => [...prev, newClip]);
    if (!selectedClipId) setSelectedClipId(newClip.id);
  };

  const handleRemoveClip = (clipId: string) => {
    setTimelineClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  const handleTrimChange = (clipId: string, start: number, end: number) => {
    setTimelineClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, trimStart: start, trimEnd: end } : c))
    );
  };

  const handleMoveClip = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= timelineClips.length) return;
    const updated = [...timelineClips];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTimelineClips(updated);
  };

  // Add text overlay
  const handleAddTextOverlay = () => {
    if (!newText.trim()) return;
    const overlay: TextOverlay = {
      id: `text_${Date.now()}`,
      text: newText.trim(),
      startTime: 0,
      duration: 5,
      position: newTextPos,
      color: '#ffffff',
      fontSize: 36,
    };
    setTextOverlays((prev) => [...prev, overlay]);
    setNewText('');
  };

  // Add Audio track
  const handleAddAudioTrack = (audioItem: VoiceoverItem) => {
    setAudioTracks((prev) => [
      ...prev,
      {
        id: `aud_${Date.now()}`,
        audioUrl: audioItem.audioUrl,
        name: audioItem.title,
        volume: 0.8,
      },
    ]);
  };

  // Export Timeline with server-side ffmpeg
  const handleExportTimeline = async () => {
    if (timelineClips.length === 0) {
      setError('Please add at least one video clip to the timeline before exporting.');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setExportResult(null);

      const exported = await api.exportTimeline({
        title: projectTitle.trim() || 'Master Timeline Cut',
        clips: timelineClips.map((c) => ({
          videoId: c.videoId,
          trimStart: c.trimStart,
          trimEnd: c.trimEnd,
          volume: c.volume,
        })),
        audioTracks,
        textOverlays,
        aspectRatio,
        resolution,
      });

      setExportResult(exported);
      onVideoExported(exported);
    } catch (err: any) {
      setError(err.message || 'Timeline export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedClip = timelineClips.find((c) => c.id === selectedClipId);
  const totalTimelineDuration = timelineClips.reduce(
    (acc, c) => acc + (c.trimEnd - c.trimStart),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              AI Video Editor
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              Multi-Track Timeline
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Trim clips, arrange scene transitions, add text overlays, synchronize AI voiceovers, and export master cuts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportTimeline}
            disabled={isExporting || timelineClips.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering Master...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Master Video ({totalTimelineDuration}s)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs animate-fadeIn">
          {error}
        </div>
      )}

      {/* Export Result Box */}
      {exportResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#0f111f] to-cyan-950/40 border border-cyan-400/40 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Master Video Export Complete!</span>
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {exportResult.duration} continuous master timeline • 100% Watermark-Free MP4
              </p>
            </div>
            <a
              href={api.getDownloadUrl(exportResult.id)}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          </div>
          <div className="aspect-video max-h-[360px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
            <video src={exportResult.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Editor Layout: Workspace (3 columns on left: Clip Bin & Text, 9 cols on right: Player & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Clip Bin & Audio Picker (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Clip Bin */}
          <div className="p-4 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                <span>Media Pool ({videos.length})</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Click + to add</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {videos.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No generated videos yet. Head to Create Video first.
                </div>
              ) : (
                videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#141525] border border-white/5 hover:border-purple-500/30 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-10 h-7 rounded bg-black overflow-hidden shrink-0">
                        {vid.thumbnailUrl ? (
                          <img src={vid.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <video src={vid.videoUrl} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-white truncate block font-sans">{vid.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{vid.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddClip(vid)}
                      className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 transition-colors ml-2"
                      title="Add to Timeline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Text Overlays Creator */}
          <div className="p-4 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Type className="w-3.5 h-3.5" />
              <span>Add Text Overlays</span>
            </span>

            <div className="space-y-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Text overlay caption..."
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newTextPos}
                  onChange={(e) => setNewTextPos(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141525] border border-white/10 text-white text-xs font-mono"
                >
                  <option value="bottom">Bottom Caption</option>
                  <option value="center">Center Title</option>
                  <option value="top">Top Header</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddTextOverlay}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
                >
                  Add Text
                </button>
              </div>
            </div>

            {textOverlays.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {textOverlays.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#141525] border border-white/5 text-[11px]"
                  >
                    <span className="truncate text-gray-200">"{t.text}"</span>
                    <button
                      onClick={() => setTextOverlays((prev) => prev.filter((x) => x.id !== t.id))}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Voice & Music Pool */}
          <div className="p-4 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                <span>Audio Tracks ({audioList.length})</span>
              </span>
              <button
                onClick={() => onSelectTab('audio-studio' as any)}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                Open Studio
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {audioList.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-500 font-mono">
                  No voiceovers generated yet.
                </div>
              ) : (
                audioList.map((aud) => (
                  <div
                    key={aud.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#141525] border border-white/5 text-xs"
                  >
                    <div className="truncate">
                      <span className="text-white block truncate">{aud.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{aud.voice} • {aud.durationSec}s</span>
                    </div>
                    <button
                      onClick={() => handleAddAudioTrack(aud)}
                      className="p-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      title="Add Audio to Timeline"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Player Preview & Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Video Preview Monitor */}
          <div className="p-4 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>MONITOR PREVIEW</span>
              <span className="text-cyan-400">
                Timeline Total: {totalTimelineDuration}s ({timelineClips.length} Clips)
              </span>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10 max-h-[340px]">
              {selectedClip ? (
                <video
                  ref={playerRef}
                  src={selectedClip.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500 space-y-1">
                  <Film className="w-8 h-8 mx-auto" />
                  <span className="text-xs font-mono block">Timeline is empty. Add clips from the media pool.</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Multi-Track System */}
          <div className="p-5 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Multi-Track Timeline</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Total Cut: <strong className="text-white">{totalTimelineDuration}s</strong>
              </span>
            </div>

            {/* Track 1: Video Track */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                VIDEO TRACK 01
              </span>
              <div className="min-h-[76px] p-2 rounded-xl bg-[#121322] border border-white/10 flex items-center gap-2 overflow-x-auto">
                {timelineClips.length === 0 ? (
                  <span className="text-xs text-gray-500 font-mono px-3">
                    Drag or click + on any video to place on track
                  </span>
                ) : (
                  timelineClips.map((clip, idx) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipDur = clip.trimEnd - clip.trimStart;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => setSelectedClipId(clip.id)}
                        className={`relative shrink-0 h-14 rounded-lg px-3 py-1.5 border cursor-pointer flex flex-col justify-between transition-all min-w-[130px] ${
                          isSelected
                            ? 'bg-purple-950/70 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-[#18192d] border-white/10 text-gray-300 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold truncate">
                          <span className="truncate">{clip.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClip(clip.id);
                            }}
                            className="text-gray-400 hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                          <span>{clipDur}s cut</span>
                          <span className="text-purple-300">#{idx + 1}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Trimming Inspector (for selected clip) */}
            {selectedClip && (
              <div className="p-3.5 rounded-xl bg-[#141525] border border-white/5 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-cyan-400 font-bold">Clip Trim Inspector: {selectedClip.title}</span>
                  <span className="text-gray-400">
                    Active Window: {selectedClip.trimStart}s - {selectedClip.trimEnd}s ({selectedClip.trimEnd - selectedClip.trimStart}s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">
                      TRIM START (SECONDS)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={selectedClip.duration - 1}
                      value={selectedClip.trimStart}
                      onChange={(e) =>
                        handleTrimChange(selectedClip.id, Number(e.target.value), selectedClip.trimEnd)
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">
                      TRIM END (SECONDS)
                    </label>
                    <input
                      type="range"
                      min={selectedClip.trimStart + 1}
                      max={selectedClip.duration}
                      value={selectedClip.trimEnd}
                      onChange={(e) =>
                        handleTrimChange(selectedClip.id, selectedClip.trimStart, Number(e.target.value))
                      }
                      className="w-full accent-purple-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
