
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content } from "@google/genai";
import { GEMINI_CHAT_MODEL, LUNA_SYSTEM_PROMPT_TEMPLATE } from '../constants';
import { ChatMessage, ChatMessageSender } from "../types";

// Production-grade API service with enhanced error handling and monitoring
interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  lastError?: string;
  lastSuccessfulRequest?: Date;
  averageResponseTime: number;
}

class GeminiServiceManager {
  private ai: GoogleGenAI | null = null;
  private metrics: ServiceMetrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0
  };
  private responseTimes: number[] = [];

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("GEMINI_API_KEY environment variable not set. Service will not function.");
        this.logError("API key not configured");
        return;
      }

      // Validate API key format
      if (!apiKey.startsWith('AIza')) {
        console.warn("API key format may be incorrect. Expected format: AIza...");
      }

      this.ai = new GoogleGenAI({ apiKey });
      console.log("✅ Gemini AI service initialized successfully");

    } catch (error) {
      console.error("Failed to initialize Gemini AI service:", error);
      this.logError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private logError(error: string) {
    this.metrics.errorCount++;
    this.metrics.lastError = error;

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      console.error(`[PRODUCTION ERROR] Gemini Service: ${error}`);
    }
  }

  private recordResponseTime(startTime: number) {
    const responseTime = Date.now() - startTime;
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  isHealthy(): boolean {
    return this.ai !== null && this.metrics.errorCount < 10;
  }

  getAI(): GoogleGenAI | null {
    return this.ai;
  }
}

// Global service instance
const geminiService = new GeminiServiceManager();


export const initLunaChat = (
  symbolicName: string,
  existingHistory?: Content[] // Gemini API's history format
): Chat | null => {
  const ai = geminiService.getAI();

  if (!ai) {
    console.error("Gemini AI service not available. Cannot create chat.");
    geminiService.getMetrics(); // Log current metrics
    return null;
  }

  if (!geminiService.isHealthy()) {
    console.warn("Gemini AI service health check failed. Proceeding with caution.");
  }

  const systemInstruction = LUNA_SYSTEM_PROMPT_TEMPLATE.replace('[SYMBOLIC_NAME_PLACEHOLDER]', symbolicName);

  try {
    const chat = ai.chats.create({
      model: GEMINI_CHAT_MODEL,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative but consistent responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024, // Reasonable limit for journaling responses
      },
      history: existingHistory || [],
    });

    console.log(`✅ Luna chat initialized for ${symbolicName}`);
    return chat;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating Gemini chat:", errorMessage);
    geminiService.getMetrics(); // Log metrics for debugging
    return null;
  }
};

export const sendUserMessageToLuna = async (
  chat: Chat,
  userMessageText: string,
  currentHistory: ChatMessage[] // For context, though Chat object handles history internally
): Promise<string | null> => {
  const startTime = Date.now();
  const ai = geminiService.getAI();

  if (!ai) {
    console.error("Gemini AI service not available. Cannot send message.");
    return "I'm currently experiencing technical difficulties. Please try again in a moment.";
  }

  if (!geminiService.isHealthy()) {
    console.warn("Service health degraded. Attempting request anyway.");
  }

  // Input validation and sanitization
  if (!userMessageText || userMessageText.trim().length === 0) {
    return "I didn't catch that. Could you please share your thoughts again?";
  }

  if (userMessageText.length > 4000) {
    return "That's quite a lot to process at once. Could you break that down into smaller thoughts for me?";
  }

  try {
    geminiService.getMetrics().requestCount++;

    // Add timeout wrapper for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });

    const apiCall = chat.sendMessage({ message: userMessageText.trim() });
    const response: GenerateContentResponse = await Promise.race([apiCall, timeoutPromise]);

    // Record successful response time
    geminiService.recordResponseTime(startTime);
    geminiService.getMetrics().lastSuccessfulRequest = new Date();

    // Extract and validate response
    const lunaResponseText = response.text;
    if (lunaResponseText && lunaResponseText.trim().length > 0) {
      console.log(`✅ Luna response generated (${Date.now() - startTime}ms)`);
      return lunaResponseText.trim();
    } else {
      console.error("Luna's response was empty or not in the expected format.");
      geminiService.logError("Empty response received");
      return "I'm sorry, I seem to be having a little trouble forming a response right now. Could you try saying that again?";
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending message to Luna:", errorMessage);
    geminiService.logError(`API call failed: ${errorMessage}`);

    // Provide contextual error messages based on error type
    if (errorMessage.includes('timeout')) {
      return "I'm taking a bit longer than usual to respond. Please try again.";
    } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return "I'm experiencing high demand right now. Please try again in a few minutes.";
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return "I'm having trouble connecting right now. Please check your internet connection and try again.";
    } else {
      return "I'm having a bit of trouble at the moment. Please try again in a little while.";
    }
  }
};

// Export service metrics for monitoring
export const getServiceMetrics = () => geminiService.getMetrics();
export const isServiceHealthy = () => geminiService.isHealthy();