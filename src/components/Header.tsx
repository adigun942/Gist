import React from 'react';
import { Menu, Sparkles, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudioStatus } from '../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  status: StudioStatus | null;
  onSelectTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  status,
  onSelectTab,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Studio Dashboard';
      case 'create':
        return 'Create AI Video';
      case 'production-mode':
        return 'AI Production Mode (Storyboarding)';
      case 'batch':
        return 'Batch Video Generation';
      case 'editor':
        return 'AI Video Editor';
      case 'enhancement':
        return 'Video Enhancement & Social Suite';
      case 'audio-studio':
        return 'AI Voice and Audio Studio';
      case 'projects':
        return 'My Projects & Productions';
      case 'character-lock':
        return 'Character Lock System';
      case 'my-videos':
        return 'My Video Library';
      case 'media-library':
        return 'Reference Media Library';
      case 'prompt-library':
        return 'Prompt Library & Vault';
      case 'style-presets':
        return 'Video Style Presets';
      case 'model-comparison':
        return 'AI Video Model Comparison Matrix';
      case 'settings':
        return 'Studio Settings';
      case 'api-config':
        return 'API Configuration & Engine';
      default:
        return 'S.O ADIGUN AI Video Studio';
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0b12]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-white font-sans tracking-wide">
            {getTabTitle(currentTab)}
          </h1>
          <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
            S.O ADIGUN • Production Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Zero Watermark Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Zero Watermarks</span>
        </div>

        {/* 15s Minimum badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
          <span>Min 15s Clips</span>
        </div>

        {/* API Status Pill */}
        <button
          onClick={() => onSelectTab('api-config')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            status?.hasApiKey
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-400 hover:bg-amber-900/40 animate-pulse'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {status?.hasApiKey ? 'Veo Engine Connected' : 'Configure API Key'}
          </span>
          <span className="sm:hidden">
            {status?.hasApiKey ? 'Online' : 'Key'}
          </span>
        </button>

        {/* Quick Create CTA */}
        {currentTab !== 'create' && (
          <button
            onClick={() => onSelectTab('create')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:brightness-110 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Video</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>
    </header>
  );
};
