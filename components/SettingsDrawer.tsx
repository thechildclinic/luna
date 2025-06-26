
import React from 'react';
import { VoiceOption, UserProfile, JournalingMode, ThemeOption } from '../types';
import { CloseIcon, VolumeOffIcon, VolumeUpIcon, TrashIcon, CheckCircleIcon } from './icons';
import { THEME_OPTIONS } from '../constants';


interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  supportedVoices: VoiceOption[];
  selectedVoiceURI: string | null;
  onVoiceChange: (uri: string) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  onForgetMe: () => void;
  currentProfile: UserProfile | null;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  supportedVoices,
  selectedVoiceURI,
  onVoiceChange,
  speechRate,
  onSpeechRateChange,
  isMuted,
  toggleMute,
  onForgetMe, 
  currentProfile,
  currentTheme,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  const handleForgetMeClick = () => {
    const mode = currentProfile?.journalingMode;
    const confirmMessage = mode === JournalingMode.PERSISTENT 
      ? "Are you sure you want to clear your symbolic name, journaling mode, and all conversation history? This action cannot be undone."
      : "Are you sure you want to end this session and clear your current symbolic name and mode preference? This action cannot be undone.";
      
    if (window.confirm(confirmMessage)) {
      onForgetMe();
    }
  };

  const getModeDisplayName = (mode?: JournalingMode) => {
    if (mode === JournalingMode.EPHEMERAL) return "Daily Reflection (Ephemeral)";
    if (mode === JournalingMode.PERSISTENT) return "Continuous Journey (Persistent)";
    return "Unknown";
  };
  
  const getPrivacyText = (mode?: JournalingMode) => {
    if (mode === JournalingMode.PERSISTENT) {
      return "You are in 'Continuous Journey' mode. Your symbolic name, chosen mode, and conversation history are stored locally and privately in this web browser. This data is not shared with external servers for storage purposes and is only used by Luna to remember your journey within this browser. Clearing your browser data or using a different browser will remove this access.";
    }
    return "You are in 'Daily Reflection' mode. Your conversations with Luna are not stored by this application beyond the current session. Each time you start, it's a fresh beginning.";
  };

  const getButtonClass = (themeId: string) => {
    let baseClass = "w-full text-left p-3 rounded-lg border-2 transition-all duration-150 ease-in-out flex items-center justify-between";
    if (themeId === currentTheme) {
      return `${baseClass} bg-[var(--theme-accent-primary)] border-[var(--theme-accent-primary-hover)] text-[var(--theme-button-primary-text)]`;
    }
    return `${baseClass} bg-[var(--theme-input-bg)] border-[var(--theme-input-border)] hover:border-[var(--theme-accent-primary)] text-[var(--theme-text-primary)]`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-end" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div 
        className="w-full max-w-sm h-full shadow-2xl p-6 text-[var(--theme-text-primary)] overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col"
        style={{ backgroundColor: 'var(--theme-settings-drawer-bg)' }}
        onClick={(e) => e.stopPropagation()} 
        role="document"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-semibold" style={{fontFamily: "'Lora', serif", color: 'var(--theme-accent-primary)'}}>Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--theme-input-bg)] transition-colors" aria-label="Close settings">
            <CloseIcon className="w-6 h-6 text-[var(--theme-text-muted)]" />
          </button>
        </div>

        <div className="flex-grow space-y-6">
          {currentProfile && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)'}}>
              <p className="text-sm" style={{color: 'var(--theme-text-secondary)'}}>Current Mode:</p>
              <p className="font-semibold" style={{color: 'var(--theme-accent-primary)'}}>{getModeDisplayName(currentProfile.journalingMode)}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="theme-select" className="block text-sm font-medium mb-1" style={{color: 'var(--theme-text-secondary)'}}>Theme:</label>
            <div className="space-y-2">
              {THEME_OPTIONS.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={getButtonClass(theme.id)}
                  aria-pressed={theme.id === currentTheme}
                >
                  <span>{theme.name}</span>
                  {theme.id === currentTheme && <CheckCircleIcon className="w-5 h-5 text-[var(--theme-button-primary-text)]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="voice-select" className="block text-sm font-medium mb-1" style={{color: 'var(--theme-text-secondary)'}}>Luna's Voice:</label>
            <select
              id="voice-select"
              value={selectedVoiceURI || ''}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-[var(--theme-input-focus-ring)] outline-none"
              style={{ 
                backgroundColor: 'var(--theme-input-bg)', 
                borderColor: 'var(--theme-input-border)',
                color: 'var(--theme-text-primary)',
                // ringColor was here, removed as it's handled by className
                borderWidth: '1px'
              }}
            >
              {supportedVoices.length === 0 && <option value="">Loading voices...</option>}
              {supportedVoices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI} style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text-primary)'}}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="speed-range" className="block text-sm font-medium mb-1" style={{color: 'var(--theme-text-secondary)'}}>
              Speaking Speed: <span className="font-normal" style={{color: 'var(--theme-accent-primary)'}}>{speechRate.toFixed(1)}x</span>
            </label>
            <input
              id="speed-range"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--theme-input-border)', accentColor: 'var(--theme-accent-primary)' }}
            />
          </div>

          <div>
              <button
                  onClick={toggleMute}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg border focus:ring-2 focus:ring-[var(--theme-input-focus-ring)] outline-none transition-colors"
                  style={{ 
                    backgroundColor: 'var(--theme-input-bg)', 
                    borderColor: 'var(--theme-input-border)',
                    color: 'var(--theme-text-primary)',
                    // ringColor was here, removed as it's handled by className
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--theme-accent-primary)';
                  }}
                  onMouseOut={e => {
                     e.currentTarget.style.borderColor = 'var(--theme-input-border)';
                  }}
              >
                  {isMuted ? <VolumeOffIcon className="w-5 h-5 mr-2"/> : <VolumeUpIcon className="w-5 h-5 mr-2" />}
                  {isMuted ? "Unmute Luna's Voice" : "Mute Luna's Voice"}
              </button>
          </div>

          <div className="border-t pt-6" style={{borderColor: 'var(--theme-input-border)'}}>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--theme-accent-primary)'}}>Privacy & Data</h3>
            <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--theme-text-secondary)'}}>
              {getPrivacyText(currentProfile?.journalingMode)}
            </p>
             <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--theme-text-secondary)'}}>
               Interactions with Luna are processed by Google's AI model. This application itself does not store your journal entries on external servers.
            </p>
            <button
                onClick={handleForgetMeClick}
                className="w-full flex items-center justify-center p-2.5 bg-red-700 hover:bg-red-600 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 outline-none text-white transition-colors"
            >
                <TrashIcon className="w-5 h-5 mr-2"/>
                {currentProfile?.journalingMode === JournalingMode.PERSISTENT ? "Clear Stored Journey & Name" : "End Session & Start Fresh"}
            </button>
          </div>
        </div>
        
        <p className="text-xs mt-auto text-center pt-4 border-t" style={{color: 'var(--theme-text-muted)', borderColor: 'var(--theme-input-border)'}}>
          Luna is an AI companion and not a replacement for professional therapy. If you are in distress, please seek help from a qualified professional.
        </p>
      </div>
    </div>
  );
};

export default SettingsDrawer;
