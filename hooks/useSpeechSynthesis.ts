
import { useState, useEffect, useCallback } from 'react';
import { VoiceOption } from '../types'; // Corrected: VoiceOption is in types.ts
import { DEFAULT_VOICE_SETTINGS } from '../constants'; // DEFAULT_VOICE_SETTINGS is in constants.ts

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  supportedVoices: VoiceOption[];
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (uri: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  isSupported: boolean;
  speechError: string | null;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supportedVoices, setSupportedVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(DEFAULT_VOICE_SETTINGS.rate);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const populateVoiceList = useCallback(() => {
    if (!isSupported) return;
    const voices = speechSynthesis.getVoices()
      // Prioritize en-IN, then other English voices
      .sort((a, b) => {
        if (a.lang === 'en-IN' && b.lang !== 'en-IN') return -1;
        if (a.lang !== 'en-IN' && b.lang === 'en-IN') return 1;
        if (a.lang.startsWith('en') && !b.lang.startsWith('en')) return -1;
        if (!a.lang.startsWith('en') && b.lang.startsWith('en')) return 1;
        return 0;
      })
      .filter(voice => voice.lang.startsWith('en')) // Keep filtering for English broadly for fallback
      .map(voice => ({ name: voice.name, lang: voice.lang, voiceURI: voice.voiceURI }));
    
    setSupportedVoices(voices);

    if (voices.length > 0 && !selectedVoiceURI) {
      // Try to find a specific Indian English voice first
      const preferredIndianGoogleFemaleVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female'));
      const preferredIndianFemaleVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'));
      const anyIndianVoice = voices.find(v => v.lang === 'en-IN');
      
      // Fallback to other English voices if no en-IN found
      const defaultGoogleFemaleVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female'));
      const defaultFemaleVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
      const firstEnglishVoice = voices.find(v => v.lang.startsWith('en'));
      const firstVoice = voices[0];

      setSelectedVoiceURI(
        preferredIndianGoogleFemaleVoice?.voiceURI ||
        preferredIndianFemaleVoice?.voiceURI ||
        anyIndianVoice?.voiceURI ||
        defaultGoogleFemaleVoice?.voiceURI ||
        defaultFemaleVoice?.voiceURI ||
        firstEnglishVoice?.voiceURI ||
        firstVoice?.voiceURI
      );
    }
  }, [isSupported, selectedVoiceURI]);

  useEffect(() => {
    if (!isSupported) {
      setSpeechError("Speech synthesis is not supported in this browser.");
      return;
    }
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    return () => {
      if (isSupported) {
        speechSynthesis.cancel(); // Cancel any ongoing speech when component unmounts
      }
    };
  }, [isSupported, populateVoiceList]);

  const speak = useCallback((text: string) => {
    if (!isSupported || isSpeaking) return;
    setSpeechError(null);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Determine language of the text for the utterance.
    // For now, Luna's responses are primarily English, so en-US or selected English voice lang is fine.
    // If Luna were to respond in Hindi, this would need to be `hi-IN`.
    utterance.lang = 'en-US'; // Default to English for the utterance itself.

    if (selectedVoiceURI) {
      const voice = supportedVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) {
        const synthesisVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
        if(synthesisVoice) {
            utterance.voice = synthesisVoice;
            utterance.lang = synthesisVoice.lang; // Use the language of the selected voice for the utterance.
        }
      }
    }
    
    utterance.rate = speechRate;
    utterance.pitch = DEFAULT_VOICE_SETTINGS.pitch;
    utterance.volume = DEFAULT_VOICE_SETTINGS.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => { 
      console.error('Speech synthesis error object:', event);
      let errorMessage = "An unknown speech synthesis error occurred.";
      if (event && event.error) {
        switch (event.error) {
          case 'not-allowed':
            errorMessage = "Speech output was not allowed by the browser. This can happen due to autoplay policies. Please try interacting with the page (e.g., click a button) to enable audio output.";
            break;
          case 'canceled':
            errorMessage = "Speech output was canceled.";
            // Avoid setting error if it's an intentional cancel from our app
            // For now, it's reported. Could be refined if `cancel()` is called often.
            break;
          case 'synthesis-unavailable':
            errorMessage = "Speech synthesis is not available on your system or browser.";
            break;
          case 'synthesis-failed':
            errorMessage = "Speech synthesis failed. Please try again.";
            break;
          case 'language-unavailable':
            errorMessage = "The selected language for speech output is not available.";
            break;
          case 'voice-unavailable':
            errorMessage = "The selected voice for speech output is not available.";
            break;
          case 'text-too-long':
            errorMessage = "The text to speak is too long for the speech synthesis engine.";
            break;
          case 'invalid-argument':
            errorMessage = "An invalid argument was provided to the speech synthesis engine.";
            break;
          default:
            errorMessage = `A speech output error occurred: ${event.error}.`;
        }
      }
      setSpeechError(errorMessage);
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking, selectedVoiceURI, supportedVoices, speechRate]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { 
    speak, 
    cancel, 
    isSpeaking, 
    supportedVoices, 
    selectedVoiceURI, 
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    isSupported,
    speechError
  };
};

export default useSpeechSynthesis;
