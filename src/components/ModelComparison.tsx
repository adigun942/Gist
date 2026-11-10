import React from 'react';
import {
  Cpu,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { ModelComparisonInfo } from '../types';
import { NavTab } from './Sidebar';

interface ModelComparisonProps {
  onSelectTab: (tab: NavTab) => void;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ onSelectTab }) => {
  const models: ModelComparisonInfo[] = [
    {
      id: 'gemini-omni-1.2-flash',
      name: 'Google Veo (gemini-omni-1.2-flash)',
      provider: 'Google DeepMind via Gemini Interactions API',
      type: 'Primary Video Synthesis Engine',
      capabilities: [
        'Text-to-Video generation up to 15s in a single operation',
        'Image-to-Video (single starting frame keyframe animation)',
        'Storyboard Reference (up to 6 multi-image consistency locks)',
        'Reference Video upload and stylistic video-to-video editing',
        'Synchronized high-fidelity ambient acoustic audio synthesis',
        'Multi-turn seamless extension up to 30s total duration',
      ],
      supportedDurations: ['15s (Native single-op)', '20s (Extended)', '30s (Multi-clip stitched)'],
      maxResolution: '1080p Full HD & 4K',
      aspectRatios: ['16:9 Landscape', '9:16 Portrait', '1:1 Square (Centered)'],
      audioSupport: true,
      imageToVideo: true,
      videoToVideo: true,
      status: 'Active',
      quotaNote: 'Requires billing-enabled Gemini API key configured in AI Studio Settings > Secrets.',
      recommendedFor: 'Cinematic video generation, commercial advertisements, and character-locked productions.',
    },
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'Google via Gemini API (generateContent)',
      type: 'Cinematic Reasoning & Storyboard Engine',
      capabilities: [
        'Cinematic prompt engineering & expansion without changing user intent',
        'Multi-scene narrative storyboarding and shot division',
        'Visual character consistency breakdown and casting prompt lock',
        'Ultra-low latency (<500ms response time)',
      ],
      supportedDurations: ['N/A (Prompt & Storyboard Planning)'],
      maxResolution: 'Text & JSON Structured Schema',
      aspectRatios: ['All cinematic aspect ratios'],
      audioSupport: false,
      imageToVideo: false,
      videoToVideo: false,
      status: 'Active',
      quotaNote: 'Standard Gemini API quota tier with high throughput.',
      recommendedFor: 'AI Production Mode storyboarding and prompt enhancement.',
    },
    {
      id: 'gemini-3.8-flash-lite-tts',
      name: 'Gemini 3.8 Flash Lite TTS',
      provider: 'Google Speech API',
      type: 'Voiceover & Dialogue Synthesizer',
      capabilities: [
        'Studio voiceover generation with 5 distinct personas (Kore, Puck, Fenrir, Zephyr, Charon)',
        'Multi-language dubbing and accent localization (EN, ES, FR, JA, DE)',
        'High-fidelity uncompressed WAV audio output for direct video timeline synchronization',
      ],
      supportedDurations: ['Real-time spoken dialogue up to 120s'],
      maxResolution: '24kHz 16-bit Studio Master WAV',
      aspectRatios: ['Audio Track'],
      audioSupport: true,
      imageToVideo: false,
      videoToVideo: false,
      status: 'Active',
      quotaNote: 'Included with Gemini API key tier.',
      recommendedFor: 'Commercial voiceovers, character dialogue, and documentary narration.',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              AI Video Model Comparison Matrix
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              Transparent Model Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Compare capabilities, maximum duration, resolution, audio synthesis, and quota requirements across the studio's connected foundation models.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <span>Launch Creator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-cyan-500/40 transition-all p-6 flex flex-col justify-between shadow-xl space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{m.status}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{m.type}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-sans">{m.name}</h3>
                <span className="text-xs text-cyan-400 font-mono block mt-0.5">
                  {m.provider}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="p-3.5 rounded-xl bg-[#141525] border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-bold">{m.supportedDurations[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Resolution:</span>
                  <span className="text-white font-bold">{m.maxResolution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Audio Design:</span>
                  <span className={m.audioSupport ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                    {m.audioSupport ? 'Synchronized Audio' : 'No Audio'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Image Reference:</span>
                  <span className={m.imageToVideo ? 'text-cyan-300 font-bold' : 'text-gray-500'}>
                    {m.imageToVideo ? 'Supported (up to 6)' : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Capabilities List */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold block">
                  Core Capabilities
                </span>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {m.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quota Note */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                <strong className="text-white block mb-0.5">Quota &amp; Billing Notice:</strong>
                <p className="text-[11px] text-gray-400 leading-relaxed">{m.quotaNote}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-xs text-gray-400">
              <strong className="text-white block text-[11px] mb-1 font-mono uppercase">
                Best For:
              </strong>
              <p className="text-[11px] leading-relaxed">{m.recommendedFor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
