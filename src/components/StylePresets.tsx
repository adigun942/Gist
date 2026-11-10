import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  Layers,
  ArrowRight,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { StylePreset } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface StylePresetsProps {
  styles: StylePreset[];
  onStylesUpdated: () => void;
  onApplyStyle: (styleName: string, promptModifier?: string, camera?: string) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({
  styles,
  onStylesUpdated,
  onApplyStyle,
  onSelectTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom Style');
  const [description, setDescription] = useState('');
  const [promptModifier, setPromptModifier] = useState('');
  const [cameraMovement, setCameraMovement] = useState('Cinematic Camera Movement');
  const [lightingPrompt, setLightingPrompt] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !promptModifier.trim()) return;

    try {
      setIsSaving(true);
      await api.saveStyle({
        name: name.trim(),
        category,
        description: description.trim(),
        promptModifier: promptModifier.trim(),
        cameraMovement,
        lightingPrompt,
        colorPalette,
        aspectRatio,
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setPromptModifier('');
      onStylesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save custom style preset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStyle = async (id: string, styleName: string) => {
    if (!confirm(`Are you sure you want to remove style "${styleName}"?`)) return;
    try {
      await api.deleteStyle(id);
      onStylesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete style');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Video Style Presets &amp; Aesthetics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {styles.length} Cinematic Styles
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Production-tested aesthetic formulas spanning Chinese Kung Fu Cinema, Hollywood, Luxury Commercial, UGC realism, and anime.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Style</span>
        </button>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map((s) => (
          <div
            key={s.id}
            className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all p-5 flex flex-col justify-between shadow-lg space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
                  {s.category}
                </span>
                {s.isCustom && (
                  <span className="text-[10px] text-cyan-400 font-mono">Custom Preset</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-sans">
                  {s.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                  {s.description}
                </p>
              </div>

              {/* Style Recipe Specifications */}
              <div className="space-y-2 text-[11px] font-mono">
                {s.lightingPrompt && (
                  <div className="p-2.5 rounded-lg bg-[#141525] border border-white/5 space-y-0.5">
                    <span className="text-gray-500 block text-[9px] uppercase">LIGHTING SPEC</span>
                    <span className="text-gray-300 block leading-tight">{s.lightingPrompt}</span>
                  </div>
                )}
                {s.colorPalette && (
                  <div className="p-2.5 rounded-lg bg-[#141525] border border-white/5 space-y-0.5">
                    <span className="text-gray-500 block text-[9px] uppercase">COLOR PALETTE</span>
                    <span className="text-cyan-300 block leading-tight">{s.colorPalette}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => {
                  onApplyStyle(s.name, s.promptModifier, s.cameraMovement);
                  onSelectTab('create');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 text-xs font-semibold hover:brightness-125 border border-cyan-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply to Creator</span>
              </button>

              {s.isCustom && (
                <button
                  onClick={() => handleDeleteStyle(s.id, s.name)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Custom Style"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Style Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e0f18] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
              <Palette className="w-5 h-5 text-purple-400" />
              <span>Create Custom Video Style Preset</span>
            </h3>

            <form onSubmit={handleCreateStyle} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Style Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neo-Noir Detective Rain"
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmospheric rain-slicked city streets with high contrast..."
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Prompt Modifier Formula *</label>
                <textarea
                  rows={3}
                  required
                  value={promptModifier}
                  onChange={(e) => setPromptModifier(e.target.value)}
                  placeholder="Injected prompt directives: e.g. Shot on 35mm monochrome with anamorphic lens flares, harsh shadows, Venetian blind rim lights..."
                  className="w-full p-3 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Lighting Spec</label>
                  <input
                    type="text"
                    value={lightingPrompt}
                    onChange={(e) => setLightingPrompt(e.target.value)}
                    placeholder="e.g. Chiaroscuro backlighting"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Color Palette</label>
                  <input
                    type="text"
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    placeholder="e.g. Obsidian, Silver, Amber"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Style Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
