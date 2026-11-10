import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Copy,
  Trash2,
  BookmarkPlus,
  Check,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  Camera,
  Layers,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  RefreshCw,
  Play,
  Download,
  Info,
} from 'lucide-react';
import {
  GenerationRequest,
  MediaItem,
  PromptTemplate,
  StudioSettings,
  StudioStatus,
  VideoItem,
} from '../types';
import { api } from '../services/api';

interface CreateVideoProps {
  status: StudioStatus | null;
  settings: StudioSettings | null;
  onVideoGenerated: (video: VideoItem) => void;
  onSelectVideo: (video: VideoItem) => void;
  initialPrompt?: string;
  initialStyle?: string;
  initialCamera?: string;
}

export const CreateVideo: React.FC<CreateVideoProps> = ({
  status,
  settings,
  onVideoGenerated,
  onSelectVideo,
  initialPrompt = '',
  initialStyle,
  initialCamera,
}) => {
  // Primary Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, distorted, low quality, artifacts, watermark, logo, duplicate limbs, overexposed, jitter'
  );
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);

  // Settings State
  const [duration, setDuration] = useState(settings?.defaultDuration || '15s');
  const [aspectRatio, setAspectRatio] = useState(settings?.defaultAspectRatio || '16:9');
  const [resolution, setResolution] = useState(settings?.defaultResolution || '1080p');
  const [style, setStyle] = useState(initialStyle || settings?.defaultStyle || 'Cinematic');
  const [cameraMovement, setCameraMovement] = useState(
    initialCamera || settings?.defaultCamera || 'Cinematic Camera Movement'
  );
  const [audio, setAudio] = useState(settings?.generateAudio ?? true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [consistencyTarget, setConsistencyTarget] = useState<'character' | 'product' | 'style'>('character');

  // Media Reference State
  const [referenceImages, setReferenceImages] = useState<
    Array<{ id: string; data: string; mimeType: string; name: string; label: string }>
  >([]);
  const [referenceVideo, setReferenceVideo] = useState<{
    data: string;
    mimeType: string;
    name: string;
  } | null>(null);

  // UI / Action State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [savedPromptMsg, setSavedPromptMsg] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<VideoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update prompt if initialPrompt changes
  useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Visual Styles list
  const visualStyles = [
    'Cinematic',
    'Realistic',
    'Commercial Advertisement',
    'Product Advertisement',
    'Animation',
    '3D Animation',
    'Anime',
    'Documentary',
    'Custom Style',
  ];

  // Camera Movements list
  const cameraMovements = [
    'Cinematic Camera Movement',
    'Static Camera',
    'Tracking Shot',
    'Zoom In',
    'Zoom Out',
    'Pan',
    'Aerial Shot',
  ];

  // Duration options (Enforcing >= 15s)
  const durationOptions = [
    {
      value: '15s',
      label: '15 Seconds',
      description: 'Single-operation high-fidelity generation (Standard Studio Duration)',
    },
    {
      value: '20s',
      label: '20 Seconds',
      description: 'Extended scene with seamless camera continuity & motion',
    },
    {
      value: '30s',
      label: '30 Seconds',
      description: 'Cinematic commercial production with multi-clip stitching',
    },
  ];

  // Aspect Ratios list
  const aspectRatios = [
    { value: '16:9', label: '16:9', desc: 'Landscape (YouTube, Cinema, Web)' },
    { value: '9:16', label: '9:16', desc: 'Portrait (Reels, TikTok, Shorts)' },
    { value: '1:1', label: '1:1', desc: 'Square (Social Feed & Ads)' },
  ];

  // Quality Resolutions list
  const resolutions = [
    { value: '1080p', label: '1080p Full HD', desc: 'Recommended clarity & detail' },
    { value: '720p', label: '720p HD', desc: 'Fast generation' },
    { value: '4k', label: '4K Ultra HD', desc: 'Highest resolution scale' },
  ];

  // Enhance prompt handler
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first before enhancing.');
      return;
    }
    try {
      setIsEnhancing(true);
      setError(null);
      const enhanced = await api.enhancePrompt(prompt, style, cameraMovement);
      setPrompt(enhanced);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Copy prompt handler
  const handleCopyPrompt = () => {
    if (!prompt.trim()) return;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Save prompt handler
  const handleSavePrompt = async () => {
    if (!prompt.trim()) return;
    try {
      await api.savePrompt({
        title: title.trim() || 'Prompt: ' + prompt.slice(0, 30) + '...',
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim(),
        style,
        cameraMovement,
        aspectRatio,
        duration,
      });
      setSavedPromptMsg(true);
      setTimeout(() => setSavedPromptMsg(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save prompt.');
    }
  };

  // Image Upload handler (up to 6 images)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - referenceImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setReferenceImages((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            data: base64,
            mimeType: file.type || 'image/jpeg',
            name: file.name,
            label:
              referenceImages.length === 0
                ? 'Primary Character / Subject'
                : referenceImages.length === 1
                ? 'Style Reference'
                : 'Lighting / Environment',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Reference Video Upload handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      setError('Reference video file size must be under 80MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceVideo({
        data: reader.result as string,
        mimeType: file.type || 'video/mp4',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);

    if (e.target) e.target.value = '';
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Generate Video Handler
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a video prompt describing the scene, motion, and subjects.');
      return;
    }

    if (!status?.hasApiKey) {
      setError(
        'Gemini API key is required. Please add your GEMINI_API_KEY in the AI Studio Settings > Secrets panel to generate videos with gemini-omni-1.2-flash.'
      );
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedResult(null);
      setGenerationProgress(10);
      setGenerationStage('Analyzing prompt, consistency locks, and motion parameters...');

      // Simulated progressive updates while waiting for the heavy model call
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev < 30) {
            setGenerationStage('Directing cinematic scene with gemini-omni-1.2-flash...');
            return prev + 5;
          } else if (prev < 65) {
            setGenerationStage(
              referenceImages.length > 0
                ? `Synthesizing frames preserving character consistency (${referenceImages.length} references)...`
                : 'Synthesizing continuous 15s+ photorealistic video frames...'
            );
            return prev + 4;
          } else if (prev < 90) {
            setGenerationStage('Finalizing temporal coherence, sound design, and clean MP4 export...');
            return prev + 2;
          }
          return prev;
        });
      }, 4000);

      const requestPayload: GenerationRequest = {
        title: title.trim() || undefined,
        prompt: prompt.trim(),
        negativePrompt: showNegativePrompt ? negativePrompt.trim() : undefined,
        duration,
        aspectRatio,
        resolution,
        style,
        cameraMovement,
        audio,
        referenceImages: referenceImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          label: img.label,
        })),
        referenceVideo: referenceVideo
          ? {
              data: referenceVideo.data,
              mimeType: referenceVideo.mimeType,
            }
          : null,
      };

      const result = await api.generateVideo(requestPayload);
      clearInterval(interval);

      setGenerationProgress(100);
      setGenerationStage('Completed! Processing watermark-free video...');
      setGeneratedResult(result.video);
      onVideoGenerated(result.video);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(
        err.message ||
          'Video generation failed. Please verify that your API key is active and prompt complies with model guidelines.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner with Studio Guarantees */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f111d] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans">
              Veo Video Creation Workstation
            </h2>
            <p className="text-xs text-gray-400">
              Generating guaranteed minimum 15-second cinematic videos with character reference consistency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Watermarks Guaranteed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Single-Op 15s Output</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompting & Reference Media (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Video Title & Prompt Editor */}
          <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
            {/* Optional Title */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Video Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Alleyway Tracking Shot - Scene 01"
                className="w-full px-4 py-2.5 rounded-xl bg-[#131422] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
              />
            </div>

            {/* Prompt Editor Header Toolbar */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cinematic Video Prompt</span>
              </label>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Clear */}
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-mono transition-colors"
                  title="Clear Prompt"
                >
                  Clear
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1"
                  title="Copy Prompt"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Save Prompt */}
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1"
                  title="Save Prompt to Library"
                >
                  {savedPromptMsg ? <Check className="w-3 h-3 text-cyan-400" /> : <BookmarkPlus className="w-3 h-3" />}
                  <span>{savedPromptMsg ? 'Saved' : 'Save'}</span>
                </button>

                {/* Enhance with AI */}
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 hover:from-purple-600/50 hover:to-cyan-500/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Enhance prompt with Gemini 3.8 Flash without altering your core intent"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}</span>
                </button>
              </div>
            </div>

            {/* Unlimited Practical Text Area */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Describe your scene in rich cinematic detail. Paste multiple paragraphs, character descriptions, camera trajectories, lighting, acoustic atmosphere, and product features... (Unlimited practical length supported)"
                className="w-full p-4 rounded-xl bg-[#111220] border border-white/10 text-white placeholder-gray-500 text-sm leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans resize-y min-h-[160px]"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 px-1 mt-1">
                <span>Supports multi-paragraph descriptions & camera directives</span>
                <span>{prompt.length} characters • {prompt.trim() ? prompt.trim().split(/\s+/).length : 0} words</span>
              </div>
            </div>

            {/* Negative Prompt Accordion */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowNegativePrompt(!showNegativePrompt)}
                className="flex items-center justify-between w-full text-xs font-mono text-gray-400 hover:text-white transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>Negative Prompt ({showNegativePrompt ? 'Expanded' : 'Hidden'})</span>
                </span>
                {showNegativePrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showNegativePrompt && (
                <div className="mt-2 animate-fadeIn">
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    placeholder="Specify visual artifacts to exclude (e.g. blurry, watermark, distorted faces, duplicate characters)"
                    className="w-full p-3 rounded-xl bg-[#131422] border border-white/10 text-red-200 placeholder-gray-600 text-xs focus:outline-none focus:border-red-500/50 font-mono resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Image & Video Reference Media */}
          <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Reference Media & Consistency Locks</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload character photos, style boards, or reference video footage (up to 6 images + 1 video).
                </p>
              </div>

              {/* Consistency Focus Mode */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141526] border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setConsistencyTarget('character')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    consistencyTarget === 'character'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Character
                </button>
                <button
                  type="button"
                  onClick={() => setConsistencyTarget('product')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    consistencyTarget === 'product'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Product
                </button>
                <button
                  type="button"
                  onClick={() => setConsistencyTarget('style')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    consistencyTarget === 'style'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Style
                </button>
              </div>
            </div>

            {/* Reference Media Dropzone / Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Existing Uploaded Images */}
              {referenceImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative aspect-video rounded-xl bg-black/60 border border-white/10 overflow-hidden group"
                >
                  <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(img.id)}
                      className="self-end p-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-cyan-300 truncate">
                      {img.label}
                    </span>
                  </div>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-gray-300">
                    Ref #{idx + 1}
                  </div>
                </div>
              ))}

              {/* Upload Image Slot */}
              {referenceImages.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-xl border border-dashed border-white/20 hover:border-cyan-400/50 bg-[#121322] hover:bg-[#16172a] transition-all flex flex-col items-center justify-center p-3 text-center group"
                >
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors mb-1" />
                  <span className="text-xs font-semibold text-gray-300 group-hover:text-white">
                    Add Image
                  </span>
                  <span className="text-[10px] text-gray-500">
                    JPG, PNG, WEBP ({referenceImages.length}/6)
                  </span>
                </button>
              )}

              {/* Reference Video Slot */}
              {referenceVideo ? (
                <div className="relative aspect-video rounded-xl bg-black/60 border border-purple-500/40 overflow-hidden group">
                  <video src={referenceVideo.data} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      type="button"
                      onClick={() => setReferenceVideo(null)}
                      className="self-end p-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-purple-300 truncate">
                      {referenceVideo.name}
                    </span>
                  </div>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-purple-950/80 text-[9px] font-mono text-purple-300 border border-purple-500/30">
                    Ref Video
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="aspect-video rounded-xl border border-dashed border-white/20 hover:border-purple-400/50 bg-[#121322] hover:bg-[#16172a] transition-all flex flex-col items-center justify-center p-3 text-center group"
                >
                  <VideoIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors mb-1" />
                  <span className="text-xs font-semibold text-gray-300 group-hover:text-white">
                    Ref Video
                  </span>
                  <span className="text-[10px] text-gray-500">MP4, MOV (&lt;80MB)</span>
                </button>
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/mov"
              onChange={handleVideoUpload}
              className="hidden"
            />

            {/* Consistency Details Footnote */}
            <div className="p-3 rounded-xl bg-[#121322] border border-white/5 flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Uploaded images will be passed directly as visual keyframes and consistency references to{' '}
                <strong className="text-gray-200">gemini-omni-1.2-flash</strong> to preserve facial geometry, hair, attire, and lighting across the entire 15-second generation.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Generation Settings & Launch (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Video Generation Settings</span>
            </h3>

            {/* 1. Video Duration Setting (15s minimum policy) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Finished Video Duration</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">Min 15s Guaranteed</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      duration === opt.value
                        ? 'bg-gradient-to-br from-purple-950/60 to-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#131422] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm font-mono">{opt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                      {opt.value === '15s' ? 'Single High-Fidelity Clip' : 'Stitched Production'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Aspect Ratio</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.value}
                    type="button"
                    onClick={() => setAspectRatio(ar.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aspectRatio === ar.value
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'bg-[#131422] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono">{ar.label}</div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{ar.desc.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Video Quality */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Video Quality & Resolution</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {resolutions.map((res) => (
                  <button
                    key={res.value}
                    type="button"
                    onClick={() => setResolution(res.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      resolution === res.value
                        ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-[#131422] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono">{res.label.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{res.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Visual Style & Camera Movement Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold mb-1.5">
                  Visual Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#131422] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
                >
                  {visualStyles.map((s) => (
                    <option key={s} value={s} className="bg-[#121320] text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold mb-1.5">
                  Camera Motion
                </label>
                <select
                  value={cameraMovement}
                  onChange={(e) => setCameraMovement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#131422] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
                >
                  {cameraMovements.map((c) => (
                    <option key={c} value={c} className="bg-[#121320] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Additional Settings: Audio Toggle & Watermark guarantee */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#131422] border border-white/5">
                <div className="flex items-center gap-2.5">
                  {audio ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">Generate Audio</div>
                    <div className="text-[11px] text-gray-400">Synchronized cinematic ambient sound</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audio}
                    onChange={(e) => setAudio(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Watermark-Free Export Assurance */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs text-purple-200">
                  <strong className="text-white">Strict Watermark Policy:</strong> S.O ADIGUN guarantees 100% clean video exports without any logo overlays or stamps.
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {/* Primary Action Button: GENERATE VIDEO */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-full py-4 px-6 rounded-[10px] bg-[#10111e] group-hover:bg-opacity-80 transition-all flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="font-bold text-sm text-white font-mono tracking-wide">
                      Generating Video ({generationProgress}%)...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-wide font-sans">
                      GENERATE {duration} VIDEO
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Generation Progress Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e0f18] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            {/* Spinning AI studio emblem */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-cyan-400 animate-spin" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                <Film className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-sans">
                Generating Cinematic Video
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Model: gemini-omni-1.2-flash • Target: {duration} ({aspectRatio}, {resolution})
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>{generationProgress}% rendered</span>
                <span>Watermark-free export</span>
              </div>
            </div>

            {/* Current Stage */}
            <div className="p-3.5 rounded-xl bg-[#141526] border border-white/5 text-xs text-cyan-300 font-mono">
              {generationStage}
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Video generation is an intensive neural process. Please do not close this window while the stream is synthesized.
            </p>
          </div>
        </div>
      )}

      {/* Generated Result Showcase Card */}
      {generatedResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0f111f] to-cyan-950/30 border border-cyan-400/30 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Video Production Complete!
                </h3>
                <p className="text-xs text-emerald-400 font-mono">
                  {generatedResult.duration} finished video ready • 100% Watermark-Free
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={api.getDownloadUrl(generatedResult.id)}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
              <button
                onClick={() => onSelectVideo(generatedResult)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/10 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Full Cinema Preview</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black/80 aspect-video max-h-[380px] flex items-center justify-center border border-white/10">
            <video
              src={generatedResult.videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
