
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat, Content } from '@google/genai';
import { AppPhase, ChatMessage, ChatMessageSender, UserProfile, JournalingMode, ThemeOption } from './types';
import { DEFAULT_VOICE_SETTINGS, THEME_OPTIONS, GEMINI_CHAT_MODEL } from './constants';
import SymbolicNameInput from './components/SymbolicNameInput';
import ChatView from './components/ChatView';
import VoiceInputControls from './components/VoiceInputControls';
import SettingsDrawer from './components/SettingsDrawer';
import { initLunaChat, sendUserMessageToLuna } from './services/geminiService';
import * as storageService from './services/storageService';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
import { SettingsIcon, VolumeUpIcon, VolumeOffIcon } from './components/icons';

const convertMessagesToGeminiHistory = (messages: ChatMessage[]): Content[] => {
  return messages
    .map(msg => {
      if (msg.sender === ChatMessageSender.USER) {
        return { role: 'user' as const, parts: [{ text: msg.text }] };
      } else if (msg.sender === ChatMessageSender.LUNA) {
        return { role: 'model' as const, parts: [{ text: msg.text }] };
      }
      return null;
    })
    .filter(item => item !== null);
};


const App: React.FC = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>(AppPhase.INITIAL_SETUP);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lunaChat, setLunaChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lunaStatusText, setLunaStatusText] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>(THEME_OPTIONS[0].id);
  
  const applyTheme = useCallback((themeId: string) => {
    const theme = THEME_OPTIONS.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // For body gradient, direct class manipulation is often easier with Tailwind CDN
    document.body.className = theme.tailwindBodyClasses || ''; // Reset and apply new classes
    // Add back any other persistent body classes if needed, e.g., font class
    document.body.classList.add('text-[var(--theme-text-primary)]'); // ensure text color is from theme

    setCurrentTheme(themeId);
    storageService.saveSelectedTheme(themeId);
  }, []);

  useEffect(() => {
    const savedThemeId = storageService.loadSelectedTheme();
    applyTheme(savedThemeId || THEME_OPTIONS[0].id);
    
    if (typeof process.env.API_KEY === 'undefined' || process.env.API_KEY === "") {
      setError("API_KEY_MISSING");
      setAppPhase(AppPhase.ERROR);
      setIsInitialized(true);
      return;
    }

    const loadedProfile = storageService.loadUserProfile();
    if (loadedProfile) {
      setUserProfile(loadedProfile);
      let historyToLoad: ChatMessage[] | null = null;
      if (loadedProfile.journalingMode === JournalingMode.PERSISTENT) {
        historyToLoad = storageService.loadChatHistory(loadedProfile.symbolicName.id);
      }

      if (historyToLoad && historyToLoad.length > 0) {
        setMessages(historyToLoad);
        const geminiHistory = convertMessagesToGeminiHistory(historyToLoad);
        const chatInstance = initLunaChat(loadedProfile.symbolicName.name, geminiHistory);
        if (chatInstance) {
          setLunaChat(chatInstance);
          setAppPhase(AppPhase.READY_TO_CHAT);
        } else {
          setError("Failed to initialize chat with Luna. Please check API key and try again.");
          setAppPhase(AppPhase.ERROR);
        }
      } else {
        handleProfileSelected(loadedProfile, true); 
      }
    } else {
      setAppPhase(AppPhase.INITIAL_SETUP);
    }
    setIsInitialized(true);
  }, [applyTheme]); // applyTheme added to dependencies

  useEffect(() => {
    if (isInitialized && userProfile && userProfile.journalingMode === JournalingMode.PERSISTENT && messages.length > 0) {
      storageService.saveChatHistory(userProfile.symbolicName.id, messages);
    }
  }, [messages, userProfile, isInitialized]);


  const addMessage = useCallback((sender: ChatMessageSender, text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, timestamp: new Date() }]);
  }, []);

  const {
    speak: lunaSpeak,
    cancel: lunaCancelSpeech,
    isSpeaking: isLunaSpeaking,
    supportedVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    isSupported: ttsSupported,
    speechError: ttsError,
  } = useSpeechSynthesis();

  const {
    isListening: isUserListening,
    transcript: userTranscript, 
    finalizedText: userFinalizedSpeech, 
    error: micError,
    startListening: startUserListening,
    stopListening: stopUserListening,
    hasRecognitionSupport,
    resetTranscript: resetUserLiveTranscript, 
    clearFinalizedText: clearUserFinalizedSpeech
  } = useSpeechRecognition();


  const handleUserSpeechResult = useCallback(async (text: string) => {
    if (!text.trim()) {
        resetUserLiveTranscript(); 
        return;
    }
    
    addMessage(ChatMessageSender.USER, text);
    setAppPhase(AppPhase.PROCESSING_USER_INPUT); 
    setLunaStatusText('Processing your thoughts...');

    if (lunaChat) {
      setAppPhase(AppPhase.LUNA_THINKING);
      setLunaStatusText('Luna is thinking...');
      resetUserLiveTranscript(); 
      
      const lunaResponseText = await sendUserMessageToLuna(lunaChat, text, messages);
      if (lunaResponseText) {
        addMessage(ChatMessageSender.LUNA, lunaResponseText);
        setAppPhase(AppPhase.LUNA_SPEAKING);
        setLunaStatusText('Luna is speaking...');
        if (!isMuted && ttsSupported) {
           lunaSpeak(lunaResponseText);
        } else {
            setTimeout(() => setAppPhase(AppPhase.READY_TO_CHAT), 500);
        }
      } else {
        addMessage(ChatMessageSender.SYSTEM, "Sorry, I couldn't get a response. Please try again.");
        setAppPhase(AppPhase.ERROR);
        setError("Failed to get response from Luna.");
      }
    }
  }, [addMessage, lunaChat, messages, lunaSpeak, isMuted, ttsSupported, resetUserLiveTranscript]);

  useEffect(() => {
    if (userFinalizedSpeech) {
      handleUserSpeechResult(userFinalizedSpeech);
      clearUserFinalizedSpeech(); 
    }
  }, [userFinalizedSpeech, handleUserSpeechResult, clearUserFinalizedSpeech]);


  useEffect(() => {
    if (appPhase === AppPhase.LUNA_SPEAKING && !isLunaSpeaking && !isMuted) {
      setAppPhase(AppPhase.READY_TO_CHAT);
      setLunaStatusText('');
    }
  }, [appPhase, isLunaSpeaking, isMuted]);

  useEffect(() => {
    if (ttsError) {
      console.error("TTS Error from hook:", ttsError);
      // ttsError from the hook is now a full, user-friendly message.
      addMessage(ChatMessageSender.SYSTEM, `${ttsError} Displaying text only.`);
      if (appPhase === AppPhase.LUNA_SPEAKING) {
        setAppPhase(AppPhase.READY_TO_CHAT);
      }
    }
  }, [ttsError, addMessage, appPhase]);

  const handleProfileSelected = useCallback(async (profile: UserProfile, isLoadScenario = false) => {
    storageService.saveUserProfile(profile);
    setUserProfile(profile);
    resetUserLiveTranscript();

    const noPriorHistoryLoaded = !(isLoadScenario && profile.journalingMode === JournalingMode.PERSISTENT && storageService.loadChatHistory(profile.symbolicName.id));

    if (noPriorHistoryLoaded) {
        setMessages([]); 
        const chatInstance = initLunaChat(profile.symbolicName.name); 
        if (chatInstance) {
            setLunaChat(chatInstance);
            setAppPhase(AppPhase.LUNA_THINKING); 
            setLunaStatusText('Luna is preparing...');
            
            try {
                const initialResponse = await sendUserMessageToLuna(chatInstance, "Hello Luna, I'm ready to start.", []);
                if (initialResponse) {
                    addMessage(ChatMessageSender.LUNA, initialResponse);
                    setAppPhase(AppPhase.LUNA_SPEAKING);
                    setLunaStatusText('Luna is speaking...');
                    if (!isMuted && ttsSupported) {
                        lunaSpeak(initialResponse);
                    } else {
                        setTimeout(() => setAppPhase(AppPhase.READY_TO_CHAT), 500);
                    }
                } else {
                    addMessage(ChatMessageSender.SYSTEM, "Welcome! I'm ready when you are.");
                    setAppPhase(AppPhase.READY_TO_CHAT);
                }
            } catch (err) {
                console.error("Error getting initial greeting:", err);
                addMessage(ChatMessageSender.SYSTEM, "There was an issue starting our chat. Please try refreshing.");
                setAppPhase(AppPhase.ERROR);
                setError("Failed to initialize chat.");
            }
        } else {
            setAppPhase(AppPhase.ERROR);
            setError("Failed to initialize chat with Luna. Please check API key and try again.");
        }
    } else if (isLoadScenario && profile.journalingMode === JournalingMode.PERSISTENT && !lunaChat) {
        const loadedHistory = storageService.loadChatHistory(profile.symbolicName.id)!;
        const geminiHistory = convertMessagesToGeminiHistory(loadedHistory);
        const chatInstance = initLunaChat(profile.symbolicName.name, geminiHistory);
        if (chatInstance) {
          setLunaChat(chatInstance);
          setAppPhase(AppPhase.READY_TO_CHAT); 
        } else {
          setError("Failed to initialize chat with Luna (on load with history).");
          setAppPhase(AppPhase.ERROR);
        }
    }
}, [addMessage, lunaSpeak, isMuted, ttsSupported, resetUserLiveTranscript, lunaChat]);


  const toggleMute = () => {
    setIsMuted(prev => {
        const newMutedState = !prev;
        if (newMutedState && isLunaSpeaking) {
            lunaCancelSpeech(); 
        }
        return newMutedState;
    });
  };

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prevMessages => {
      const newMessages = prevMessages.filter(msg => msg.id !== messageId);
      if (userProfile && userProfile.journalingMode === JournalingMode.PERSISTENT) {
        storageService.saveChatHistory(userProfile.symbolicName.id, newMessages);
      }
      return newMessages;
    });
  }, [userProfile]);

  const handleForgetMe = useCallback(() => {
    if (userProfile) {
      storageService.clearChatHistory(userProfile.symbolicName.id);
    }
    storageService.clearUserProfile();
    setUserProfile(null);
    setMessages([]);
    setLunaChat(null);
    setAppPhase(AppPhase.INITIAL_SETUP);
    setIsSettingsOpen(false);
    setError(null);
  }, [userProfile]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8" style={{ backgroundColor: 'var(--theme-bg-gradient-from)', color: 'var(--theme-accent-primary)'}}>
        <h1 className="text-2xl font-bold mb-4 animate-pulse">Initializing Luna...</h1>
      </div>
    );
  }

  if (error === "API_KEY_MISSING") {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8" style={{ backgroundColor: 'var(--theme-bg-gradient-from)', color: 'red'}}>
        <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
        <p>The API_KEY is not configured for this application.</p>
        <p className="mt-2 text-sm" style={{color: 'var(--theme-text-secondary)'}}>Please ensure the API_KEY environment variable is correctly set by the hosting environment.</p>
      </div>
    );
  }
  
  if (appPhase === AppPhase.INITIAL_SETUP || !userProfile) {
    return <SymbolicNameInput onProfileSelected={handleProfileSelected} />;
  }
  
  return (
    <div className="flex flex-col h-screen max-h-screen text-[var(--theme-text-primary)] antialiased" style={{fontFamily: "'Inter', sans-serif"}}>
      <header 
        className="p-4 shadow-md flex justify-between items-center border-b min-h-[64px]"
        style={{ backgroundColor: 'var(--theme-header-bg)', borderColor: 'var(--theme-input-border)' }}
      >
        <h1 className="text-2xl font-bold" style={{fontFamily: "'Lora', serif", color: 'var(--theme-accent-primary)'}}>
          Luna 
          <span className="text-lg align-middle" style={{color: 'var(--theme-text-secondary)'}}> & </span>
          <span className="text-lg font-normal inline-block max-w-[100px] sm:max-w-[150px] md:max-w-[200px] truncate align-middle" title={userProfile.symbolicName.name} style={{color: 'var(--theme-text-secondary)'}}>
            {userProfile.symbolicName.name}
          </span>
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
            <button onClick={toggleMute} className="p-2 rounded-full hover:bg-[var(--theme-input-bg)] transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeOffIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-text-muted)]" /> : <VolumeUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-text-muted)]" />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-[var(--theme-input-bg)] transition-colors" aria-label="Settings">
                <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-text-muted)]" />
            </button>
        </div>
      </header>

      {error && appPhase !== AppPhase.ERROR && error !== "API_KEY_MISSING" && (
        <div className="p-3 bg-red-700 text-white text-center text-sm">
          Error: {error} <button onClick={() => setError(null)} className="ml-2 font-bold underline">Dismiss</button>
        </div>
      )}

      <ChatView 
        messages={messages} 
        appPhase={appPhase} 
        lunaStatusText={lunaStatusText}
        onDeleteMessage={handleDeleteMessage} 
      />

      <VoiceInputControls
        appPhase={appPhase}
        isListening={isUserListening}
        startListening={startUserListening}
        stopListening={stopUserListening}
        userTranscript={userTranscript}
        isMuted={isMuted}
        toggleMute={toggleMute} 
        hasRecognitionSupport={hasRecognitionSupport}
        micError={micError}
      />
      
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        supportedVoices={supportedVoices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={setSelectedVoiceURI}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onForgetMe={handleForgetMe}
        currentProfile={userProfile}
        currentTheme={currentTheme}
        onThemeChange={applyTheme}
      />
    </div>
  );
};

export default App;
