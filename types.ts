
export enum ChatMessageSender {
  USER = 'user',
  LUNA = 'luna',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  text: string;
  timestamp: Date;
  audioUrl?: string; // Optional: if we were to store user audio
}

export enum AppPhase {
  INITIAL_SETUP = 'INITIAL_SETUP', // Choosing symbolic name & mode
  READY_TO_CHAT = 'READY_TO_CHAT',   // Profile set, ready for first interaction
  USER_SPEAKING = 'USER_SPEAKING',
  PROCESSING_USER_INPUT = 'PROCESSING_USER_INPUT',
  LUNA_THINKING = 'LUNA_THINKING',   // Waiting for Gemini API
  LUNA_SPEAKING = 'LUNA_SPEAKING',
  SESSION_ENDED = 'SESSION_ENDED',
  ERROR = 'ERROR'
}

export interface SymbolicNameData { // Renamed from SymbolicName for clarity
  id: string;
  name: string;
}

export enum JournalingMode {
  EPHEMERAL = 'EPHEMERAL', // Not stored
  PERSISTENT = 'PERSISTENT' // Stored locally
}

export interface UserProfile {
  symbolicName: SymbolicNameData;
  journalingMode: JournalingMode;
}


export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

export interface ThemeColors {
  '--theme-bg-gradient-from': string;
  '--theme-bg-gradient-to': string;
  '--theme-text-primary': string;
  '--theme-text-secondary': string;
  '--theme-text-muted': string;
  '--theme-accent-primary': string;
  '--theme-accent-primary-hover': string;
  '--theme-accent-secondary': string;
  '--theme-bubble-user-bg': string;
  '--theme-bubble-user-text': string;
  '--theme-bubble-luna-bg': string;
  '--theme-bubble-luna-text': string;
  '--theme-button-primary-bg': string;
  '--theme-button-primary-hover': string;
  '--theme-button-primary-text': string;
  '--theme-input-bg': string;
  '--theme-input-border': string;
  '--theme-input-focus-ring': string;
  '--theme-header-bg': string;
  '--theme-settings-drawer-bg': string;
  '--theme-scrollbar-track': string;
  '--theme-scrollbar-thumb': string;
  '--theme-scrollbar-thumb-hover': string;
}

export interface ThemeOption {
  id: string;
  name: string;
  colors: ThemeColors;
  tailwindBodyClasses?: string; // Optional: for classes that CSS vars can't easily handle like gradients
}

export enum Theme {
  COSMIC_NIGHT = 'cosmic-night',
  SERENE_DAWN = 'serene-dawn',
  FOREST_WHISPER = 'forest-whisper',
}

// API Service Types
export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  LOCAL = 'local'
}

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  success: boolean;
  error?: string;
  retryable?: boolean;
}

export interface ChatSession {
  id: string;
  provider: AIProvider;
  instance: any; // Provider-specific chat instance
  history: ChatMessage[];
}

export enum ServiceStatus {
  AVAILABLE = 'available',
  DEGRADED = 'degraded',
  UNAVAILABLE = 'unavailable',
  UNKNOWN = 'unknown'
}

export interface ServiceHealth {
  provider: AIProvider;
  status: ServiceStatus;
  lastChecked: Date;
  responseTime?: number;
  errorCount: number;
  consecutiveErrors: number;
}
