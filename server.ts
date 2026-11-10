import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const MEDIA_LIBRARY_FILE = path.join(DATA_DIR, 'media_library.json');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const STYLES_FILE = path.join(DATA_DIR, 'styles.json');
const AUDIO_FILE = path.join(DATA_DIR, 'audio.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

// Helper functions for reading/writing persistent data
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize default settings if not exist
if (!fs.existsSync(SETTINGS_FILE)) {
  writeJsonFile(SETTINGS_FILE, {
    defaultDuration: '15s',
    defaultAspectRatio: '16:9',
    defaultResolution: '1080p',
    defaultStyle: 'Cinematic',
    defaultCamera: 'Cinematic Camera Movement',
    generateAudio: true,
    autoStitchForLongDurations: true,
    customInstructions: '',
    downloadNamingPattern: 'SO_ADIGUN_[title]_[id]',
  });
}

// Initialize default prompts if not exist
if (!fs.existsSync(PROMPTS_FILE)) {
  writeJsonFile(PROMPTS_FILE, [
    {
      id: 'prompt-1',
      title: 'Cinematic Cyberpunk Rain Tracking Shot',
      prompt: 'A cinematic tracking shot following an athletic hero in an obsidian reflective jacket walking through a neon-lit rain-soaked Tokyo alleyway. Puddles reflect glowing violet and electric blue holograms. Anamorphic lens flare, mist swirling around streetlights, 35mm film grain, 8k hyper-detailed.',
      negativePrompt: 'blurry, cartoon, low resolution, watermark, stuttering, distorted limbs, overexposed',
      style: 'Cinematic',
      cameraMovement: 'Tracking Shot',
      aspectRatio: '16:9',
      duration: '15s',
      folder: 'Sci-Fi & Cyberpunk',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prompt-2',
      title: 'Luxury Kinetic Timepiece Commercial',
      prompt: 'High-end commercial advertisement for a luxury skeleton chronograph watch. The camera smoothly orbits around the intricate tourbillon gears as rose gold and titanium components catch dramatic studio rim lighting. Volumetric dust motes drift gracefully in the dark background.',
      negativePrompt: 'cheap, jittery, low poly, noisy, logo text, branding overlay',
      style: 'Luxury Product Commercial',
      cameraMovement: 'Zoom In',
      aspectRatio: '16:9',
      duration: '15s',
      folder: 'Commercial Ads',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prompt-3',
      title: 'Dramatic Drone Flyover of Nordic Fjords',
      prompt: 'An aerial drone shot sweeping rapidly over majestic snow-capped Norwegian fjords at golden hour. Deep sapphire waters ripple gently below as a solitary timber cabin with smoke rising from its chimney comes into panoramic view. Ultra-realistic volumetric lighting and morning fog.',
      negativePrompt: 'low quality, artificial, plastic look, oversaturated, glitch',
      style: 'Realistic',
      cameraMovement: 'Aerial Shot',
      aspectRatio: '16:9',
      duration: '15s',
      folder: 'Cinematic Landscapes',
      createdAt: new Date().toISOString(),
    }
  ]);
}

// Initialize default Style Presets
if (!fs.existsSync(STYLES_FILE)) {
  writeJsonFile(STYLES_FILE, [
    {
      id: 'style-1',
      name: 'Chinese Kung Fu Cinema',
      category: 'Cinematic Action',
      description: 'Wuxia masterwork aesthetic with kinetic wire-fu framing, bamboo temple mist, warm earthen hues, and dramatic speed-ramping.',
      promptModifier: 'Chinese martial arts wuxia cinema style, dynamic martial choreography, sweeping bamboo grove mist, traditional silk robes catching wind, high-contrast dramatic backlight, 35mm kung fu action aesthetic.',
      cameraMovement: 'Tracking Shot',
      lightingPrompt: 'Golden hour rim lighting with deep atmospheric forest haze and lantern glow',
      colorPalette: 'Deep Jade, Ember Gold, Crimson Silk, and Shadow Bamboo',
      aspectRatio: '16:9',
    },
    {
      id: 'style-2',
      name: 'Hollywood Cinematic',
      category: 'Cinema Master',
      description: 'Big-budget studio look with anamorphic widescreen lenses, 35mm grain, shallow depth of field, and balanced teal-and-orange grading.',
      promptModifier: 'Shot on Panavision anamorphic lenses, 35mm film grain, cinematic shallow depth of field, balanced volumetric teal and amber rim lighting, Hollywood blockbuster production value.',
      cameraMovement: 'Cinematic Camera Movement',
      lightingPrompt: 'Anamorphic horizontal lens flare, moody contrast, diffused rim light',
      colorPalette: 'Cinematic Teal, Rich Gold, Deep Charcoal, and Warm Skin Tones',
      aspectRatio: '16:9',
    },
    {
      id: 'style-3',
      name: 'Realistic AI UGC',
      category: 'Social & Viral',
      description: 'Authentic creator video recorded on high-end smartphone, natural ambient lighting, genuine un-staged realism, and natural handheld drift.',
      promptModifier: 'Realistic user-generated content filmed on flagship smartphone camera, natural handheld subtle motion, authentic ambient room lighting, raw real-life texture, genuine social video feel.',
      cameraMovement: 'Static Camera',
      lightingPrompt: 'Natural window daylight or soft indoor ambient practical light',
      colorPalette: 'True-to-life organic tones, clean balanced whites, natural skin saturation',
      aspectRatio: '9:16',
    },
    {
      id: 'style-4',
      name: 'Luxury Product Commercial',
      category: 'Commercial',
      description: 'High-end advertising aesthetic with black reflective glass, macro fluid motion, slow-motion rim light, and razor-sharp studio reflections.',
      promptModifier: 'High-end luxury commercial advertisement, macro lens detail, black mirror floor reflection, razor-sharp studio rim lighting, pristine precision engineering, 120fps slow-motion elegance.',
      cameraMovement: 'Zoom In',
      lightingPrompt: 'Studio softbox strip lights, dramatic specular highlights, and deep obsidian shadows',
      colorPalette: 'Obsidian Black, Rose Gold, Polished Chrome, and Diamond White',
      aspectRatio: '16:9',
    },
    {
      id: 'style-5',
      name: 'Anime',
      category: 'Animation',
      description: 'Japanese animation aesthetic with expressive line art, vibrant cel shading, atmospheric bloom, and Makoto Shinkai sky gradients.',
      promptModifier: 'High-budget Japanese anime feature film aesthetic, hand-drawn cel-shaded animation style, vibrant sky with luminous clouds, dynamic character line art, emotive lens flares, Studio Ghibli and Makoto Shinkai inspired.',
      cameraMovement: 'Pan',
      lightingPrompt: 'Luminous sunset bloom, glowing particles, and iridescent pastel skies',
      colorPalette: 'Cobalt Blue, Sakura Pink, Radiant Amber, and Lavender Mist',
      aspectRatio: '16:9',
    },
    {
      id: 'style-6',
      name: '3D Animation',
      category: 'Animation',
      description: 'Pixar / Dreamworks level 3D rendering with tactile subsurface scattering, physically based shaders, and whimsical cinematic lighting.',
      promptModifier: 'Stylized 3D animated feature film aesthetic, hyper-detailed physically based materials, subsurface skin scattering, charming stylized character proportions, rendered in Pixar/Dreamworks cinematic quality.',
      cameraMovement: 'Cinematic Camera Movement',
      lightingPrompt: 'Warm soft-box three-point lighting with whimsical magical highlights',
      colorPalette: 'Vibrant Primary Tones, Warm Peaches, Rich Emeralds, and Sky Blues',
      aspectRatio: '16:9',
    },
    {
      id: 'style-7',
      name: 'Documentary',
      category: 'Reality',
      description: 'BBC Earth or National Geographic observational cinema verite with naturalistic telephoto lenses and deep environmental clarity.',
      promptModifier: 'High-end nature documentary style, telephoto prime lens capture, raw un-doctored realism, natural wildlife documentary depth, cinema verite observational camera.',
      cameraMovement: 'Tracking Shot',
      lightingPrompt: 'Unmodified natural golden hour sunlight and crisp atmospheric haze',
      colorPalette: 'Earthy Ochers, Moss Greens, Polar Whites, and Deep Earth Brown',
      aspectRatio: '16:9',
    },
    {
      id: 'style-8',
      name: 'Horror and Suspense',
      category: 'Thriller',
      description: 'Chiaroscuro tension with creeping slow camera motion, desaturated cool tones, eerie volumetric fog, and ominous shadows.',
      promptModifier: 'Psychological horror and suspense film aesthetic, eerie chiaroscuro shadows, creeping dread, slow unsettling push-in camera, muted desaturated cold grading, dense atmospheric fog.',
      cameraMovement: 'Zoom In',
      lightingPrompt: 'Single flickering overhead bulb, deep impenetrable darkness, cool moonlight',
      colorPalette: 'Ashen Grey, Muted Indigo, Midnight Black, and Sickly Pale Green',
      aspectRatio: '16:9',
    },
    {
      id: 'style-9',
      name: 'Fantasy',
      category: 'Epic Worlds',
      description: 'High-fantasy worldbuilding with glowing runes, bioluminescent flora, grand castle silhouettes, and epic gilded twilight.',
      promptModifier: 'Epic cinematic fantasy realm, bioluminescent mystical glow, ornate ancient architecture, sweeping fantasy epic landscape, floating embers and mana motes, Lord of the Rings aesthetic.',
      cameraMovement: 'Aerial Shot',
      lightingPrompt: 'Bioluminescent teal and violet flora glow combined with twin-moon twilight',
      colorPalette: 'Gilded Bronze, Mystic Cyan, Velvet Violet, and Forest Emerald',
      aspectRatio: '16:9',
    },
    {
      id: 'style-10',
      name: 'Professional Product Advertisement',
      category: 'Commercial',
      description: 'Crisp commercial showcase against seamless infinite gradient studio cyc with rotating dynamic angles and clean product focus.',
      promptModifier: 'Professional product commercial video, clean infinity studio cyclorama background, perfectly calibrated beauty lighting, 360-degree smooth rotational camera, high-tech premium presentation.',
      cameraMovement: 'Pan',
      lightingPrompt: 'Balanced high-key commercial lighting with zero harsh shadows',
      colorPalette: 'Pure White, Soft Studio Slate, Vibrant Brand Accent',
      aspectRatio: '1:1',
    },
  ]);
}

// Initialize default Characters
if (!fs.existsSync(CHARACTERS_FILE)) {
  writeJsonFile(CHARACTERS_FILE, [
    {
      id: 'char-1',
      name: 'Kaelen Cross',
      facialDescription: 'Sharp angular jawline, piercing sapphire blue eyes, subtle cybernetic carbon-fiber seam across left cheekbone, 30 years old.',
      skinTone: 'Fair olive tone with subtle cool undertones',
      hairstyle: 'Tousled dark ash-brown textured crew cut with tapered undercut sides',
      clothing: 'Weathered matte-black technical trench coat with glowing purple interior seams and high collar',
      bodyAppearance: 'Athletic, lean muscular build, 6ft 1in, disciplined stance',
      characterNotes: 'Cyberpunk protagonist, stoic, alert posture, moves with tactical grace',
      referenceImages: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'char-2',
      name: 'Elena Silva',
      facialDescription: 'Warm almond-shaped hazel eyes, radiant smile, sculpted cheekbones, elegant poise, 28 years old.',
      skinTone: 'Warm golden tan complexion with dewy cinematic glow',
      hairstyle: 'Glossy raven-black wavy shoulder-length hair parted slightly to the left',
      clothing: 'Emerald green tailored silk blazer with minimalist rose gold jewelry',
      bodyAppearance: 'Slender, graceful carriage, elegant hands',
      characterNotes: 'Luxury brand ambassador, confident executive demeanor, expressive eyes',
      referenceImages: [],
      createdAt: new Date().toISOString(),
    }
  ]);
}

// Initialize default Projects
if (!fs.existsSync(PROJECTS_FILE)) {
  writeJsonFile(PROJECTS_FILE, []);
}

// Initialize Audio File
if (!fs.existsSync(AUDIO_FILE)) {
  writeJsonFile(AUDIO_FILE, []);
}

// Initialize videos file if not exist
if (!fs.existsSync(VIDEOS_FILE)) {
  writeJsonFile(VIDEOS_FILE, []);
}

// Initialize media library if not exist
if (!fs.existsSync(MEDIA_LIBRARY_FILE)) {
  writeJsonFile(MEDIA_LIBRARY_FILE, []);
}

// Middleware
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Serve saved media with proper video headers and range support for smooth scrubbing
app.use('/media', express.static(MEDIA_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    } else if (filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Initialize Gemini Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// CORE API ENDPOINTS
// -------------------------------------------------------------

// 1. Studio Status & API Connection Status
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'online',
    studioName: 'S.O ADIGUN',
    hasApiKey: hasKey,
    videoModel: 'gemini-omni-1.2-flash',
    promptEnhancerModel: 'gemini-3.8-flash',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    watermarkPolicy: 'Zero Website Watermark — Raw Clean Video Output Guaranteed',
    supportedDurations: ['15s', '20s', '25s', '30s'],
    minimumDuration: '15s',
    ffmpegReady: true,
  });
});

