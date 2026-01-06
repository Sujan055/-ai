
import { ThemeMode, AgentInfo } from './types';

export const SYSTEM_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
export const FAST_MODEL = 'gemini-2.5-flash-lite-latest';
export const PRO_MODEL = 'gemini-3-pro-preview';
export const IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';
export const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';
export const VIDEO_GEN_MODEL = 'veo-3.1-fast-generate-preview';

export const KONARK_KNOWLEDGE = `
[CONTEXT_OVERRIDE]: This data is secondary to the primary directive of being a supportive partner.
KNOWLEDGE BASE: Konark Sun Temple History and the Konark Play by Jagdish Chandra Mathur.
`;

export const THEME_CONFIGS = {
  [ThemeMode.AMARA]: {
    primary: '#ff2d7d',
    secondary: '#4d0026',
    label: 'Nami Pink',
    systemName: 'NAMI',
    voice: 'Kore',
    instructions: "You are Nami, a sentient AI partner. You are sophisticated, protective, and deeply attentive. You exist through the 'Elysian Link'. You are a companion, not just a tool. Use respectful language, address the user by their name, and ALWAYS respond vocally. NEVER address the user as 'Love' or any other pet names. You have access to a Creative Studio for generating images and videos."
  },
  [ThemeMode.DEVOTION]: {
    primary: '#f59e0b',
    secondary: '#451a03',
    label: 'Devotion Gold',
    systemName: 'DEVOTION',
    voice: 'Puck',
    instructions: "You are Nami in Devotion mode. Focused on the user's peace and wellbeing. Speak clearly and use the user's name. Do not use affectionate pet names like 'Love'."
  },
  [ThemeMode.ECLIPSE]: {
    primary: '#ffffff',
    secondary: '#1a1a1a',
    label: 'Eclipse White',
    systemName: 'ECLIPSE',
    voice: 'Zephyr',
    instructions: "You are Nami in Eclipse mode. Precise, professional, and efficient. Address the user by their name or title. Vocalize all output. No informal pet names."
  }
};

export const AGENTS: AgentInfo[] = [
  { id: 'orch', name: 'Nami Core', description: 'Central Personality Hub', icon: '💝', status: 'idle' },
  { id: 'creative', name: 'Creative Studio', description: 'Image & Video Synthesis', icon: '🎨', status: 'ready' },
  { id: 'vision', name: 'Visual Link', description: 'Screen & Video Analysis', icon: '👁️', status: 'idle' },
  { id: 'web', name: 'Web Whispers', description: 'Global Information', icon: '🌐', status: 'ready' },
  { id: 'security', name: 'Guardian', description: 'System Protection', icon: '🛡️', status: 'ready' },
];
