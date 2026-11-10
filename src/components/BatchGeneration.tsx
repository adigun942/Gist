import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Play,
  Star,
  Download,
  CheckCircle2,
  RefreshCw,
  Camera,
  Film,
  ArrowRight,
} from 'lucide-react';
import { BatchVariation, VideoItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface BatchGenerationProps {
  onVideoSelected: (video: VideoItem) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const BatchGeneration: React.FC<BatchGenerationProps> = ({
  onVideoSelected,
  onSelectTab,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [count, setCount] = useState(3);

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please provide a prompt to generate variations.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setVariations([]);
      setFavoriteId(null);

      const results = await api.generateBatch({
        prompt: prompt.trim(),
        aspectRatio,
        duration: '15s',
        count,
      });

      setVariations(results);
    } catch (err: any) {
      setError(err.message || 'Batch generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Batch Video Generation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              Multi-Variant Synthesis
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Submit one master prompt and automatically generate 3 to 4 cinematic variations with diverse camera trajectories and stylistic grading. Compare results and star your favorite.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Batch Setup Form */}
      <form
        onSubmit={handleRunBatch}
        className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Portrait (Shorts/Reels)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Number of Variations
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value={2}>2 Variations (A/B Test)</option>
              <option value={3}>3 Variations (Recommended)</option>
              <option value={4}>4 Variations (Full Matrix)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
            Base Video Prompt *
          </label>
          <textarea
            rows={4}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the scene you want to generate variations of: e.g. An obsidian cybernetic drone navigating through rain-soaked neon skyscrapers at midnight..."
            className="w-full p-4 rounded-xl bg-[#121322] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 leading-relaxed font-sans resize-y"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing {count} Variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {count} Video Variations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Variations Matrix Showcase */}
      {variations.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Comparison Matrix ({variations.length} Variants)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {variations.map((v, idx) => {
              const isFav = favoriteId === v.id;
              return (
                <div
                  key={v.id}
                  className={`rounded-2xl bg-[#0e0f18] border transition-all overflow-hidden flex flex-col shadow-lg ${
                    isFav
                      ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  {/* Video Box */}
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {v.video ? (
                      <video src={v.video.videoUrl} controls playsInline loop className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-xs text-red-400">
                        {v.error || 'Generation failed'}
                      </div>
                    )}

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 border border-white/10">
                      Version #{v.variationIndex}
                    </div>

                    <button
                      onClick={() => setFavoriteId(isFav ? null : v.id)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-black/60 text-gray-400 hover:text-white'
                      }`}
                      title={isFav ? 'Unstar' : 'Select as Favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Variation Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-bold">{v.cameraMovement}</span>
                        <span className="text-gray-400">15s</span>
                      </div>
                      <span className="text-[11px] text-purple-300 block">{v.styleModifier}</span>
                    </div>

                    {v.video && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() => onVideoSelected(v.video)}
                          className="text-xs text-cyan-400 hover:underline font-mono"
                        >
                          Cinema Preview
                        </button>
                        <a
                          href={api.getDownloadUrl(v.video.id)}
                          download
                          className="flex items-center gap-1 text-xs text-gray-300 hover:text-white font-mono"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