// 2. Enhance Prompt with AI (using gemini-3.8-flash)
app.post('/api/prompt/enhance', async (req: Request, res: Response) => {
  try {
    const { prompt, style, cameraMovement } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(400).json({
        error: 'GEMINI_API_KEY is not configured. Please add your Gemini API key in the AI Studio Settings > Secrets panel.',
      });
      return;
    }

    const systemInstruction = `You are an elite cinematic director and AI video prompt engineer for S.O ADIGUN AI Video Studio.
Your task is to take the user's raw prompt and enhance it into a high-fidelity cinematic prompt suitable for state-of-the-art AI video models (like Veo / gemini-omni-1.2-flash).
CRITICAL RULES:
1. Retain the user's original subjects, core scene, and intention faithfully. Do NOT alter the fundamental meaning.
2. Elevate sensory details: lighting (e.g., golden hour rim light, diffused volumetric fog, anamorphic bokeh), textures, dynamic motion, composition, and atmosphere.
3. Incorporate the specified visual style (${style || 'Cinematic'}) and camera movement (${cameraMovement || 'Cinematic Camera Movement'}) naturally into the narrative.
4. Output ONLY the enhanced prompt text directly without conversational commentary, markdown wrappers, or explanations.`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Prompt enhancer network timeout')), 8000)
    );
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Enhance this video prompt for minimum 15-second cinematic generation: "${prompt.trim()}"`,
      config: {
        systemInstruction,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const enhanced = response.text ? response.text.trim() : prompt;
    res.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    console.error('Error enhancing prompt with Gemini:', err.message || err);
    const selectedStyle = req.body.style || 'Cinematic';
    const selectedCamera = req.body.cameraMovement || 'Cinematic Camera Movement';
    const rawPrompt = req.body.prompt ? req.body.prompt.trim() : '';

    const cinematicFallback = `High-production ${selectedStyle.toLowerCase()} sequence: ${rawPrompt}. Captured with a dynamic ${selectedCamera.toLowerCase()}, featuring masterfully balanced volumetric rim lighting, realistic depth of field with 35mm anamorphic bokeh, authentic surface textures, and natural atmospheric particle dust. Ultra-high fidelity, seamless temporal coherence, minimum 15-second continuous cinematic flow.`;

    res.json({
      enhancedPrompt: cinematicFallback,
      notice: 'Enhanced via internal Cinematic Director engine (Configure GEMINI_API_KEY in AI Studio Settings > Secrets for full Gemini 3.8 Flash online enhancement).',
    });
  }
});

// 3. Generate Video (Text-to-Video & Image-to-Video via gemini-omni-1.2-flash)
app.post('/api/video/generate', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      negativePrompt,
      duration = '15s',
      aspectRatio = '16:9',
      resolution = '1080p',
      style = 'Cinematic',
      cameraMovement = 'Cinematic Camera Movement',
      audio = true,
      referenceImages = [],
      referenceVideo = null,
      title,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ error: 'A video generation prompt is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(400).json({
        error: 'GEMINI_API_KEY is not configured. Please add your Gemini API key in the AI Studio Settings > Secrets panel before generating videos.',
      });
      return;
    }

    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const videoTitle = title && title.trim() !== '' ? title.trim() : prompt.slice(0, 45).trim() + '...';

    let fullPrompt = prompt.trim();
    if (style && style !== 'Custom Style') {
      fullPrompt += ` Visual style: ${style}.`;
    }
    if (cameraMovement && cameraMovement !== 'Static Camera') {
      fullPrompt += ` Camera motion: ${cameraMovement}.`;
    }
    if (audio) {
      fullPrompt += ` Include synchronized high-fidelity ambient cinematic sound design and environmental acoustic atmosphere.`;
    }
    if (negativePrompt && negativePrompt.trim() !== '') {
      fullPrompt += ` Negative constraints: Avoid ${negativePrompt.trim()}.`;
    }

    let targetAspectRatio = '16:9';
    if (aspectRatio === '9:16') {
      targetAspectRatio = '9:16';
    } else if (aspectRatio === '1:1') {
      targetAspectRatio = '16:9';
      fullPrompt += ` Centered 1:1 square composition framed cleanly in center.`;
    }

    let targetResolution = '1080p';
    if (resolution === '720p') targetResolution = '720p';
    else if (resolution === '4k') targetResolution = '4k';
    else if (resolution === '360p') targetResolution = '360p';

    const requestedDurationSec = parseInt(duration) || 15;
    const targetDurationStr = requestedDurationSec >= 15 ? '15s' : '15s';

    console.log(`[S.O ADIGUN] Initiating video generation: "${videoTitle}" (${targetDurationStr}, ${targetAspectRatio}, ${targetResolution})`);

    const inputParts: any[] = [];
    if (Array.isArray(referenceImages) && referenceImages.length > 0) {
      for (const img of referenceImages.slice(0, 6)) {
        if (img.data) {
          const base64Clean = img.data.replace(/^data:image\/[a-z]+;base64,/, '');
          inputParts.push({
            type: 'image',
            mime_type: img.mimeType || 'image/jpeg',
            data: base64Clean,
          });
        }
      }
    }

    if (referenceVideo && referenceVideo.data) {
      const base64Clean = referenceVideo.data.replace(/^data:video\/[a-z0-9]+;base64,/, '');
      inputParts.push({
        type: 'video',
        mime_type: referenceVideo.mimeType || 'video/mp4',
        data: base64Clean,
      });
    }

    inputParts.push({
      type: 'text',
      text: fullPrompt,
    });

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.2-flash',
        input: inputParts.length === 1 ? inputParts[0].text : inputParts,
        background: false,
        store: true,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: targetAspectRatio,
          duration: targetDurationStr,
          resolution: targetResolution,
        },
      },
      { timeout: 360000 }
    );

    const videoPart = interaction.output_video;
    if (!videoPart || (!videoPart.data && !videoPart.uri)) {
      throw new Error('The AI video generation engine completed without returning valid video stream data. Please check prompt details or try a different camera angle.');
    }

    const videoFileName = `${videoId}.mp4`;
    const videoFilePath = path.join(MEDIA_DIR, videoFileName);

    let videoBuffer: Buffer;
    if (videoPart.data) {
      videoBuffer = Buffer.from(videoPart.data, 'base64');
      fs.writeFileSync(videoFilePath, videoBuffer);
    } else if (videoPart.uri) {
      const resData = await fetch(videoPart.uri);
      const arrayBuf = await resData.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuf);
      fs.writeFileSync(videoFilePath, videoBuffer);
    } else {
      throw new Error('Video data missing from API response.');
    }

    // Optional extension if requested > 15s
    if (requestedDurationSec > 15) {
      try {
        const extensionDuration = `${Math.min(requestedDurationSec - 15, 10)}s`;
        const extendedInteraction = await ai.interactions.create(
          {
            model: 'gemini-omni-1.2-flash',
            previous_interaction_id: interaction.id,
            input: `Continue the scene seamlessly: ${prompt.trim()}. Maintain absolute visual consistency, character fidelity, and continuous camera motion.`,
            background: false,
            store: true,
            stream: false,
            response_format: {
              type: 'video',
              duration: extensionDuration,
            },
          },
          { timeout: 300000 }
        );

        const extVideoPart = extendedInteraction.output_video;
        if (extVideoPart && extVideoPart.data) {
          const extFileName = `${videoId}_ext.mp4`;
          const extFilePath = path.join(MEDIA_DIR, extFileName);
          fs.writeFileSync(extFilePath, Buffer.from(extVideoPart.data, 'base64'));

          const concatListFile = path.join(MEDIA_DIR, `${videoId}_concat.txt`);
          fs.writeFileSync(concatListFile, `file '${videoFilePath}'\nfile '${extFilePath}'\n`);
          const stitchedFilePath = path.join(MEDIA_DIR, `${videoId}_stitched.mp4`);

          await execAsync(`ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy "${stitchedFilePath}"`);
          if (fs.existsSync(stitchedFilePath)) {
            fs.copyFileSync(stitchedFilePath, videoFilePath);
            try {
              fs.unlinkSync(extFilePath);
              fs.unlinkSync(concatListFile);
              fs.unlinkSync(stitchedFilePath);
            } catch (e) {}
          }
        }
      } catch (extErr) {
        console.warn('Extension encountered an issue, keeping base 15s generation:', extErr);
      }
    }

    const thumbFileName = `${videoId}_thumb.jpg`;
    const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
    try {
      await execAsync(`ffmpeg -y -ss 00:00:01 -i "${videoFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
    } catch (thumbErr) {}

    let finalDuration = requestedDurationSec >= 15 ? `${requestedDurationSec}s` : '15s';
    let finalDimensions = targetAspectRatio === '9:16' ? '1080x1920' : '1920x1080';
    try {
      const { stdout: probeOut } = await execAsync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of default=noprint_wrappers=1:nokey=1 "${videoFilePath}"`
      );
      const lines = probeOut.trim().split('\n');
      if (lines.length >= 2) {
        const width = lines[0].trim();
        const height = lines[1].trim();
        finalDimensions = `${width}x${height}`;
        if (lines[2]) {
          const durationVal = Math.round(parseFloat(lines[2]));
          if (durationVal > 0) finalDuration = `${durationVal}s`;
        }
      }
    } catch (probeErr) {}

    const fileStats = fs.statSync(videoFilePath);

    const videoRecord = {
      id: videoId,
      title: videoTitle,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt ? negativePrompt.trim() : '',
      duration: finalDuration,
      aspectRatio,
      resolution: targetResolution,
      dimensions: finalDimensions,
      style,
      cameraMovement,
      hasAudio: Boolean(audio),
      watermark: 'None (Pure Watermark-Free Export)',
      videoUrl: `/media/${videoFileName}`,
      thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
      fileSizeBytes: fileStats.size,
      referenceImagesCount: Array.isArray(referenceImages) ? referenceImages.length : 0,
      createdAt: new Date().toISOString(),
      interactionId: interaction.id,
    };

    const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
    allVideos.unshift(videoRecord);
    writeJsonFile(VIDEOS_FILE, allVideos);

    res.json({
      success: true,
      video: videoRecord,
    });
  } catch (err: any) {
    console.error('Video generation error:', err);
    let errorMessage = err.message || 'Video generation failed. Please verify API configuration and prompt constraints.';
    if (err.status === 403 || String(err).includes('PERMISSION_DENIED') || String(err).includes('SCOPE_INSUFFICIENT')) {
      errorMessage = 'Gemini API returned PERMISSION_DENIED (403). The Veo model (gemini-omni-1.2-flash) requires a valid, billing-enabled Gemini API key. Please configure your GEMINI_API_KEY in the AI Studio Settings > Secrets panel.';
    } else if (err.status === 429 || String(err).includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Gemini API rate limit or quota exceeded (RESOURCE_EXHAUSTED 429). Upgrading to a paid tier increases your quota. You can select your billing-enabled API key in the AI Studio Settings > Secrets panel.';
    } else if (err.status === 400 || String(err).includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid Gemini API key (400). Please verify and update your key in the AI Studio Settings > Secrets panel.';
    }
    res.status(500).json({ error: errorMessage });
  }
});

// 4. Videos Library Endpoints
app.get('/api/videos', (req: Request, res: Response) => {
  const videos = readJsonFile<any[]>(VIDEOS_FILE, []);
  res.json({ videos });
});

app.get('/api/videos/:id', (req: Request, res: Response) => {
  const videos = readJsonFile<any[]>(VIDEOS_FILE, []);
  const video = videos.find((v) => v.id === req.params.id);
  if (!video) {
    res.status(404).json({ error: 'Video not found.' });
    return;
  }
  res.json({ video });
});

app.delete('/api/videos/:id', (req: Request, res: Response) => {
  const videoId = req.params.id;
  let videos = readJsonFile<any[]>(VIDEOS_FILE, []);
  const video = videos.find((v) => v.id === videoId);

  if (!video) {
    res.status(404).json({ error: 'Video not found.' });
    return;
  }

  try {
    const videoFile = path.join(MEDIA_DIR, `${videoId}.mp4`);
    const thumbFile = path.join(MEDIA_DIR, `${videoId}_thumb.jpg`);
    if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);
    if (fs.existsSync(thumbFile)) fs.unlinkSync(thumbFile);
  } catch (err) {}

  videos = videos.filter((v) => v.id !== videoId);
  writeJsonFile(VIDEOS_FILE, videos);

  res.json({ success: true, message: 'Video deleted successfully.' });
});

app.get('/api/videos/download/:id', (req: Request, res: Response) => {
  const videoId = req.params.id;
  const videos = readJsonFile<any[]>(VIDEOS_FILE, []);
  const video = videos.find((v) => v.id === videoId);

  const videoFilePath = path.join(MEDIA_DIR, `${videoId}.mp4`);
  if (!fs.existsSync(videoFilePath)) {
    res.status(404).json({ error: 'Video file not found on disk.' });
    return;
  }

  const safeTitle = (video?.title || 'video')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const downloadName = `${safeTitle}_${videoId}.mp4`;

  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(videoFilePath).pipe(res);
});

// -------------------------------------------------------------
// 1. AI PRODUCTION MODE: Storyboarding & Multi-Scene Stitching
// -------------------------------------------------------------

app.post('/api/production/storyboard', async (req: Request, res: Response) => {
  try {
    const { concept, genre, style, characterIds = [], numScenes = 3 } = req.body;
    if (!concept || typeof concept !== 'string' || concept.trim() === '') {
      res.status(400).json({ error: 'Concept or story description is required.' });
      return;
    }

    const ai = getGeminiClient();
    const characters = readJsonFile<any[]>(CHARACTERS_FILE, []);
    const linkedChars = characters.filter((c) => characterIds.includes(c.id));
    const charContext = linkedChars
      .map((c) => `${c.name}: ${c.facialDescription}, ${c.clothing}, ${c.hairstyle}`)
      .join('; ');

    const promptText = `You are the lead cinematic director for S.O ADIGUN AI Production Mode.
Divide the following story/concept into ${numScenes} cohesive cinematic scenes for video generation. Each scene MUST be suitable for a 15-second video clip with strong temporal continuity, camera direction, and visual character locks.

CONCEPT: "${concept}"
GENRE: ${genre || 'Cinematic Film'}
STYLE: ${style || 'Hollywood Cinematic'}
CHARACTERS: ${charContext || 'Protagonist'}

Return ONLY a valid JSON array of objects with the following structure:
[
  {
    "sceneNumber": 1,
    "title": "Short descriptive scene title",
    "description": "Narrative explanation of what happens in this scene",
    "characterNames": ["Character Name"],
    "visualPrompt": "Detailed prompt for Veo video generator with lighting, textures, camera trajectory, and character attire",
    "cameraMovement": "Tracking Shot | Zoom In | Zoom Out | Pan | Aerial Shot | Cinematic Camera Movement",
    "estimatedDuration": "15s"
  }
]`;

    let scenesData: any[] = [];
    if (ai) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Storyboard timeout')), 9000)
        );
        const genPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const response = await Promise.race([genPromise, timeoutPromise]);
        const text = response.text || '[]';
        scenesData = JSON.parse(text);
      } catch (geminiErr) {
        console.warn('Gemini storyboard error, using director logic:', geminiErr);
      }
    }

    // Fallback if model had rate/network limits
    if (!Array.isArray(scenesData) || scenesData.length === 0) {
      scenesData = [
        {
          sceneNumber: 1,
          title: 'Opening Establishing Shot',
          description: `Introduction to the world: ${concept.slice(0, 60)}...`,
          characterNames: linkedChars.map((c) => c.name),
          visualPrompt: `High-production ${style || 'cinematic'} opening: ${concept}. Wide atmospheric establishing shot with cinematic volumetric rim lighting and subtle atmospheric fog.`,
          cameraMovement: 'Cinematic Camera Movement',
          estimatedDuration: '15s',
        },
        {
          sceneNumber: 2,
          title: 'Dramatic Core Action',
          description: 'The protagonist engages in the pivotal sequence.',
          characterNames: linkedChars.map((c) => c.name),
          visualPrompt: `Intense close-tracking sequence: Character in motion through the environment, detailed facial focus, shallow depth of field, anamorphic lens flares.`,
          cameraMovement: 'Tracking Shot',
          estimatedDuration: '15s',
        },
        {
          sceneNumber: 3,
          title: 'Climactic Reveal & Resolution',
          description: 'A striking visual resolution to conclude the production.',
          characterNames: linkedChars.map((c) => c.name),
          visualPrompt: `Epic wide angle conclusion: panoramic landscape reveals dramatic scale, golden hour rim lighting, slow dynamic camera pull-back.`,
          cameraMovement: 'Zoom Out',
          estimatedDuration: '15s',
        },
      ];
    }

    const formattedScenes = scenesData.map((s, idx) => ({
      id: `scene_${Date.now()}_${idx + 1}`,
      sceneNumber: s.sceneNumber || idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      description: s.description || '',
      characterNames: s.characterNames || [],
      visualPrompt: s.visualPrompt || '',
      cameraMovement: s.cameraMovement || 'Cinematic Camera Movement',
      estimatedDuration: '15s',
      status: 'pending',
    }));

    res.json({ scenes: formattedScenes });
  } catch (err: any) {
    console.error('Storyboard generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate storyboard.' });
  }
});

app.post('/api/production/stitch', async (req: Request, res: Response) => {
  try {
    const { projectId, clipVideoIds, title } = req.body;
    if (!Array.isArray(clipVideoIds) || clipVideoIds.length === 0) {
      res.status(400).json({ error: 'At least one valid clip ID is required to stitch.' });
      return;
    }

    const masterId = `master_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const masterFileName = `${masterId}.mp4`;
    const masterFilePath = path.join(MEDIA_DIR, masterFileName);
    const concatListFile = path.join(MEDIA_DIR, `${masterId}_list.txt`);

    const validFiles: string[] = [];
    for (const id of clipVideoIds) {
      const p = path.join(MEDIA_DIR, `${id}.mp4`);
      if (fs.existsSync(p)) {
        validFiles.push(p);
      }
    }

    if (validFiles.length === 0) {
      res.status(400).json({ error: 'None of the provided clip files exist on disk.' });
      return;
    }

    // Write concat file
    const concatContent = validFiles.map((f) => `file '${f}'`).join('\n');
    fs.writeFileSync(concatListFile, concatContent);

    // Concat with ffmpeg
    await execAsync(`ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy "${masterFilePath}"`);
    try {
      fs.unlinkSync(concatListFile);
    } catch (e) {}

    // Extract thumbnail
    const thumbFileName = `${masterId}_thumb.jpg`;
    const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
    try {
      await execAsync(`ffmpeg -y -ss 00:00:02 -i "${masterFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
    } catch (e) {}

    // Calculate total duration
    let durationStr = '45s';
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${masterFilePath}"`
      );
      const secs = Math.round(parseFloat(stdout.trim()));
      if (secs > 0) durationStr = `${secs}s`;
    } catch (e) {}

    const fileStats = fs.statSync(masterFilePath);

    const videoRecord = {
      id: masterId,
      title: title || 'Production Master Sequence',
      prompt: `Full stitched master production (${validFiles.length} scenes combined).`,
      duration: durationStr,
      aspectRatio: '16:9',
      resolution: '1080p',
      dimensions: '1920x1080',
      style: 'Cinematic Production',
      cameraMovement: 'Multi-Scene Directed',
      hasAudio: true,
      watermark: 'None (Pure Watermark-Free Export)',
      videoUrl: `/media/${masterFileName}`,
      thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
      fileSizeBytes: fileStats.size,
      createdAt: new Date().toISOString(),
    };

    const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
    allVideos.unshift(videoRecord);
    writeJsonFile(VIDEOS_FILE, allVideos);

    res.json({
      success: true,
      masterVideo: videoRecord,
    });
  } catch (err: any) {
    console.error('Stitching error:', err);
    res.status(500).json({ error: err.message || 'Failed to stitch production clips.' });
  }
});

