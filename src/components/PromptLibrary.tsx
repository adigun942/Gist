import React, { useState } from 'react';
import {
  BookmarkPlus,
  Search,
  Folder,
  FolderPlus,
  Copy,
  Check,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Clock,
  Camera,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { PromptTemplate } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface PromptLibraryProps {
  prompts: PromptTemplate[];
  onPromptsUpdated: () => void;
  onApplyPrompt: (prompt: string, style?: string, camera?: string) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  prompts,
  onPromptsUpdated,
  onApplyPrompt,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New prompt modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newNegative, setNewNegative] = useState('');
  const [newStyle, setNewStyle] = useState('Cinematic');
  const [newCamera, setNewCamera] = useState('Cinematic Camera Movement');
  const [newFolder, setNewFolder] = useState('General');
  const [isSaving, setIsSaving] = useState(false);

  // Extract unique folders
  const folders = Array.from(
    new Set(['General', 'Sci-Fi & Cyberpunk', 'Commercial Ads', 'Cinematic Landscapes', ...prompts.map((p) => p.folder || 'General')])
  );

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || (p.folder || 'General') === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await api.deletePrompt(id);
      onPromptsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete prompt');
    }
  };

  const handleSaveNewPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    try {
      setIsSaving(true);
      await api.savePrompt({
        title: newTitle.trim() || 'Prompt ' + (prompts.length + 1),
        prompt: newPrompt.trim(),
        negativePrompt: newNegative.trim(),
        style: newStyle,
        cameraMovement: newCamera,
        folder: newFolder,
        aspectRatio: '16:9',
        duration: '15s',
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewPrompt('');
      onPromptsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              Prompt Library &amp; Recipe Vault
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              {prompts.length} Saved
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Organize successful generation prompts into thematic folders, reuse cinematic camera recipes, and search previous scripts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Save New Prompt</span>
        </button>
      </div>

      {/* Folder Tabs & Search Bar */}
      <div className="p-4 rounded-xl bg-[#0e0f18] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Folder Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
              selectedFolder === 'all'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-[#141525] text-gray-400 hover:text-white'
            }`}
          >
            All Folders ({prompts.length})
          </button>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1.5 ${
                selectedFolder === f
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#141525] text-gray-400 hover:text-white'
              }`}
            >
              <Folder className="w-3 h-3 text-cyan-400" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompts or tags..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e0f18] border border-white/10 text-center space-y-3">
          <BookmarkPlus className="w-8 h-8 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Prompts Found</h3>
          <p className="text-xs text-gray-400">
            Save successful prompts during generation or click "+ Save New Prompt" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((p) => {
            const isCopied = copiedId === p.id;
            return (
              <div
                key={p.id}
                className="rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-purple-500/40 transition-all p-5 flex flex-col justify-between shadow-lg group space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {p.folder || 'General'}
                    </span>
                    <span className="text-cyan-400">{p.style}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-sans">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-4 bg-black/25 p-3 rounded-lg border border-white/5">
                    {p.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onApplyPrompt(p.prompt, p.style, p.cameraMovement);
                      onSelectTab('create');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 text-xs font-semibold hover:brightness-125 border border-cyan-500/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use in Studio</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(p.id, p.prompt)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Copy Prompt"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Prompt"
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

      {/* Add New Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0e0f18] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
              <BookmarkPlus className="w-5 h-5 text-cyan-400" />
              <span>Save New Prompt to Vault</span>
            </h3>

            <form onSubmit={handleSaveNewPrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hong Kong Rain Slick Car Chase"
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Folder Category</label>
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="e.g. Sci-Fi & Cyberpunk, Commercials"
                  className="w-full px-3 py-2 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Prompt Text *</label>
                <textarea
                  rows={4}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter full cinematic prompt..."
                  className="w-full p-3 rounded-xl bg-[#141525] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none font-sans"
                />
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
                  {isSaving ? 'Saving...' : 'Save Prompt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
