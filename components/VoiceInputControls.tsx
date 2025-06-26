
import React from 'react';
import { AppPhase } from '../types';
import { MicrophoneIcon, StopIcon, PaperPlaneIcon } from './icons';

interface VoiceInputControlsProps {
  appPhase: AppPhase;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void; // This will now also act as "send"
  userTranscript: string;
  isMuted: boolean;
  toggleMute: () => void;
  hasRecognitionSupport: boolean;
  micError: string | null;
}

const VoiceInputControls: React.FC<VoiceInputControlsProps> = ({
  appPhase,
  isListening,
  startListening,
  stopListening,
  userTranscript,
  hasRecognitionSupport,
  micError,
}) => {
  const isDisabledByAppPhase = 
    appPhase === AppPhase.LUNA_THINKING || 
    appPhase === AppPhase.LUNA_SPEAKING ||
    appPhase === AppPhase.INITIAL_SETUP ||
    appPhase === AppPhase.PROCESSING_USER_INPUT;

  const getButtonState = () => {
    let styleProps = { 
        backgroundColor: 'var(--theme-button-primary-bg)', 
        color: 'var(--theme-button-primary-text)',
        ringColor: 'var(--theme-accent-primary)' // This will be used for className
    };
    let hoverBg = 'var(--theme-button-primary-hover)';

    if (isListening) {
      if (userTranscript.trim() !== "") { // Send
        styleProps = { backgroundColor: 'var(--theme-accent-secondary)', color: 'var(--theme-button-primary-text)', ringColor: 'var(--theme-accent-secondary)'};
        hoverBg = 'rgba(from var(--theme-accent-secondary) r g b / 0.8)'; 
        return { text: 'Send', Icon: PaperPlaneIcon, action: stopListening, styleProps, hoverBg, aria: 'Send voice input' };
      } // Stop
      styleProps = { backgroundColor: 'var(--theme-accent-primary)', color: 'var(--theme-button-primary-text)', ringColor: 'var(--theme-accent-primary)'}; 
      hoverBg = 'var(--theme-accent-primary-hover)'; 
      return { text: 'Stop', Icon: StopIcon, action: stopListening, styleProps, hoverBg, aria: 'Stop listening' };
    } // Speak
    return { text: 'Speak', Icon: MicrophoneIcon, action: startListening, styleProps, hoverBg, aria: 'Start speaking to Luna' };
  };

  const buttonState = getButtonState();

  if (!hasRecognitionSupport) {
    return (
      <div className="p-4 border-t text-center text-red-400" style={{ borderColor: 'var(--theme-input-border)', backgroundColor: 'var(--theme-header-bg)'}}>
        Voice input is not supported by your browser.
      </div>
    );
  }
  
  return (
    <div className="p-4 border-t backdrop-blur-sm rounded-b-lg" style={{ borderColor: 'var(--theme-input-border)', backgroundColor: 'var(--theme-header-bg)'}}>
      {micError && <p className="text-red-400 text-sm text-center mb-2 px-2">{micError}</p>}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={buttonState.action}
          disabled={isDisabledByAppPhase}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-150 ease-in-out flex items-center space-x-2 shadow-lg
                      focus:ring-4 focus:ring-opacity-50 
                      transform hover:scale-105 active:scale-95
                      focus:ring-[${isDisabledByAppPhase ? 'transparent' : buttonState.styleProps.ringColor}]`}
          style={{ 
            backgroundColor: isDisabledByAppPhase ? 'var(--theme-text-muted)' : buttonState.styleProps.backgroundColor,
            color: buttonState.styleProps.color,
            cursor: isDisabledByAppPhase ? 'not-allowed' : 'pointer',
            opacity: isDisabledByAppPhase ? 0.7 : 1,
            // ringColor was here, removed as it's handled by className
           }}
          onMouseOver={e => { if(!isDisabledByAppPhase) e.currentTarget.style.backgroundColor = buttonState.hoverBg;}}
          onMouseOut={e => { if(!isDisabledByAppPhase) e.currentTarget.style.backgroundColor = buttonState.styleProps.backgroundColor;}}
          aria-label={buttonState.aria}
        >
          <buttonState.Icon className="w-6 h-6" />
          <span>
            {isListening 
              ? (userTranscript.trim() !== "" ? "Send" : "Stop") 
              : (isDisabledByAppPhase && (appPhase === AppPhase.LUNA_SPEAKING || appPhase === AppPhase.LUNA_THINKING) 
                  ? 'Luna is active' 
                  : buttonState.text)}
          </span>
        </button>
      </div>
      {(isListening && userTranscript) && (
        <p className="text-center italic mt-3 text-sm h-6 px-4 truncate" title={userTranscript} style={{color: 'var(--theme-text-secondary)'}}>
          {`"${userTranscript}"`}
        </p>
      )}
       {(!isListening && userTranscript && appPhase === AppPhase.READY_TO_CHAT) && ( 
        <p className="text-center mt-3 text-sm h-6 px-4 truncate" title={`You said: "${userTranscript}"`} style={{color: 'var(--theme-text-secondary)'}}>
          {/* Keep showing last transcript if available and not actively listening, until processed */}
        </p>
      )}
       {!(isListening && userTranscript) && !(!isListening && userTranscript && appPhase === AppPhase.READY_TO_CHAT) && (
         <div className="h-6 mt-3"></div>
       )}
    </div>
  );
};

export default VoiceInputControls;