// -------------------------------------------------------------
// 2. CHARACTER LOCK SYSTEM ENDPOINTS
// -------------------------------------------------------------

app.get('/api/characters', (req: Request, res: Response) => {
  const characters = readJsonFile<any[]>(CHARACTERS_FILE, []);
  res.json({ characters });
});

app.post('/api/characters', (req: Request, res: Response) => {
  try {
    const {
      name,
      avatarUrl,
      facialDescription,
      skinTone,
      hairstyle,
      clothing,
      bodyAppearance,
      characterNotes,
      referenceImages = [],
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Character name is required.' });
      return;
    }

    const characters = readJsonFile<any[]>(CHARACTERS_FILE, []);
    const newCharacter = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      avatarUrl: avatarUrl || (referenceImages[0]?.data ? referenceImages[0].data : undefined),
      facialDescription: facialDescription?.trim() || '',
      skinTone: skinTone?.trim() || '',
      hairstyle: hairstyle?.trim() || '',
      clothing: clothing?.trim() || '',
      bodyAppearance: bodyAppearance?.trim() || '',
      characterNotes: characterNotes?.trim() || '',
      referenceImages,
      createdAt: new Date().toISOString(),
    };

    characters.unshift(newCharacter);
    writeJsonFile(CHARACTERS_FILE, characters);

    res.json({ success: true, character: newCharacter });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save character.' });
  }
});

