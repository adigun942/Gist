import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Clapperboard,
  Layers,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Download,
  Users,
  Video,
} from 'lucide-react';
import { CharacterItem, ProductionProject, StoryboardScene, VideoItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface AIProductionModeProps {
  characters: CharacterItem[];
  projects: ProductionProject[];
  onProjectsUpdated: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const AIProductionMode: React.FC<AIProductionModeProps> = ({
  characters,
  projects,
  onProjectsUpdated,
  onSelectVideo,
  onSelectTab,
}) => {
  // Input Concept
  const [concept, setConcept] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Cinematic Blockbuster');
  const [style, setStyle] = useState('Hollywood Cinematic');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [numScenes, setNumScenes] = useState(3);

  // Storyboard state
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [activeProject, setActiveProject] = useState<ProductionProject | null>(null);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [editingScene, setEditingScene] = useState<StoryboardScene | null>(null);

  // Rendering state
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [isStitching, setIsStitching] = useState(false);
  const [masterResult, setMasterResult] = useState<VideoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const genres = [
    'Cinematic Blockbuster',
    'Sci-Fi Cyberpunk',
    'Luxury Commercial Ad',
    'Martial Arts Action',
    'Fantasy Epic',
    'Documentary Chronicle',
    'Psychological Thriller',
  ];

  const handleGenerateStoryboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      setError('Please enter a story, advertisement script, or concept.');
      return;
    }

    try {
      setIsGeneratingStoryboard(true);
      setError(null);
      setMasterResult(null);

      const generatedScenes = await api.generateStoryboard({
        concept: concept.trim(),
        genre,
        style,
        characterIds: selectedCharacterIds,
        numScenes,
      });

      const newProj = await api.createProject({
        title: title.trim() || `Production: ${concept.slice(0, 30)}...`,
        concept: concept.trim(),
        genre,
        style,
        characterIds: selectedCharacterIds,
        scenes: generatedScenes,
      });

      setActiveProject(newProj);
      setScenes(generatedScenes);
      onProjectsUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to generate storyboard.');
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Generate an individual scene clip
  const handleGenerateSceneClip = async (scene: StoryboardScene) => {
    try {
      setGeneratingSceneId(scene.id);
      setError(null);

      // Collect reference images from linked characters
      const refImages: Array<{ data: string; mimeType: string }> = [];
      const linkedChars = characters.filter((c) =>
        activeProject?.characterIds?.includes(c.id)
      );
      linkedChars.forEach((c) => {
        c.referenceImages?.forEach((img) => {
          if (img.data) {
            refImages.push({ data: img.data, mimeType: img.mimeType || 'image/jpeg' });
          }
        });
      });

      const result = await api.generateVideo({
        title: `${activeProject?.title || 'Production'} - Scene ${scene.sceneNumber}: ${scene.title}`,
        prompt: scene.visualPrompt,
        style,
        cameraMovement: scene.cameraMovement,
        duration: '15s',
        aspectRatio: '16:9',
        resolution: '1080p',
        audio: true,
        referenceImages: refImages.slice(0, 4),
      });

      // Update scene with completed video
      const updatedScenes = scenes.map((s) => {
        if (s.id === scene.id) {
          return {
            ...s,
            status: 'completed' as const,
            clipVideoId: result.video.id,
            clipVideoUrl: result.video.videoUrl,
          };
        }
        return s;
      });

      setScenes(updatedScenes);
      if (activeProject) {
        await api.updateProject(activeProject.id, { scenes: updatedScenes });
      }
    } catch (err: any) {
      setError(err.message || `Failed to generate Scene ${scene.sceneNumber}.`);
    } finally {
      setGeneratingSceneId(null);
    }
  };

  // Stitch all completed scenes into one continuous master production video
  const handleStitchMaster = async () => {
    const completedClips = scenes
      .filter((s) => s.status === 'completed' && s.clipVideoId)
      .map((s) => s.clipVideoId as string);

    if (completedClips.length === 0) {
      setError('Please generate at least one scene clip before stitching.');
      return;
    }

    try {
      setIsStitching(true);
      setError(null);
      const master = await api.stitchScenes({
        projectId: activeProject?.id,
        clipVideoIds: completedClips,
        title: `${activeProject?.title || 'Master Production'} [Full Cut]`,
      });

      setMasterResult(master);
      if (activeProject) {
        await api.updateProject(activeProject.id, {
          status: 'completed',
          masterVideoId: master.id,
          masterVideoUrl: master.videoUrl,
          masterDuration: master.duration,
        });
      }
      onProjectsUpdated();
    } catch (err: any) {
      setError(err.message || 'Stitching failed.');
    } finally {
      setIsStitching(false);
    }
  };

  const completedCount = scenes.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#18112d] via-[#101222] to-[#0d1624] border border-white/10 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              AI Production Mode
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              Multi-Scene Directed Studio
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            Enter an entire story or advertisement concept. S.O ADIGUN breaks it into sequential 15-second scenes, preserves character consistency, generates each clip, and stitches them into one continuous master film.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Watermark-Free Master Stitch</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs leading-relaxed animate-fadeIn">
          {error}
        </div>
      )}

      {/* Step 1: Input Concept & Storyboard Generation */}
      {!scenes.length && (
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Step 1: Enter Story Concept or Commercial Script</span>
          </h3>

          <form onSubmit={handleGenerateStoryboard} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chronicles of Neo-Tokyo: Scene Arc"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Narrative Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
                >
                  {genres.map((g) => (
                    <option key={g} value={g} className="bg-[#121320]">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Scene Breakdown Count
                </label>
                <select
                  value={numScenes}
                  onChange={(e) => setNumScenes(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                >
                  <option value={2} className="bg-[#121320]">2 Scenes (30s Total)</option>
                  <option value={3} className="bg-[#121320]">3 Scenes (45s Total)</option>
                  <option value={4} className="bg-[#121320]">4 Scenes (60s Total)</option>
                </select>
              </div>
            </div>

            {/* Character Selection */}
            {characters.length > 0 && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
                  Cast Locked AI Characters in this Production
                </label>
                <div className="flex flex-wrap gap-2">
                  {characters.map((c) => {
                    const isSelected = selectedCharacterIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCharacterIds((prev) =>
                              prev.filter((id) => id !== c.id)
                            );
                          } else {
                            setSelectedCharacterIds((prev) => [...prev, c.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                            : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{c.name}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete Story / Concept Textarea */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Complete Story or Advertisement Concept *
              </label>
              <textarea
                rows={5}
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Paste your complete script or storyboard outline: e.g. A solitary cybernetic scout traverses an ancient temple in the misty peaks of Neo-Kyoto. He discovers a glowing ancient reliquary, activates it, and triggers a holographic map of lost celestial cities..."
                className="w-full p-4 rounded-xl bg-[#121322] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans resize-y"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGeneratingStoryboard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isGeneratingStoryboard ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing &amp; Storyboarding...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Storyboard ({numScenes} Scenes)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Storyboard Scenes Grid & Clip Generation */}
      {scenes.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Production Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0e0f18] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white font-sans">
                  {activeProject?.title || 'Active Production'}
                </span>
                <span className="text-[11px] font-mono text-gray-400 block">
                  {completedCount} of {scenes.length} Scenes Rendered (Estimated Duration:{' '}
                  {scenes.length * 15}s)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setScenes([]);
                  setActiveProject(null);
                  setMasterResult(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-mono"
              >
                New Concept
              </button>

              <button
                onClick={handleStitchMaster}
                disabled={completedCount === 0 || isStitching}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isStitching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Stitching Master Video...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-3.5 h-3.5" />
                    <span>Stitch Master Production ({completedCount}/{scenes.length} Scenes)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Master Video Result Box */}
          {masterResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#0f111f] to-cyan-950/40 border border-cyan-400/40 space-y-4 animate-fadeIn shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Master Production Cut Ready!</span>
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono mt-0.5">
                    {masterResult.duration} continuous sequence • 100% Watermark-Free Export
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={api.getDownloadUrl(masterResult.id)}
                    download
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master Cut</span>
                  </a>
                  <button
                    onClick={() => onSelectVideo(masterResult)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Cinema Preview
                  </button>
                </div>
              </div>

              <div className="aspect-video max-h-[380px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                <video src={masterResult.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Scenes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
              >
                {/* Scene Header */}
                <div className="p-4 bg-[#121322] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
                      {scene.sceneNumber}
                    </span>
                    <span className="font-bold text-white font-sans">{scene.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">15s</span>
                </div>

                {/* Scene Video Preview or Placeholder */}
                <div className="relative aspect-video bg-black/80 flex items-center justify-center overflow-hidden">
                  {scene.clipVideoUrl ? (
                    <video src={scene.clipVideoUrl} controls playsInline className="w-full h-full object-cover" />
                  ) : generatingSceneId === scene.id ? (
                    <div className="text-center p-4 space-y-2">
                      <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                      <span className="text-xs font-mono text-cyan-300 block">
                        Rendering with Veo...
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-1">
                      <Film className="w-8 h-8 text-gray-600 mx-auto" />
                      <span className="text-xs text-gray-500 font-mono">
                        Clip Not Rendered
                      </span>
                    </div>
                  )}

                  {scene.status === 'completed' && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Ready</span>
                    </div>
                  )}
                </div>

                {/* Scene Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {scene.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[#141525] border border-white/5 space-y-1 text-[11px] font-mono">
                      <span className="text-gray-500 block text-[9px] uppercase">
                        CAMERA DIRECTIVE
                      </span>
                      <span className="text-cyan-300 block">{scene.cameraMovement}</span>
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2 bg-black/30 p-2 rounded border border-white/5">
                      {scene.visualPrompt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => handleGenerateSceneClip(scene)}
                      disabled={generatingSceneId !== null}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-purple-600/40 to-cyan-500/40 hover:from-purple-600/60 hover:to-cyan-500/60 text-white font-semibold text-xs border border-cyan-500/30 transition-all disabled:opacity-50"
                    >
                      {generatingSceneId === scene.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Clip...</span>
                        </>
                      ) : scene.status === 'completed' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-render Clip</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Generate 15s Clip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
