import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Check,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Camera,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { api } from '../services/api';

interface SettingsProps {
  settings: StudioSettings | null;
  onSettingsSaved: (newSettings: StudioSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsSaved,
}) => {
  const [defaultDuration, setDefaultDuration] = useState(settings?.defaultDuration || '15s');
  const [defaultAspectRatio, setDefaultAspectRatio] = useState(settings?.defaultAspectRatio || '16:9');
  const [defaultResolution, setDefaultResolution] = useState(settings?.defaultResolution || '1080p');
  const [defaultStyle, setDefaultStyle] = useState(settings?.defaultStyle || 'Cinematic');
  const [defaultCamera, setDefaultCamera] = useState(
    settings?.defaultCamera || 'Cinematic Camera Movement'
  );
  const [generateAudio, setGenerateAudio] = useState(settings?.generateAudio ?? true);
  const [autoStitch, setAutoStitch] = useState(settings?.autoStitchForLongDurations ?? true);
  const [customInstructions, setCustomInstructions] = useState(settings?.customInstructions || '');
  const [downloadPattern, setDownloadPattern] = useState(
    settings?.downloadNamingPattern || 'SO_ADIGUN_[title]_[id]'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await api.saveSettings({
        defaultDuration,
        defaultAspectRatio,
        defaultResolution,
        defaultStyle,
        defaultCamera,
        generateAudio,
        autoStitchForLongDurations: autoStitch,
        customInstructions,
        downloadNamingPattern: downloadPattern,
      });
      onSettingsSaved(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Studio Settings
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Configure default generation parameters, audio defaults, duration constraints, and export patterns.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Defaults Section */}
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Default Video Generation Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Default Duration */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Default Duration (Min 15s)
              </label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="15s" className="bg-[#121320]">15 Seconds (Standard Single-Op)</option>
                <option value="20s" className="bg-[#121320]">20 Seconds (Extended)</option>
                <option value="30s" className="bg-[#121320]">30 Seconds (Multi-Clip Production)</option>
              </select>
            </div>

            {/* Default Aspect Ratio */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Default Aspect Ratio
              </label>
              <select
                value={defaultAspectRatio}
                onChange={(e) => setDefaultAspectRatio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
              >
                <option value="16:9" className="bg-[#121320]">16:9 Landscape</option>
                <option value="9:16" className="bg-[#121320]">9:16 Portrait</option>
                <option value="1:1" className="bg-[#121320]">1:1 Square</option>
              </select>
            </div>

            {/* Default Resolution */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Default Quality
              </label>
              <select
                value={defaultResolution}
                onChange={(e) => setDefaultResolution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="1080p" className="bg-[#121320]">1080p Full HD</option>
                <option value="720p" className="bg-[#121320]">720p HD</option>
                <option value="4k" className="bg-[#121320]">4K Ultra HD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Default Visual Style
              </label>
              <input
                type="text"
                value={defaultStyle}
                onChange={(e) => setDefaultStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Default Camera Movement
              </label>
              <input
                type="text"
                value={defaultCamera}
                onChange={(e) => setDefaultCamera(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Toggles & Behavior */}
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Audio & Stitching Behavior</span>
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141525] border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Generate Audio by Default</div>
              <div className="text-[11px] text-gray-400">Synthesize synchronized acoustic environmental sound effects</div>
            </div>
            <input
              type="checkbox"
              checked={generateAudio}
              onChange={(e) => setGenerateAudio(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded bg-[#10111e] border-gray-600 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141525] border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Automatic Multi-Clip Stitching</div>
              <div className="text-[11px] text-gray-400">Automatically stitch seamless continuations to reach 20s–30s durations</div>
            </div>
            <input
              type="checkbox"
              checked={autoStitch}
              onChange={(e) => setAutoStitch(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded bg-[#10111e] border-gray-600 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Download File Naming */}
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Download & Watermark Policy</span>
          </h3>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
              Export File Naming Pattern
            </label>
            <input
              type="text"
              value={downloadPattern}
              onChange={(e) => setDownloadPattern(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Supports [title], [id], [timestamp]. Downloaded files are completely clean MP4 files without watermarks.
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving Settings...' : 'Save Studio Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