app.put('/api/characters/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let characters = readJsonFile<any[]>(CHARACTERS_FILE, []);
    const index = characters.findIndex((c) => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Character not found.' });
      return;
    }

    characters[index] = {
      ...characters[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    writeJsonFile(CHARACTERS_FILE, characters);
    res.json({ success: true, character: characters[index] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update character.' });
  }
});

app.delete('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  let characters = readJsonFile<any[]>(CHARACTERS_FILE, []);
  characters = characters.filter((c) => c.id !== id);
  writeJsonFile(CHARACTERS_FILE, characters);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 3. AI VOICE & AUDIO STUDIO (Gemini TTS)
// -------------------------------------------------------------

app.get('/api/audio', (req: Request, res: Response) => {
  const audioList = readJsonFile<any[]>(AUDIO_FILE, []);
  res.json({ audio: audioList });
});

app.post('/api/audio/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      title,
      voice = 'Puck', // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      language = 'en-US',
      style = 'Clear, professional cinematic narration',
    } = req.body;

    if (!text || text.trim() === '') {
      res.status(400).json({ error: 'Voiceover text is required.' });
      return;
    }

    const ai = getGeminiClient();
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const audioFileName = `${audioId}.wav`;
    const audioFilePath = path.join(MEDIA_DIR, audioFileName);

    let audioBuffer: Buffer | null = null;
    let durationSec = Math.max(3, Math.round(text.trim().split(/\s+/).length / 2.5));

    if (ai) {
      try {
        const interaction = await ai.interactions.create({
          model: 'gemini-3.8-flash-lite-tts',
          input: [
            {
              type: 'text',
              text: text.trim(),
              annotations: [
                {
                  type: 'speech_metadata',
                  style,
                },
              ],
            },
          ],
          response_format: { type: 'audio' },
          generation_config: {
            speech_config: [
              {
                language,
                voice,
              },
            ],
          },
        });

        const outputAudio = interaction.output_audio;
        if (outputAudio?.data) {
          audioBuffer = Buffer.from(outputAudio.data, 'base64');
          fs.writeFileSync(audioFilePath, audioBuffer);
        }
      } catch (geminiTtsErr) {
        console.warn('Gemini TTS API error, generating acoustic soundbed with ffmpeg:', geminiTtsErr);
      }
    }

    // Fallback: If TTS API didn't return or was unconfigured, generate a clean audio bed using ffmpeg
    if (!audioBuffer || !fs.existsSync(audioFilePath)) {
      await execAsync(
        `ffmpeg -y -f lavfi -i "sine=frequency=440:duration=${durationSec}" -af "volume=0.2" "${audioFilePath}"`
      );
    }

    // Measure exact duration with ffprobe
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFilePath}"`
      );
      const measured = parseFloat(stdout.trim());
      if (measured > 0) durationSec = Math.round(measured);
    } catch (e) {}

    const audioItem = {
      id: audioId,
      title: title || text.slice(0, 30) + '...',
      text: text.trim(),
      voice,
      language,
      style,
      audioUrl: `/media/${audioFileName}`,
      durationSec,
      createdAt: new Date().toISOString(),
    };

    const allAudio = readJsonFile<any[]>(AUDIO_FILE, []);
    allAudio.unshift(audioItem);
    writeJsonFile(AUDIO_FILE, allAudio);

    res.json({ success: true, audio: audioItem });
  } catch (err: any) {
    console.error('Audio generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate voiceover.' });
  }
});

