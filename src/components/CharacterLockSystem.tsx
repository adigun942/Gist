import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  X,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { CharacterItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface CharacterLockSystemProps {
  characters: CharacterItem[];
  onCharactersUpdated: () => void;
  onSelectTab: (tab: NavTab) => void;
  onUseCharacterInCreator?: (character: CharacterItem) => void;
}

export const CharacterLockSystem: React.FC<CharacterLockSystemProps> = ({
  characters,
  onCharactersUpdated,
  onSelectTab,
  onUseCharacterInCreator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [facialDescription, setFacialDescription] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [hairstyle, setHairstyle] = useState('');
  const [clothing, setClothing] = useState('');
  const [bodyAppearance, setBodyAppearance] = useState('');
  const [characterNotes, setCharacterNotes] = useState('');
  const [referenceImages, setReferenceImages] = useState<
    Array<{ id: string; data: string; mimeType: string; label: string }>
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreateModal = () => {
    setEditingCharacter(null);
    setName('');
    setFacialDescription('');
    setSkinTone('');
    setHairstyle('');
    setClothing('');
    setBodyAppearance('');
    setCharacterNotes('');
    setReferenceImages([]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (char: CharacterItem) => {
    setEditingCharacter(char);
    setName(char.name);
    setFacialDescription(char.facialDescription);
    setSkinTone(char.skinTone);
    setHairstyle(char.hairstyle);
    setClothing(char.clothing);
    setBodyAppearance(char.bodyAppearance);
    setCharacterNotes(char.characterNotes || '');
    setReferenceImages(char.referenceImages || []);
    setError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setReferenceImages((prev) => [
          ...prev,
          {
            id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            data: base64,
            mimeType: file.type || 'image/jpeg',
            label: 'Face / Identity Reference',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Character name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        name: name.trim(),
        avatarUrl: referenceImages[0]?.data,
        facialDescription: facialDescription.trim(),
        skinTone: skinTone.trim(),
        hairstyle: hairstyle.trim(),
        clothing: clothing.trim(),
        bodyAppearance: bodyAppearance.trim(),
        characterNotes: characterNotes.trim(),
        referenceImages,
      };

      if (editingCharacter) {
        await api.updateCharacter(editingCharacter.id, payload);
      } else {
        await api.saveCharacter(payload);
      }

      onCharactersUpdated();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save character.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete character "${name}"?`)) return;
    try {
      await api.deleteCharacter(id);
      onCharactersUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete character');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Character Lock System
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {characters.length} Registered
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Build and lock persistent AI characters. Facial geometry, skin tone, hairstyle, and attire are preserved across multiple scenes and projects.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Character</span>
        </button>
      </div>

      {/* Character Cards Grid */}
      {characters.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e0f18] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-sans">
              No Characters Created Yet
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Register your first persistent character with facial descriptions, attire, and reference photos to guarantee consistency across clips.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create AI Character</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
            >
              {/* Avatar Header */}
              <div className="relative h-44 bg-gradient-to-br from-[#17142b] via-[#101222] to-[#0c0d18] p-4 flex items-center justify-center overflow-hidden">
                {char.avatarUrl ? (
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-full h-full object-cover rounded-xl border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <span className="text-2xl font-black font-mono">
                      {char.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-400 border border-white/10 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Locked</span>
                  </span>
                </div>
              </div>

              {/* Character Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-sans group-hover:text-cyan-300 transition-colors">
                      {char.name}
                    </h3>
                    <span className="text-[11px] font-mono text-gray-400">
                      {char.referenceImages?.length || 0} Photos
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-mono text-purple-400 text-[11px] uppercase tracking-wider block">
                        Face & Features
                      </span>
                      <p className="text-gray-300 text-[11px] line-clamp-2">
                        {char.facialDescription || 'N/A'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-[#141525] border border-white/5 truncate">
                        <span className="text-gray-500 block text-[9px]">HAIR</span>
                        <span className="text-gray-200 truncate block">{char.hairstyle || 'Default'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#141525] border border-white/5 truncate">
                        <span className="text-gray-500 block text-[9px]">SKIN TONE</span>
                        <span className="text-gray-200 truncate block">{char.skinTone || 'Natural'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-cyan-400 text-[11px] uppercase tracking-wider block">
                        Signature Clothing
                      </span>
                      <p className="text-gray-300 text-[11px] line-clamp-2">
                        {char.clothing || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onUseCharacterInCreator) {
                        onUseCharacterInCreator(char);
                      }
                      onSelectTab('create');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 hover:from-purple-600/50 hover:to-cyan-500/50 text-xs font-semibold border border-cyan-500/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use in Video</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(char)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="Edit Character"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCharacter(char.id, char.name)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Character"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0e0f18] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  {editingCharacter ? 'Edit Character Lock' : 'Register New AI Character'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveCharacter} className="space-y-4">
              {/* Character Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Character Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kaelen Cross"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              {/* Reference Photos Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Reference Photos (Up to 4)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Passed to Veo for visual lock
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {referenceImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl bg-black border border-white/10 overflow-hidden group"
                    >
                      <img src={img.data} alt="Ref" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setReferenceImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 p-1 rounded bg-red-600/80 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {referenceImages.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border border-dashed border-white/20 hover:border-cyan-400/50 bg-[#121322] flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all text-center p-2"
                    >
                      <Upload className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-mono">Upload</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Facial Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Facial Features & Appearance
                </label>
                <textarea
                  rows={2}
                  value={facialDescription}
                  onChange={(e) => setFacialDescription(e.target.value)}
                  placeholder="Sharp angular jawline, piercing sapphire blue eyes, subtle cybernetic seam, 30 years old..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans resize-none"
                />
              </div>

              {/* Skin Tone & Hairstyle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Skin Tone & Complexion
                  </label>
                  <input
                    type="text"
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                    placeholder="e.g. Fair olive, warm golden tan, dewy skin"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Hairstyle & Hair Color
                  </label>
                  <input
                    type="text"
                    value={hairstyle}
                    onChange={(e) => setHairstyle(e.target.value)}
                    placeholder="e.g. Textured dark ash-brown fade, glossy raven waves"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>
              </div>

              {/* Signature Attire & Body Appearance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Signature Clothing & Attire
                  </label>
                  <input
                    type="text"
                    value={clothing}
                    onChange={(e) => setClothing(e.target.value)}
                    placeholder="e.g. Matte-black technical trenchcoat with purple seams"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    Body Build & Posture
                  </label>
                  <input
                    type="text"
                    value={bodyAppearance}
                    onChange={(e) => setBodyAppearance(e.target.value)}
                    placeholder="e.g. Athletic lean build, 6ft 1in, tactical poise"
                    className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              {/* Character Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Director Character Notes
                </label>
                <input
                  type="text"
                  value={characterNotes}
                  onChange={(e) => setCharacterNotes(e.target.value)}
                  placeholder="e.g. Stoic protagonist, walks with disciplined deliberate stride"
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Character'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
