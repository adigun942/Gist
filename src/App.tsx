/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreateVideo } from './components/CreateVideo';
import { AIProductionMode } from './components/AIProductionMode';
import { BatchGeneration } from './components/BatchGeneration';
import { AIVideoEditor } from './components/AIVideoEditor';
import { VideoEnhancement } from './components/VideoEnhancement';
import { AIVoiceStudio } from './components/AIVoiceStudio';
import { MyProjects } from './components/MyProjects';
import { CharacterLockSystem } from './components/CharacterLockSystem';
import { MyVideos } from './components/MyVideos';
import { MediaLibrary } from './components/MediaLibrary';
import { PromptLibrary } from './components/PromptLibrary';
import { StylePresets } from './components/StylePresets';
import { ModelComparison } from './components/ModelComparison';
import { Settings } from './components/Settings';
import { ApiConfig } from './components/ApiConfig';
import { VideoModal } from './components/VideoModal';
import {
  CharacterItem,
  MediaItem,
  ProductionProject,
  PromptTemplate,
  StudioSettings,
  StudioStatus,
  StylePreset,
  VideoItem,
  VoiceoverItem,
} from './types';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App Data State
  const [status, setStatus] = useState<StudioStatus | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [projects, setProjects] = useState<ProductionProject[]>([]);
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [audioList, setAudioList] = useState<VoiceoverItem[]>([]);

  // Active Video Modal
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Prompt / Style / Character pre-population for Create Video
  const [promptToApply, setPromptToApply] = useState<{
    prompt: string;
    style?: string;
    camera?: string;
  }>({ prompt: '' });

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      const [
        statusRes,
        videosRes,
        promptsRes,
        mediaRes,
        settingsRes,
        charsRes,
        projsRes,
        stylesRes,
        audioRes,
      ] = await Promise.allSettled([
        api.getStatus(),
        api.getVideos(),
        api.getPrompts(),
        api.getMediaLibrary(),
        api.getSettings(),
        api.getCharacters(),
        api.getProjects(),
        api.getStyles(),
        api.getAudioList(),
      ]);

      if (statusRes.status === 'fulfilled') setStatus(statusRes.value);
      if (videosRes.status === 'fulfilled') setVideos(videosRes.value);
      if (promptsRes.status === 'fulfilled') setPrompts(promptsRes.value);
      if (mediaRes.status === 'fulfilled') setMedia(mediaRes.value);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
      if (charsRes.status === 'fulfilled') setCharacters(charsRes.value);
      if (projsRes.status === 'fulfilled') setProjects(projsRes.value);
      if (stylesRes.status === 'fulfilled') setStyles(stylesRes.value);
      if (audioRes.status === 'fulfilled') setAudioList(audioRes.value);
    } catch (err) {
      console.error('Error fetching studio data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApplyPrompt = (prompt: string, style?: string, camera?: string) => {
    setPromptToApply({ prompt, style, camera });
    setCurrentTab('create');
  };

  const handleApplyStyle = (styleName: string, promptModifier?: string, camera?: string) => {
    setPromptToApply((prev) => ({
      prompt: promptModifier ? `${prev.prompt ? prev.prompt + '. ' : ''}${promptModifier}` : prev.prompt,
      style: styleName,
      camera: camera || prev.camera,
    }));
    setCurrentTab('create');
  };

  const handleUseCharacter = (character: CharacterItem) => {
    const charPrompt = `Featuring ${character.name}: ${character.facialDescription}. Attire: ${character.clothing}. Hair: ${character.hairstyle}. Skin tone: ${character.skinTone}.`;
    setPromptToApply((prev) => ({
      ...prev,
      prompt: prev.prompt ? `${prev.prompt}\n\n${charPrompt}` : charPrompt,
    }));
    setCurrentTab('create');
  };

  const handleVideoGenerated = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedVideo?.id === id) setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-gray-100 flex font-sans selection:bg-purple-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        status={status}
        videoCount={videos.length}
        projectCount={projects.length}
        characterCount={characters.length}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          status={status}
          onSelectTab={setCurrentTab}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* 1. Dashboard */}
          {currentTab === 'dashboard' && (
            <Dashboard
              status={status}
              videos={videos}
              prompts={prompts}
              media={media}
              onSelectTab={setCurrentTab}
              onSelectVideo={setSelectedVideo}
              onApplyPrompt={handleApplyPrompt}
            />
          )}

          {/* 2. Create Video Workstation */}
          {currentTab === 'create' && (
            <CreateVideo
              status={status}
              settings={settings}
              onVideoGenerated={handleVideoGenerated}
              onSelectVideo={setSelectedVideo}
              initialPrompt={promptToApply.prompt}
              initialStyle={promptToApply.style}
              initialCamera={promptToApply.camera}
            />
          )}

          {/* 3. AI Production Mode (Storyboarding & Multi-Scene) */}
          {currentTab === 'production-mode' && (
            <AIProductionMode
              characters={characters}
              projects={projects}
              onProjectsUpdated={async () => {
                const res = await api.getProjects();
                setProjects(res);
              }}
              onSelectVideo={setSelectedVideo}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 4. Batch Video Generation */}
          {currentTab === 'batch' && (
            <BatchGeneration
              onVideoSelected={setSelectedVideo}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 5. AI Video Editor */}
          {currentTab === 'editor' && (
            <AIVideoEditor
              videos={videos}
              audioList={audioList}
              onSelectTab={setCurrentTab}
              onVideoExported={handleVideoGenerated}
            />
          )}

          {/* 6. Video Enhancement & Social Suite */}
          {currentTab === 'enhancement' && (
            <VideoEnhancement
              videos={videos}
              onVideoEnhanced={handleVideoGenerated}
              onSelectVideo={setSelectedVideo}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 7. AI Voice and Audio Studio */}
          {currentTab === 'audio-studio' && (
            <AIVoiceStudio
              audioList={audioList}
              onAudioUpdated={async () => {
                const res = await api.getAudioList();
                setAudioList(res);
              }}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 8. My Projects */}
          {currentTab === 'projects' && (
            <MyProjects
              projects={projects}
              onProjectsUpdated={async () => {
                const res = await api.getProjects();
                setProjects(res);
              }}
              onSelectTab={setCurrentTab}
              onSelectVideo={setSelectedVideo}
            />
          )}

          {/* 9. Character Lock System */}
          {currentTab === 'character-lock' && (
            <CharacterLockSystem
              characters={characters}
              onCharactersUpdated={async () => {
                const res = await api.getCharacters();
                setCharacters(res);
              }}
              onSelectTab={setCurrentTab}
              onUseCharacterInCreator={handleUseCharacter}
            />
          )}

          {/* 10. My Videos Library */}
          {currentTab === 'my-videos' && (
            <MyVideos
              videos={videos}
              onSelectVideo={setSelectedVideo}
              onDeleteVideo={handleDeleteVideo}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 11. Reference Media Library */}
          {currentTab === 'media-library' && (
            <MediaLibrary
              media={media}
              onMediaUpdated={async () => {
                const res = await api.getMediaLibrary();
                setMedia(res);
              }}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 12. Prompt Library & Vault */}
          {currentTab === 'prompt-library' && (
            <PromptLibrary
              prompts={prompts}
              onPromptsUpdated={async () => {
                const res = await api.getPrompts();
                setPrompts(res);
              }}
              onApplyPrompt={handleApplyPrompt}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 13. Style Presets */}
          {currentTab === 'style-presets' && (
            <StylePresets
              styles={styles}
              onStylesUpdated={async () => {
                const res = await api.getStyles();
                setStyles(res);
              }}
              onApplyStyle={handleApplyStyle}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 14. Model Comparison */}
          {currentTab === 'model-comparison' && (
            <ModelComparison onSelectTab={setCurrentTab} />
          )}

          {/* 15. Settings */}
          {currentTab === 'settings' && (
            <Settings
              settings={settings}
              onSettingsSaved={(newSettings) => setSettings(newSettings)}
            />
          )}

          {/* 16. API Configuration */}
          {currentTab === 'api-config' && (
            <ApiConfig
              status={status}
              onRefreshStatus={async () => {
                const res = await api.getStatus();
                setStatus(res);
              }}
            />
          )}
        </main>
      </div>

      {/* High-Resolution Video Cinema Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onDelete={handleDeleteVideo}
      />
    </div>
  );
}