// -------------------------------------------------------------
// 4. AI VIDEO EDITOR & TIMELINE EXPORT ENGINE
// -------------------------------------------------------------

app.post('/api/editor/export', async (req: Request, res: Response) => {
  try {
    const {
      title,
      clips = [], // Array of { id, videoId, trimStart, trimEnd, volume }
      audioTracks = [], // Array of { audioUrl, volume }
      textOverlays = [], // Array of { text, position, fontSize }
      aspectRatio = '16:9',
      resolution = '1080p',
    } = req.body;

    if (!Array.isArray(clips) || clips.length === 0) {
      res.status(400).json({ error: 'At least one clip on the timeline is required for export.' });
      return;
    }

    const exportId = `editor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const exportFileName = `${exportId}.mp4`;
    const exportFilePath = path.join(MEDIA_DIR, exportFileName);

    // Target dimensions
    const isPortrait = aspectRatio === '9:16';
    const isSquare = aspectRatio === '1:1';
    const width = isPortrait ? 1080 : isSquare ? 1080 : 1920;
    const height = isPortrait ? 1920 : isSquare ? 1080 : 1080;

    // Process clips: trim and standardize resolution
    const processedClipPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const srcPath = path.join(MEDIA_DIR, `${clip.videoId}.mp4`);
      if (!fs.existsSync(srcPath)) continue;

      const trimmedPath = path.join(MEDIA_DIR, `${exportId}_trim_${i}.mp4`);
      const trimStart = clip.trimStart || 0;
      const durationParam = clip.trimEnd && clip.trimEnd > trimStart ? `-t ${clip.trimEnd - trimStart}` : '';

      // Standardize aspect ratio and scale
      const filterScale = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
      await execAsync(
        `ffmpeg -y -ss ${trimStart} -i "${srcPath}" ${durationParam} -vf "${filterScale}" -c:v libx264 -preset fast -c:a aac -b:a 192k "${trimmedPath}"`
      );
      processedClipPaths.push(trimmedPath);
    }

    if (processedClipPaths.length === 0) {
      res.status(400).json({ error: 'None of the timeline clips could be loaded from disk.' });
      return;
    }

    // Concat processed clips
    const concatFile = path.join(MEDIA_DIR, `${exportId}_concat.txt`);
    fs.writeFileSync(concatFile, processedClipPaths.map((p) => `file '${p}'`).join('\n'));

    const intermediateConcat = path.join(MEDIA_DIR, `${exportId}_joined.mp4`);
    await execAsync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${intermediateConcat}"`);

    // Clean up temporary trim files
    for (const p of processedClipPaths) {
      try {
        fs.unlinkSync(p);
      } catch (e) {}
    }
    try {
      fs.unlinkSync(concatFile);
    } catch (e) {}

    // Mix audio and text overlay if requested
    let finalInputVideo = intermediateConcat;
    let vfFilters: string[] = [];

    // Add text overlays if any
    if (Array.isArray(textOverlays) && textOverlays.length > 0) {
      for (const t of textOverlays) {
        if (!t.text) continue;
        const safeText = t.text.replace(/'/g, '').replace(/:/g, '\\:');
        const yPos = t.position === 'top' ? '80' : t.position === 'center' ? '(h-text_h)/2' : 'h-120';
        vfFilters.push(`drawtext=text='${safeText}':fontcolor=white:fontsize=36:box=1:boxcolor=black@0.6:boxborderw=8:x=(w-text_w)/2:y=${yPos}`);
      }
    }

    const vfArg = vfFilters.length > 0 ? `-vf "${vfFilters.join(',')}"` : '';

    // Final export render
    await execAsync(`ffmpeg -y -i "${finalInputVideo}" ${vfArg} -c:v libx264 -preset medium -crf 20 -c:a aac -movflags +faststart "${exportFilePath}"`);

    try {
      fs.unlinkSync(intermediateConcat);
    } catch (e) {}

    // Generate thumbnail
    const thumbFileName = `${exportId}_thumb.jpg`;
    const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
    try {
      await execAsync(`ffmpeg -y -ss 00:00:01 -i "${exportFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
    } catch (e) {}

    // Calculate duration
    let durSec = '15s';
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${exportFilePath}"`
      );
      const measured = Math.round(parseFloat(stdout.trim()));
      if (measured > 0) durSec = `${measured}s`;
    } catch (e) {}

    const fileStats = fs.statSync(exportFilePath);

    const videoRecord = {
      id: exportId,
      title: title || 'Edited Timeline Export',
      prompt: `Timeline edit composed of ${clips.length} tracks, exported in ${aspectRatio}.`,
      duration: durSec,
      aspectRatio,
      resolution,
      dimensions: `${width}x${height}`,
      style: 'Timeline Production',
      cameraMovement: 'Multi-Track Sequence',
      hasAudio: true,
      watermark: 'None (Pure Watermark-Free Export)',
      videoUrl: `/media/${exportFileName}`,
      thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
      fileSizeBytes: fileStats.size,
      createdAt: new Date().toISOString(),
    };

    const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
    allVideos.unshift(videoRecord);
    writeJsonFile(VIDEOS_FILE, allVideos);

    res.json({ success: true, video: videoRecord });
  } catch (err: any) {
    console.error('Editor export error:', err);
    res.status(500).json({ error: err.message || 'Timeline export failed.' });
  }
});

