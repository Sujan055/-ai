
export enum ThemeMode {
  JARVIS = 'theme-jarvis',
  FRIDAY = 'theme-friday',
  ULTRON = 'theme-ultron'
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'working' | 'ready';
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
