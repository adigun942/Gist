import React from 'react';
import {
  FolderKanban,
  Plus,
  Clapperboard,
  Clock,
  Play,
  Trash2,
  ArrowRight,
  Film,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { ProductionProject, VideoItem } from '../types';
import { api } from '../services/api';
import { NavTab } from './Sidebar';

interface MyProjectsProps {
  projects: ProductionProject[];
  onProjectsUpdated: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const MyProjects: React.FC<MyProjectsProps> = ({
  projects,
  onProjectsUpdated,
  onSelectTab,
  onSelectVideo,
}) => {
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await api.deleteProject(id);
      onProjectsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              My Projects &amp; Productions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              {projects.length} Saved
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage your end-to-end video projects, multi-scene storyboards, cast assignments, timeline states, and master exports. Reopen any project to continue where you left off.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('production-mode' as any)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Production</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e0f18] border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-sans">
              No Projects Saved Yet
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Create an AI Production project to generate multi-scene cinematic films with automated storyboards and character locks.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('production-mode' as any)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition-all"
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Launch AI Production Mode</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const formattedDate = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const scenesCount = proj.scenes?.length || 0;
            const completedCount = proj.scenes?.filter((s) => s.status === 'completed').length || 0;

            return (
              <div
                key={proj.id}
                className="group rounded-2xl bg-[#0e0f18] border border-white/10 hover:border-cyan-500/40 transition-all p-5 flex flex-col justify-between shadow-lg space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {proj.genre || 'Cinematic'}
                    </span>
                    <span className="text-gray-400">{formattedDate}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-sans line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.concept}
                    </p>
                  </div>

                  {/* Production Stats Pill */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-lg bg-[#141525] border border-white/5">
                      <span className="text-gray-500 block text-[9px]">SCENES</span>
                      <span className="text-white block font-bold">
                        {completedCount} / {scenesCount} Rendered
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141525] border border-white/5">
                      <span className="text-gray-500 block text-[9px]">STYLE</span>
                      <span className="text-cyan-400 block truncate font-bold">
                        {proj.style}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => onSelectTab('production-mode' as any)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
