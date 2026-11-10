export interface VideoItem {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  duration: string;
  aspectRatio: string;
  resolution: string;
  dimensions?: string;
  style: string;
  cameraMovement: string;
  hasAudio: boolean;
  watermark: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  fileSizeBytes: number;
  referenceImagesCount?: number;
  createdAt: string;
  interactionId?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  label: string;
  mimeType: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  cameraMovement: string;
  aspectRatio: string;
  duration: string;
  folder?: string;
  createdAt: string;
}

export interface StudioSettings {
  defaultDuration: string;
  defaultAspectRatio: string;
  defaultResolution: string;
  defaultStyle: string;
  defaultCamera: string;
  generateAudio: boolean;
  autoStitchForLongDurations: boolean;
  customInstructions: string;
  downloadNamingPattern: string;
}

export interface StudioStatus {
  status: string;
  studioName: string;
  hasApiKey: boolean;
  videoModel: string;
  promptEnhancerModel: string;
  watermarkPolicy: string;
  supportedDurations: string[];
  minimumDuration: string;
  ffmpegReady: boolean;
}

export interface GenerationRequest {
  title?: string;
  prompt: string;
  negativePrompt?: string;
  duration: string;
  aspectRatio: string;
  resolution: string;
  style: string;
  cameraMovement: string;
  audio: boolean;
  referenceImages?: Array<{
    data: string;
    mimeType: string;
    label?: string;
  }>;
  referenceVideo?: {
    data: string;
    mimeType: string;
  } | null;
}

// -------------------------------------------------------------
// Advanced Features Types
// -------------------------------------------------------------

export interface CharacterItem {
  id: string;
  name: string;
  avatarUrl?: string;
  referenceImages: Array<{
    id: string;
    data: string;
    mimeType: string;
    label: string;
  }>;
  facialDescription: string;
  skinTone: string;
  hairstyle: string;
  clothing: string;
  bodyAppearance: string;
  characterNotes?: string;
  createdAt: string;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;
  characterNames: string[];
  visualPrompt: string;
  cameraMovement: string;
  estimatedDuration: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  clipVideoId?: string;
  clipVideoUrl?: string;
  error?: string;
}

export interface ProductionProject {
  id: string;
  title: string;
  concept: string;
  genre: string;
  style: string;
  aspectRatio: string;
  scenes: StoryboardScene[];
  characterIds: string[];
  masterVideoId?: string;
  masterVideoUrl?: string;
  masterDuration?: string;
  status: 'draft' | 'storyboarded' | 'generating' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  position: 'top' | 'center' | 'bottom';
  color: string;
  fontSize: number;
}

export interface EditorClip {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  volume: number;
  transition: 'none' | 'dissolve' | 'fade_black' | 'wipe';
}

export interface EditorAudioTrack {
  id: string;
  audioUrl: string;
  name: string;
  startTime: number;
  duration: number;
  volume: number;
}

export interface SubtitleItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface EditorProjectState {
  id: string;
  title: string;
  aspectRatio: string;
  resolution: string;
  clips: EditorClip[];
  audioTracks: EditorAudioTrack[];
  textOverlays: TextOverlay[];
  subtitles: SubtitleItem[];
  masterDuration: number;
  exportedVideoUrl?: string;
  updatedAt: string;
}

export interface VoiceoverItem {
  id: string;
  title: string;
  text: string;
  voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  language: string;
  style: string;
  audioUrl: string;
  durationSec: number;
  createdAt: string;
}

export interface StylePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  promptModifier: string;
  cameraMovement: string;
  lightingPrompt: string;
  colorPalette: string;
  aspectRatio: string;
  isCustom?: boolean;
}

export interface BatchVariation {
  id: string;
  variationIndex: number;
  cameraMovement: string;
  styleModifier: string;
  video?: VideoItem;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface BatchProject {
  id: string;
  title: string;
  basePrompt: string;
  aspectRatio: string;
  duration: string;
  variations: BatchVariation[];
  favoriteVariationId?: string;
  createdAt: string;
}

export interface ModelComparisonInfo {
  id: string;
  name: string;
  provider: string;
  type: string;
  capabilities: string[];
  supportedDurations: string[];
  maxResolution: string;
  aspectRatios: string[];
  audioSupport: boolean;
  imageToVideo: boolean;
  videoToVideo: boolean;
  status: 'Active' | 'Available';
  quotaNote: string;
  recommendedFor: string;
}
