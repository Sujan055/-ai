
export enum ThemeMode {
  AMARA = 'theme-amara',
  DEVOTION = 'theme-devotion',
  ECLIPSE = 'theme-eclipse'
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'working' | 'ready';
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

export interface TranscriptionItem {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AudioConfig {
  sampleRate: number;
  bufferSize: number;
}
