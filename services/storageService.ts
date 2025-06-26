
import { ChatMessage, UserProfile, SymbolicNameData } from '../types';

const USER_PROFILE_KEY = 'lunaApp_userProfile';
const CHAT_HISTORY_PREFIX = 'lunaApp_chatHistory_';
const SELECTED_THEME_KEY = 'lunaApp_selectedTheme';

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile to localStorage:", error);
  }
};

export const loadUserProfile = (): UserProfile | null => {
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error("Error loading user profile from localStorage:", error);
    return null;
  }
};

export const clearUserProfile = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error("Error clearing user profile from localStorage:", error);
  }
};

export const saveChatHistory = (symbolicNameId: string, messages: ChatMessage[]): void => {
  try {
    if (!symbolicNameId) return;
    localStorage.setItem(`${CHAT_HISTORY_PREFIX}${symbolicNameId}`, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving chat history to localStorage:", error);
  }
};

export const loadChatHistory = (symbolicNameId: string): ChatMessage[] | null => {
  try {
    if (!symbolicNameId) return null;
    const storedHistory = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${symbolicNameId}`);
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory) as ChatMessage[];
      return parsedHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return null;
  } catch (error) {
    console.error("Error loading chat history from localStorage:", error);
    return null;
  }
};

export const clearChatHistory = (symbolicNameId: string): void => {
  try {
    if (!symbolicNameId) return;
    localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${symbolicNameId}`);
  } catch (error) {
    console.error("Error clearing chat history from localStorage:", error);
  }
};

export const saveSelectedTheme = (themeId: string): void => {
  try {
    localStorage.setItem(SELECTED_THEME_KEY, themeId);
  } catch (error) {
    console.error("Error saving selected theme to localStorage:", error);
  }
};

export const loadSelectedTheme = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_THEME_KEY);
  } catch (error) {
    console.error("Error loading selected theme from localStorage:", error);
    return null;
  }
};
