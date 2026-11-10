import React from 'react';
import {
  LayoutDashboard,
  Video,
  Clapperboard,
  Layers,
  Scissors,
  Wand2,
  Mic,
  FolderKanban,
  Users,
  Film,
  FolderOpen,
  BookmarkPlus,
  Palette,
  Cpu,
  Settings,
  KeyRound,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Logo } from './Logo';
import { StudioStatus } from '../types';

export type NavTab =
  | 'dashboard'
  | 'create'
  | 'production-mode'
  | 'batch'
  | 'editor'
  | 'enhancement'
  | 'audio-studio'
  | 'projects'
  | 'character-lock'
  | 'my-videos'
  | 'media-library'
  | 'prompt-library'
  | 'style-presets'
  | 'model-comparison'
  | 'settings'
  | 'api-config';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  status: StudioStatus | null;
  videoCount: number;
  projectCount?: number;
  characterCount?: number;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  status,
  videoCount,
  projectCount = 0,
  characterCount = 0,
  isOpen,
  onCloseMobile,
}) => {
  const sections = [
    {
      title: 'Studio Workspaces',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'create' as NavTab, label: 'Create Video', icon: Video, badge: '15s+ Engine' },
        { id: 'production-mode' as NavTab, label: 'AI Production Mode', icon: Clapperboard, badge: 'Multi-Scene' },
        { id: 'batch' as NavTab, label: 'Batch Generation', icon: Layers, badge: null },
      ],
    },
    {
      title: 'Post-Production',
      items: [
        { id: 'editor' as NavTab, label: 'AI Video Editor', icon: Scissors, badge: 'Timeline' },
        { id: 'enhancement' as NavTab, label: 'Video Enhancement', icon: Wand2, badge: '4K/60fps' },
        { id: 'audio-studio' as NavTab, label: 'Voice & Audio Studio', icon: Mic, badge: 'TTS' },
      ],
    },
    {
      title: 'Assets & Vaults',
      items: [
        { id: 'projects' as NavTab, label: 'My Projects', icon: FolderKanban, badge: projectCount > 0 ? String(projectCount) : null },
        { id: 'character-lock' as NavTab, label: 'Character Lock', icon: Users, badge: characterCount > 0 ? String(characterCount) : null },
        { id: 'my-videos' as NavTab, label: 'My Videos', icon: Film, badge: videoCount > 0 ? String(videoCount) : null },
        { id: 'media-library' as NavTab, label: 'Media Library', icon: FolderOpen, badge: null },
        { id: 'prompt-library' as NavTab, label: 'Prompt Library', icon: BookmarkPlus, badge: null },
        { id: 'style-presets' as NavTab, label: 'Style Presets', icon: Palette, badge: null },
      ],
    },
    {
      title: 'System & Engine',
      items: [
        { id: 'model-comparison' as NavTab, label: 'Model Comparison', icon: Cpu, badge: null },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: null },
        { id: 'api-config' as NavTab, label: 'API Configuration', icon: KeyRound, badge: status?.hasApiKey ? 'Connected' : 'Setup' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0d0e15] border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <Logo size="sm" />
        </div>

        {/* Quick Launch CTA */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onSelectTab('create');
              onCloseMobile();
            }}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-[11px] bg-[#12131f] group-hover:bg-opacity-80 transition-all font-semibold text-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Create AI Video</span>
            </div>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-500 font-semibold">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-950/70 to-cyan-950/40 text-white border border-purple-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-gray-400 group-hover:text-cyan-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : item.badge === 'Connected'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : item.badge === 'Setup'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Zero Watermark Certification */}
        <div className="p-3 mx-2 mb-2 rounded-xl bg-[#12131f] border border-white/5 shrink-0 text-left">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clean Export</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Zero Watermark</span>
          </div>
        </div>
      </aside>
    </>
  );
};