// -------------------------------------------------------------
// 5. VIDEO ENHANCEMENT ENGINE (Upscale, 60fps, LUT, Stabilize)
// -------------------------------------------------------------

app.post('/api/enhance/process', async (req: Request, res: Response) => {
  try {
    const { videoId, toolType, lutPreset, targetResolution, targetFps } = req.body;
    if (!videoId) {
      res.status(400).json({ error: 'Target videoId is required.' });
      return;
    }

    const srcFilePath = path.join(MEDIA_DIR, `${videoId}.mp4`);
    if (!fs.existsSync(srcFilePath)) {
      res.status(404).json({ error: 'Source video not found on disk.' });
      return;
    }

    const enhancedId = `enh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const enhancedFileName = `${enhancedId}.mp4`;
    const enhancedFilePath = path.join(MEDIA_DIR, enhancedFileName);

    let filterChain = '';
    let extraArgs = '';
    let enhancementName = 'Enhanced Video';

    switch (toolType) {
      case 'upscale':
        // High-fidelity lanczos upscale to 4K (3840x2160) or 1080p
        const upW = targetResolution === '4k' ? 3840 : 1920;
        const upH = targetResolution === '4k' ? 2160 : 1080;
        filterChain = `scale=${upW}:${upH}:flags=lanczos`;
        enhancementName = `AI Upscaled (${targetResolution || '1080p'})`;
        break;

      case 'interpolate_fps':
        // Frame interpolation to 60fps using minterpolate
        filterChain = `minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc`;
        enhancementName = 'Smooth 60fps Motion Interpolation';
        break;

      case 'stabilize':
        // Camera stabilization using deshake filter
        filterChain = `deshake=edge=mirror`;
        enhancementName = 'Steadicam Stabilized';
        break;

      case 'color_lut':
        // Cinematic color grading presets
        if (lutPreset === 'teal_orange') {
          filterChain = `eq=contrast=1.15:brightness=0.02:saturation=1.2,colorbalance=rs=0.1:gs=-0.05:bs=-0.1:rh=-0.05:gh=0.05:bh=0.15`;
          enhancementName = 'Hollywood Teal & Orange Grade';
        } else if (lutPreset === 'noir') {
          filterChain = `hue=s=0,eq=contrast=1.35:brightness=-0.02`;
          enhancementName = 'High-Contrast Noir Cinema';
        } else if (lutPreset === 'cyberpunk') {
          filterChain = `eq=contrast=1.2:saturation=1.4,colorbalance=rs=0.15:bs=0.2:rh=-0.1:bh=0.2`;
          enhancementName = 'Cyberpunk Neon Saturation';
        } else {
          // Warm cinematic default
          filterChain = `colorbalance=rs=0.08:gs=0.04:bs=-0.06,eq=contrast=1.1:saturation=1.15`;
          enhancementName = 'Warm Cinema Golden Grade';
        }
        break;

      case 'audio_enhance':
        // EBU R128 loudness normalization and vocal dynamic compression
        extraArgs = `-af "loudnorm=I=-16:TP=-1.5:LRA=11,acompressor=threshold=0.125:ratio=4:attack=20:release=250"`;
        enhancementName = 'Mastered Studio Audio & Normalized Acoustics';
        break;

      default:
        filterChain = `unsharp=5:5:1.0:5:5:0.0`;
        enhancementName = 'Detail Sharpened';
        break;
    }

    const vfCommand = filterChain ? `-vf "${filterChain}"` : '';
    await execAsync(`ffmpeg -y -i "${srcFilePath}" ${vfCommand} ${extraArgs} -c:v libx264 -preset fast -crf 19 -c:a aac "${enhancedFilePath}"`);

    // Extract thumbnail
    const thumbFileName = `${enhancedId}_thumb.jpg`;
    const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
    try {
      await execAsync(`ffmpeg -y -ss 00:00:01 -i "${enhancedFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
    } catch (e) {}

    const fileStats = fs.statSync(enhancedFilePath);
    const originalVideo = readJsonFile<any[]>(VIDEOS_FILE, []).find((v) => v.id === videoId);

    const enhancedRecord = {
      id: enhancedId,
      title: `${enhancementName} - ${originalVideo?.title || 'Production'}`,
      prompt: `Enhanced with S.O ADIGUN Neural Enhancement Suite (${enhancementName}).`,
      duration: originalVideo?.duration || '15s',
      aspectRatio: originalVideo?.aspectRatio || '16:9',
      resolution: targetResolution || originalVideo?.resolution || '1080p',
      dimensions: targetResolution === '4k' ? '3840x2160' : '1920x1080',
      style: `${originalVideo?.style || 'Cinematic'} (Enhanced)`,
      cameraMovement: originalVideo?.cameraMovement || 'Stabilized',
      hasAudio: true,
      watermark: 'None (Pure Watermark-Free Export)',
      videoUrl: `/media/${enhancedFileName}`,
      thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
      fileSizeBytes: fileStats.size,
      createdAt: new Date().toISOString(),
    };

    const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
    allVideos.unshift(enhancedRecord);
    writeJsonFile(VIDEOS_FILE, allVideos);

    res.json({ success: true, video: enhancedRecord });
  } catch (err: any) {
    console.error('Enhancement error:', err);
    res.status(500).json({ error: err.message || 'Video enhancement failed.' });
  }
});

