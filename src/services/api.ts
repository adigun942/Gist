import {
  CharacterItem,
  GenerationRequest,
  MediaItem,
  ProductionProject,
  PromptTemplate,
  StoryboardScene,
  StudioSettings,
  StudioStatus,
  StylePreset,
  VideoItem,
  VoiceoverItem,
} from '../types';

export const api = {
  // Check Studio & API status
  async getStatus(): Promise<StudioStatus> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to retrieve studio status');
    return res.json();
  },

  // Enhance prompt with gemini-3.8-flash
  async enhancePrompt(
    prompt: string,
    style?: string,
    cameraMovement?: string
  ): Promise<string> {
    const res = await fetch('/api/prompt/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, cameraMovement }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to enhance prompt');
    return data.enhancedPrompt;
  },

  // Generate video
  async generateVideo(
    req: GenerationRequest
  ): Promise<{ success: boolean; video: VideoItem }> {
    const res = await fetch('/api/video/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Video generation failed');
    }
    return data;
  },

  // Get all videos
  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch('/api/videos');
    if (!res.ok) throw new Error('Failed to fetch videos');
    const data = await res.json();
    return data.videos || [];
  },

  // Get single video
  async getVideo(id: string): Promise<VideoItem> {
    const res = await fetch(`/api/videos/${id}`);
    if (!res.ok) throw new Error('Failed to fetch video');
    const data = await res.json();
    return data.video;
  },

  // Delete video
  async deleteVideo(id: string): Promise<void> {
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
  },

  // Download URL
  getDownloadUrl(id: string): string {
    return `/api/videos/download/${id}`;
  },

  // Upload reference media
  async uploadMedia(params: {
    fileData: string;
    fileName: string;
    mimeType: string;
    type: 'image' | 'video';
    label?: string;
  }): Promise<MediaItem> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload media');
    return data.media;
  },

  // Get Media Library
  async getMediaLibrary(): Promise<MediaItem[]> {
    const res = await fetch('/api/media');
    if (!res.ok) throw new Error('Failed to fetch media library');
    const data = await res.json();
    return data.media || [];
  },

  // Delete media
  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete media item');
  },

  // Prompts
  async getPrompts(): Promise<PromptTemplate[]> {
    const res = await fetch('/api/prompts');
    if (!res.ok) throw new Error('Failed to fetch prompts');
    const data = await res.json();
    return data.prompts || [];
  },

  async savePrompt(promptData: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save prompt');
    return data.prompt;
  },

  async deletePrompt(id: string): Promise<void> {
    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete prompt');
  },

  // Settings
  async getSettings(): Promise<StudioSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.settings || {};
  },

  async saveSettings(settings: Partial<StudioSettings>): Promise<StudioSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save settings');
    return data.settings;
  },

  // -----------------------------------------------------------
  // Advanced Features API
  // -----------------------------------------------------------

  // 1. Character Lock System
  async getCharacters(): Promise<CharacterItem[]> {
    const res = await fetch('/api/characters');
    if (!res.ok) throw new Error('Failed to fetch characters');
    const data = await res.json();
    return data.characters || [];
  },

  async saveCharacter(characterData: Partial<CharacterItem>): Promise<CharacterItem> {
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(characterData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save character');
    return data.character;
  },

  async updateCharacter(id: string, updates: Partial<CharacterItem>): Promise<CharacterItem> {
    const res = await fetch(`/api/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update character');
    return data.character;
  },

  async deleteCharacter(id: string): Promise<void> {
    const res = await fetch(`/api/characters/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete character');
  },

  // 2. AI Production Mode (Storyboarding & Stitching)
  async generateStoryboard(params: {
    concept: string;
    genre?: string;
    style?: string;
    characterIds?: string[];
    numScenes?: number;
  }): Promise<StoryboardScene[]> {
    const res = await fetch('/api/production/storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate storyboard');
    return data.scenes || [];
  },

  async stitchScenes(params: {
    projectId?: string;
    clipVideoIds: string[];
    title?: string;
  }): Promise<VideoItem> {
    const res = await fetch('/api/production/stitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to stitch production scenes');
    return data.masterVideo;
  },

  // 3. AI Voice and Audio Studio
  async generateVoiceover(params: {
    text: string;
    title?: string;
    voice?: string;
    language?: string;
    style?: string;
  }): Promise<VoiceoverItem> {
    const res = await fetch('/api/audio/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate voiceover');
    return data.audio;
  },

  async getAudioList(): Promise<VoiceoverItem[]> {
    const res = await fetch('/api/audio');
    if (!res.ok) throw new Error('Failed to fetch audio list');
    const data = await res.json();
    return data.audio || [];
  },

  // 4. Video Editor Export
  async exportTimeline(params: {
    title: string;
    clips: any[];
    audioTracks?: any[];
    textOverlays?: any[];
    aspectRatio?: string;
    resolution?: string;
  }): Promise<VideoItem> {
    const res = await fetch('/api/editor/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to export timeline video');
    return data.video;
  },

  // 5. Video Enhancement
  async enhanceVideo(params: {
    videoId: string;
    toolType: 'upscale' | 'interpolate_fps' | 'stabilize' | 'color_lut' | 'audio_enhance';
    lutPreset?: string;
    targetResolution?: string;
    targetFps?: number;
  }): Promise<VideoItem> {
    const res = await fetch('/api/enhance/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process enhancement');
    return data.video;
  },

  // 6. Social Media Export
  async exportSocial(params: {
    videoId: string;
    platform: 'youtube' | 'tiktok' | 'reels' | 'square' | 'facebook';
  }): Promise<VideoItem> {
    const res = await fetch('/api/export/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to export social media video');
    return data.video;
  },

  // 7. Video Style Presets
  async getStyles(): Promise<StylePreset[]> {
    const res = await fetch('/api/styles');
    if (!res.ok) throw new Error('Failed to fetch styles');
    const data = await res.json();
    return data.styles || [];
  },

  async saveStyle(styleData: Partial<StylePreset>): Promise<StylePreset> {
    const res = await fetch('/api/styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(styleData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save style preset');
    return data.style;
  },

  async deleteStyle(id: string): Promise<void> {
    const res = await fetch(`/api/styles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete style');
  },

  // 8. Batch Video Generation
  async generateBatch(params: {
    prompt: string;
    aspectRatio?: string;
    duration?: string;
    count?: number;
  }): Promise<any[]> {
    const res = await fetch('/api/video/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate batch variations');
    return data.variations || [];
  },

  // 9. Project Management
  async getProjects(): Promise<ProductionProject[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return data.projects || [];
  },

  async createProject(data: Partial<ProductionProject>): Promise<ProductionProject> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!resData.success) throw new Error(resData.error || 'Failed to create project');
    return resData.project;
  },

  async updateProject(id: string, updates: Partial<ProductionProject>): Promise<ProductionProject> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update project');
    return data.project;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },
};
