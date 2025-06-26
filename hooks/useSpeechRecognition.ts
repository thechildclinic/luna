
import { useState, useEffect, useCallback, useRef } from 'react';

// Types are now globally available via global.d.ts

const SPEECH_END_TIMEOUT_MS = 1500; // 1.5 seconds

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string; // Live interim transcript
  finalizedText: string | null; // Text when recognition ends or is final
  error: string | null;
  startListening: () => void;
  stopListening: () => void; // Manually stops listening and finalizes speech
  hasRecognitionSupport: boolean;
  resetTranscript: () => void; // Resets live transcript
  clearFinalizedText: () => void; // Clears finalizedText
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalizedText, setFinalizedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef(''); // Ref to hold the latest transcript
  const speechEndTimeoutRef = useRef<number | null>(null);

  const hasRecognitionSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const clearSpeechEndTimeout = () => {
    if (speechEndTimeoutRef.current) {
      clearTimeout(speechEndTimeoutRef.current);
      speechEndTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!hasRecognitionSupport) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        setError("Speech recognition API not found.");
        return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = true; 
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Set to Hindi - India. Fallback to 'en-US' if needed or make configurable.

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSpeechEndTimeout(); 
      let fullTranscriptThisAttempt = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) { 
           fullTranscriptThisAttempt += event.results[i][0].transcript;
      }
      setTranscript(prev => prev + fullTranscriptThisAttempt); 
    };
    
    recognition.onspeechstart = () => {
        clearSpeechEndTimeout(); 
        setTranscript(''); 
        transcriptRef.current = '';
        setError(null); 
    };

    recognition.onspeechend = () => {
      clearSpeechEndTimeout();
      speechEndTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current && isListening) { 
          recognitionRef.current.stop(); 
        }
      }, SPEECH_END_TIMEOUT_MS);
    };

    recognition.onend = () => {
      clearSpeechEndTimeout();
      setIsListening(false); 
      if (transcriptRef.current.trim() !== "") {
        setFinalizedText(transcriptRef.current.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSpeechEndTimeout();
      console.error('Speech recognition error:', event.error, event.message);
      if (event.error === 'no-speech') {
        setError("I didn't hear anything. Try speaking, or tap 'Send' if you're done.");
      } else if (event.error === 'audio-capture') {
        setError("I couldn't access your microphone. Please check permissions.");
      } else if (event.error === 'not-allowed') {
        setError("Microphone access was denied. Please enable it in your browser settings.");
      } else if (event.error === 'language-not-supported') {
        setError(`Hindi speech input may not be fully supported by your browser. You can try speaking in English. Error: ${event.message}`);
        if(recognitionRef.current) recognitionRef.current.lang = 'en-US'; // Fallback to English if Hindi not supported
      } else if (event.error === 'aborted' && transcriptRef.current.trim() === '') {
        setError(null); 
      }
      else {
        setError(`An error occurred: ${event.error}`);
      }
      setIsListening(false);
    };

    return () => {
      clearSpeechEndTimeout();
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort(); 
      }
    };
  }, [hasRecognitionSupport, isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        clearSpeechEndTimeout();
        setTranscript(''); 
        transcriptRef.current = '';
        setFinalizedText(null); 
        setError(null);
        // Ensure lang is set before starting, could be reset by error handler
        if(recognitionRef.current.lang !== 'hi-IN' && recognitionRef.current.lang !== 'en-US') { // check if it was changed by error
            recognitionRef.current.lang = 'hi-IN'; // try hi-IN first
        }
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
         if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
             setError("Microphone access was denied. Please enable it in your browser settings.");
         } else if (e.name === 'InvalidStateError' && recognitionRef.current?.lang === 'hi-IN'){
            // Attempt to fallback to en-US if hi-IN caused an issue on start
            try {
                console.warn("Failed to start with hi-IN, attempting en-US fallback for recognition.");
                recognitionRef.current.lang = 'en-US';
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e2: any) {
                setError(`Could not start voice input: ${e2.message || "Please try again."}`);
                setIsListening(false);
            }
         }
         else {
            setError(`Could not start voice input: ${e.message || "Please try again."}`);
         }
        if(e.name !== 'InvalidStateError') setIsListening(false); // only set to false if not trying fallback
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => { 
    clearSpeechEndTimeout();
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop(); 
    }
    else if (!isListening && transcriptRef.current.trim() !== "") {
        setFinalizedText(transcriptRef.current.trim());
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => { 
    setTranscript('');
    transcriptRef.current = '';
  }, []);

  const clearFinalizedText = useCallback(() => {
    setFinalizedText(null);
  }, []);

  return { 
    isListening, 
    transcript, 
    finalizedText, 
    error, 
    startListening, 
    stopListening, 
    hasRecognitionSupport, 
    resetTranscript,
    clearFinalizedText
  };
};

export default useSpeechRecognition;