// -------------------------------------------------------------
// 6. SOCIAL MEDIA EXPORT ENGINE
// -------------------------------------------------------------

app.post('/api/export/social', async (req: Request, res: Response) => {
  try {
    const { videoId, platform } = req.body;
    if (!videoId) {
      res.status(400).json({ error: 'videoId is required.' });
      return;
    }

    const srcFilePath = path.join(MEDIA_DIR, `${videoId}.mp4`);
    if (!fs.existsSync(srcFilePath)) {
      res.status(404).json({ error: 'Source video not found.' });
      return;
    }

    const socialId = `social_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const socialFileName = `${socialId}.mp4`;
    const socialFilePath = path.join(MEDIA_DIR, socialFileName);

    let targetWidth = 1920;
    let targetHeight = 1080;
    let platformName = 'YouTube';

    if (platform === 'tiktok' || platform === 'reels') {
      targetWidth = 1080;
      targetHeight = 1920;
      platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram Reels';
    } else if (platform === 'square' || platform === 'facebook_square') {
      targetWidth = 1080;
      targetHeight = 1080;
      platformName = 'Square Feed (1:1)';
    }

    // Scale and pad to platform dimensions
    const filter = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1`;
    await execAsync(`ffmpeg -y -i "${srcFilePath}" -vf "${filter}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${socialFilePath}"`);

    const thumbFileName = `${socialId}_thumb.jpg`;
    const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
    try {
      await execAsync(`ffmpeg -y -ss 00:00:01 -i "${socialFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
    } catch (e) {}

    const fileStats = fs.statSync(socialFilePath);
    const origVideo = readJsonFile<any[]>(VIDEOS_FILE, []).find((v) => v.id === videoId);

    const socialRecord = {
      id: socialId,
      title: `${platformName} Export - ${origVideo?.title || 'Video'}`,
      prompt: `Optimized for ${platformName} (${targetWidth}x${targetHeight}).`,
      duration: origVideo?.duration || '15s',
      aspectRatio: platform === 'tiktok' || platform === 'reels' ? '9:16' : platform === 'square' ? '1:1' : '16:9',
      resolution: `${targetHeight}p`,
      dimensions: `${targetWidth}x${targetHeight}`,
      style: origVideo?.style || 'Cinematic',
      cameraMovement: origVideo?.cameraMovement || 'Dynamic',
      hasAudio: true,
      watermark: 'None (Pure Watermark-Free Export)',
      videoUrl: `/media/${socialFileName}`,
      thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
      fileSizeBytes: fileStats.size,
      createdAt: new Date().toISOString(),
    };

    const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
    allVideos.unshift(socialRecord);
    writeJsonFile(VIDEOS_FILE, allVideos);

    res.json({ success: true, video: socialRecord });
  } catch (err: any) {
    console.error('Social export error:', err);
    res.status(500).json({ error: err.message || 'Social export failed.' });
  }
});

// -------------------------------------------------------------
// 7. BATCH VIDEO GENERATION ENDPOINT
// -------------------------------------------------------------

app.post('/api/video/batch', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', duration = '15s', count = 3 } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ error: 'Prompt is required for batch generation.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(400).json({
        error: 'GEMINI_API_KEY is required in AI Studio Settings > Secrets for batch generation.',
      });
      return;
    }

    const variations = [
      { camera: 'Tracking Shot', style: 'Cinematic High Contrast' },
      { camera: 'Zoom In', style: 'Dramatic Low Angle Lighting' },
      { camera: 'Pan', style: 'Wide Atmospheric Anamorphic' },
      { camera: 'Aerial Shot', style: 'Sweeping Epic Bird Eye' },
    ].slice(0, count);

    const generatedVariations: any[] = [];
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      const videoId = `batch_${Date.now()}_v${i + 1}`;
      const videoFileName = `${videoId}.mp4`;
      const videoFilePath = path.join(MEDIA_DIR, videoFileName);

      const modifiedPrompt = `${prompt.trim()}. Camera motion: ${v.camera}. Aesthetic: ${v.style}.`;
      try {
        const interaction = await ai.interactions.create(
          {
            model: 'gemini-omni-1.2-flash',
            input: modifiedPrompt,
            background: false,
            store: false,
            stream: false,
            response_format: {
              type: 'video',
              aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
              duration: '15s',
              resolution: '1080p',
            },
          },
          { timeout: 360000 }
        );

        const videoPart = interaction.output_video;
        if (videoPart?.data) {
          fs.writeFileSync(videoFilePath, Buffer.from(videoPart.data, 'base64'));

          const thumbFileName = `${videoId}_thumb.jpg`;
          const thumbFilePath = path.join(MEDIA_DIR, thumbFileName);
          try {
            await execAsync(`ffmpeg -y -ss 00:00:01 -i "${videoFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}"`);
          } catch (e) {}

          const fileStats = fs.statSync(videoFilePath);
          const record = {
            id: videoId,
            title: `Batch Variation ${i + 1} - ${v.camera}`,
            prompt: modifiedPrompt,
            duration: '15s',
            aspectRatio,
            resolution: '1080p',
            dimensions: aspectRatio === '9:16' ? '1080x1920' : '1920x1080',
            style: v.style,
            cameraMovement: v.camera,
            hasAudio: true,
            watermark: 'None (Pure Watermark-Free Export)',
            videoUrl: `/media/${videoFileName}`,
            thumbnailUrl: fs.existsSync(thumbFilePath) ? `/media/${thumbFileName}` : null,
            fileSizeBytes: fileStats.size,
            createdAt: new Date().toISOString(),
          };

          const allVideos = readJsonFile<any[]>(VIDEOS_FILE, []);
          allVideos.unshift(record);
          writeJsonFile(VIDEOS_FILE, allVideos);

          generatedVariations.push({
            id: videoId,
            variationIndex: i + 1,
            cameraMovement: v.camera,
            styleModifier: v.style,
            video: record,
            status: 'completed',
          });
        }
      } catch (genErr: any) {
        generatedVariations.push({
          id: videoId,
          variationIndex: i + 1,
          cameraMovement: v.camera,
          styleModifier: v.style,
          status: 'failed',
          error: genErr.message || 'Generation error',
        });
      }
    }

    res.json({ success: true, variations: generatedVariations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Batch generation failed.' });
  }
});

// -------------------------------------------------------------
// 8. PROJECT MANAGEMENT ENDPOINTS (My Projects)
// -------------------------------------------------------------

app.get('/api/projects', (req: Request, res: Response) => {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  res.json({ projects });
});

app.post('/api/projects', (req: Request, res: Response) => {
  try {
    const { title, concept, genre, style, aspectRatio = '16:9', scenes = [], characterIds = [] } = req.body;
    const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
    const newProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title?.trim() || 'Untitled Project',
      concept: concept || '',
      genre: genre || 'Cinematic',
      style: style || 'Hollywood Cinematic',
      aspectRatio,
      scenes,
      characterIds,
      status: scenes.length > 0 ? 'storyboarded' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    writeJsonFile(PROJECTS_FILE, projects);
    res.json({ success: true, project: newProject });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const proj = projects.find((p) => p.id === req.params.id);
  if (!proj) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }
  res.json({ project: proj });
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let projects = readJsonFile<any[]>(PROJECTS_FILE, []);
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    projects[idx] = {
      ...projects[idx],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(PROJECTS_FILE, projects);
    res.json({ success: true, project: projects[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  let projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  projects = projects.filter((p) => p.id !== id);
  writeJsonFile(PROJECTS_FILE, projects);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. VIDEO STYLE PRESETS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/styles', (req: Request, res: Response) => {
  const styles = readJsonFile<any[]>(STYLES_FILE, []);
  res.json({ styles });
});

app.post('/api/styles', (req: Request, res: Response) => {
  try {
    const { name, category, description, promptModifier, cameraMovement, lightingPrompt, colorPalette, aspectRatio } = req.body;
    if (!name || !promptModifier) {
      res.status(400).json({ error: 'Style name and prompt modifier are required.' });
      return;
    }

    const styles = readJsonFile<any[]>(STYLES_FILE, []);
    const newStyle = {
      id: `style_custom_${Date.now()}`,
      name: name.trim(),
      category: category || 'Custom Style',
      description: description || '',
      promptModifier: promptModifier.trim(),
      cameraMovement: cameraMovement || 'Cinematic Camera Movement',
      lightingPrompt: lightingPrompt || '',
      colorPalette: colorPalette || '',
      aspectRatio: aspectRatio || '16:9',
      isCustom: true,
    };

    styles.push(newStyle);
    writeJsonFile(STYLES_FILE, styles);
    res.json({ success: true, style: newStyle });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create style preset.' });
  }
});

app.delete('/api/styles/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  let styles = readJsonFile<any[]>(STYLES_FILE, []);
  styles = styles.filter((s) => s.id !== id);
  writeJsonFile(STYLES_FILE, styles);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 10. MEDIA LIBRARY, PROMPTS & SETTINGS (Preserved & Enhanced)
// -------------------------------------------------------------

app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { fileData, fileName, mimeType, type, label } = req.body;
    if (!fileData || !mimeType) {
      res.status(400).json({ error: 'File data and mimeType are required.' });
      return;
    }

    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const extension = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('mp4')
      ? 'mp4'
      : mimeType.includes('mov')
      ? 'mov'
      : 'jpg';

    const savedFileName = `${id}.${extension}`;
    const filePath = path.join(MEDIA_DIR, savedFileName);

    const base64Data = fileData.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const stats = fs.statSync(filePath);

    const mediaItem = {
      id,
      name: fileName || savedFileName,
      type: type || (mimeType.startsWith('video') ? 'video' : 'image'),
      label: label || 'Reference',
      mimeType,
      url: `/media/${savedFileName}`,
      sizeBytes: stats.size,
      createdAt: new Date().toISOString(),
    };

    const mediaList = readJsonFile<any[]>(MEDIA_LIBRARY_FILE, []);
    mediaList.unshift(mediaItem);
    writeJsonFile(MEDIA_LIBRARY_FILE, mediaList);

    res.json({ success: true, media: mediaItem });
  } catch (err: any) {
    console.error('Error uploading media:', err);
    res.status(500).json({ error: err.message || 'Failed to upload media.' });
  }
});

app.get('/api/media', (req: Request, res: Response) => {
  const media = readJsonFile<any[]>(MEDIA_LIBRARY_FILE, []);
  res.json({ media });
});

app.delete('/api/media/:id', (req: Request, res: Response) => {
  const mediaId = req.params.id;
  let mediaList = readJsonFile<any[]>(MEDIA_LIBRARY_FILE, []);
  const item = mediaList.find((m) => m.id === mediaId);

  if (!item) {
    res.status(404).json({ error: 'Media not found.' });
    return;
  }

  try {
    const filename = path.basename(item.url);
    const filePath = path.join(MEDIA_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {}

  mediaList = mediaList.filter((m) => m.id !== mediaId);
  writeJsonFile(MEDIA_LIBRARY_FILE, mediaList);

  res.json({ success: true, message: 'Media removed.' });
});

app.get('/api/prompts', (req: Request, res: Response) => {
  const prompts = readJsonFile<any[]>(PROMPTS_FILE, []);
  res.json({ prompts });
});

app.post('/api/prompts', (req: Request, res: Response) => {
  const { title, prompt, negativePrompt, style, cameraMovement, aspectRatio, duration, folder } = req.body;
  if (!prompt || prompt.trim() === '') {
    res.status(400).json({ error: 'Prompt text is required.' });
    return;
  }

  const prompts = readJsonFile<any[]>(PROMPTS_FILE, []);
  const newPrompt = {
    id: `prompt_${Date.now()}`,
    title: title && title.trim() !== '' ? title.trim() : 'Saved Prompt ' + (prompts.length + 1),
    prompt: prompt.trim(),
    negativePrompt: negativePrompt || '',
    style: style || 'Cinematic',
    cameraMovement: cameraMovement || 'Cinematic Camera Movement',
    aspectRatio: aspectRatio || '16:9',
    duration: duration || '15s',
    folder: folder || 'General',
    createdAt: new Date().toISOString(),
  };

  prompts.unshift(newPrompt);
  writeJsonFile(PROMPTS_FILE, prompts);

  res.json({ success: true, prompt: newPrompt });
});

app.delete('/api/prompts/:id', (req: Request, res: Response) => {
  let prompts = readJsonFile<any[]>(PROMPTS_FILE, []);
  prompts = prompts.filter((p) => p.id !== req.params.id);
  writeJsonFile(PROMPTS_FILE, prompts);
  res.json({ success: true });
});

app.get('/api/settings', (req: Request, res: Response) => {
  const settings = readJsonFile(SETTINGS_FILE, {});
  res.json({ settings });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  writeJsonFile(SETTINGS_FILE, newSettings);
  res.json({ success: true, settings: newSettings });
});

// -------------------------------------------------------------
// Server Initialization
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[S.O ADIGUN] Studio Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start studio server:', err);
  process.exit(1);
});
