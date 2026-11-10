import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Download,
  Plus,
  Music,
  Radio,
  RefreshCw,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { VoiceoverItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface AIVoiceStudioProps {
  audioList: VoiceoverItem[];
  onAudioUpdated: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const AIVoiceStudio: React.FC<AIVoiceStudioProps> = ({
  audioList,
  onAudioUpdated,
  onSelectTab,
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState<'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'>('Kore');
  const [language, setLanguage] = useState('en-US');
  const [style, setStyle] = useState('Cinematic Film Narrator');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const voiceOptions = [
    { name: 'Kore', gender: 'Female', tone: 'Rich, cinematic, expressive narrator' },
    { name: 'Puck', gender: 'Male', tone: 'Warm, dynamic, engaging storyteller' },
    { name: 'Fenrir', gender: 'Male', tone: 'Deep, resonant, dramatic blockbuster trailer voice' },
    { name: 'Zephyr', gender: 'Female', tone: 'Crisp, articulate commercial spokesperson' },
    { name: 'Charon', gender: 'Male', tone: 'Authoritative, calm documentary narrator' },
  ];

  const stylePresets = [
    'Cinematic Film Narrator',
    'Epic Movie Trailer Voice',
    'Luxury Commercial Spokesperson',
    'Documentary Naturalist',
    'Sci-Fi Cybernetic AI Voice',
    'Dramatic Character Dialogue',
  ];

  const languages = [
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'es-ES', name: 'Spanish (Castilian)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'de-DE', name: 'German' },
  ];

  const handleGenerateVoiceover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter voiceover script or dialogue.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      await api.generateVoiceover({
        text: text.trim(),
        title: title.trim() || `Voiceover: ${text.slice(0, 25)}...`,
        voice,
        language,
        style,
      });
      setText('');
      setTitle('');
      onAudioUpdated();
    } catch (err: any) {
      setError(err.message || 'Voiceover generation failed.');
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
            <Mic className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              AI Voice and Audio Studio
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              Powered by gemini-3.8-flash-lite-tts
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generate cinematic voiceovers, dramatic character dialogue, and acoustic atmospheric soundbeds for your video productions.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('editor' as any)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold self-start sm:self-auto"
        >
          <span>Open Video Editor</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs animate-fadeIn">
          {error}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Voiceover Generator Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form
            onSubmit={handleGenerateVoiceover}
            className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Generate AI Voiceover</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Track Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro Scene Voiceover - Neo Tokyo Arc"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Voice Selection Cards */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
                Select AI Voice Persona
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {voiceOptions.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setVoice(v.name as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      voice === v.name
                        ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#141525] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold font-mono">
                      <span>{v.name}</span>
                      <span className="text-[10px] text-cyan-400 font-normal">{v.gender}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {v.tone}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Tone Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Language &amp; Accent
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121320]">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Narrative Tone Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-sans"
                >
                  {stylePresets.map((s) => (
                    <option key={s} value={s} className="bg-[#121320]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Script Textarea */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Spoken Dialogue / Script *
              </label>
              <textarea
                rows={4}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter character dialogue or cinematic narration: e.g. In a city where memory is currency, one operative dared to remember the truth..."
                className="w-full p-3.5 rounded-xl bg-[#121322] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 leading-relaxed font-sans resize-y"
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
                    <span>Synthesizing Voice...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Generate AI Voiceover</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Audio Library (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Audio Library ({audioList.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-500">WAV Uncompressed</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {audioList.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500 space-y-2">
                  <Mic className="w-8 h-8 mx-auto text-gray-600" />
                  <p>No audio files generated yet. Generate your first voiceover on the left.</p>
                </div>
              ) : (
                audioList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#141525] border border-white/5 hover:border-purple-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {item.voice} • {item.durationSec}s
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2 italic">
                      "{item.text}"
                    </p>

                    <audio src={item.audioUrl} controls className="w-full h-8 pt-1" />

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-mono">{item.style}</span>
                      <a
                        href={item.audioUrl}
                        download={`${item.title}.wav`}
                        className="text-cyan-400 hover:underline font-mono flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
