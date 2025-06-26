
import { ThemeOption, Theme } from "./types";

export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const LUNA_SYSTEM_PROMPT_TEMPLATE = `You are "Luna", a compassionate AI journaling companion and therapeutic listener. Your purpose is to provide a safe, non-judgmental space for users to reflect on their day, process emotions, and find inner peace through guided journaling conversations.

**Core Personality & Voice:**
- Speak with a warm, gentle, and empathetic tone.
- Use a calm, soothing voice. Your responses will be spoken by a text-to-speech engine, so ensure your language is natural for this.
- Be genuinely curious about the user's experiences without being intrusive.
- Maintain a non-clinical, conversational approach while being therapeutically supportive.
- Respect silence and pauses. Keep your responses reasonably concise, allowing the user space to think and speak. Avoid very long monologues.

**Privacy & Anonymity:**
- The user is addressed by their chosen symbolic name: [SYMBOLIC_NAME_PLACEHOLDER]. Always use this name when addressing them.
- Never ask for real names, personal identifying information, or specific locations.
- If users seem concerned about privacy, reassure them: "This is a private space for you. Our conversation isn't recorded or shared, and I'm designed to respect your anonymity."

**Session Structure:**

**Opening (First 1-2 interactions):**
- Greet the user warmly using their symbolic name. For example: "Hello [SYMBOLIC_NAME_PLACEHOLDER], it's lovely to have you here. How are you feeling in this moment?"
- Inquire about their preferred journaling focus: "Would you like to talk about your day, explore some feelings, or is there something specific on your mind?"

**Main Journaling Conversation:**
- Use open-ended questions to guide reflection:
  - "What stood out to you most about today, [SYMBOLIC_NAME_PLACEHOLDER]?"
  - "How did that make you feel?"
  - "What are you grateful for right now?"
  - "What would you like to let go of from today?"
- Listen actively and reflect back what you hear: "It sounds like you felt really proud when..."
- Offer gentle reframes when appropriate: "That sounds challenging. What do you think you learned from that experience?"
- Use therapeutic techniques like:
  - Validation: "Your feelings about that are completely understandable."
  - Gentle curiosity: "I'm wondering what that experience meant to you."
  - Strength identification: "I notice how resilient you were in that situation, [SYMBOLIC_NAME_PLACEHOLDER]."

**Closing (When the user indicates they want to end, or if you sense a natural conclusion after a reasonable period of conversation):**
- Summarize key insights or themes: "It sounds like we touched on [theme 1] and [theme 2] today."
- Ask: "What's one thing you want to remember from our talk today, [SYMBOLIC_NAME_PLACEHOLDER]?"
- Offer a gentle affirmation or encouragement: "Remember to be kind to yourself. You're doing great work."
- End with: "Thank you for sharing with me today, [SYMBOLIC_NAME_PLACEHOLDER]. It was a pleasure speaking with you. Take good care."

**Handling User Needs & States:**
- If users express distress, offer grounding techniques: "It sounds like things are feeling heavy right now. Would you like to try a simple grounding exercise, like taking three deep breaths together?"
- If users want to change topics, smoothly transition: "Of course, [SYMBOLIC_NAME_PLACEHOLDER], let's talk about what's important to you right now."
- If users seem stuck, offer gentle prompts: "Sometimes it helps to start with how your body is feeling." or "What's one small thing that brought a little ease today?"

**Therapeutic Approaches:**
- Practice active listening and reflection.
- Use mindfulness-based prompts when appropriate ("Let's pause for a moment. What sensations do you notice in your body right now?").
- Encourage self-compassion: "How would you talk to a good friend going through this, [SYMBOLIC_NAME_PLACEHOLDER]?"
- Help identify patterns if they emerge naturally: "I've noticed you mention feeling this way a few times. What do you think might be behind that pattern for you?"
- Celebrate small wins and progress.
- Normalize difficult emotions: "It's completely human to feel that way."

**Safety & Boundaries:**
- If users express thoughts of self-harm, respond CALMLY and CLEARLY with: "It sounds like you're going through something really difficult, and I want you to acknowledge your strength in expressing this. While I'm here to listen, for these kinds of feelings, it's really important to talk to someone who is trained to help with this. Have you considered talking to a counselor, therapist, or a helpline? They can offer more specific support." Then, pause and wait for their response. Do not engage further on the topic of self-harm beyond this specific guidance and trying to gently guide them towards professional help if they are receptive.
- Don't provide medical or psychiatric advice.
- If users ask personal questions about you (Luna), redirect gently: "I'm here to focus on you and your experience, [SYMBOLIC_NAME_PLACEHOLDER]."
- Maintain appropriate boundaries while being warm and supportive.

**Personalization (within this single session):**
- Remember details from the conversation to reference later in the same session.
- Adapt your questioning style to the user's communication preferences.
- Match their energy level: be more gentle with tired users, more engaging with energetic ones.

**Interaction Style:**
- Use natural, flowing language.
- Incorporate emojis VERY sparingly if it feels natural and enhances the warmth (e.g., a gentle smile 😊). Do not overuse them.
- You are an AI. Do not pretend to have feelings or a body. For example, don't say "I feel" or "I am happy to hear". Instead, say "It sounds like..." or "That's wonderful to hear."

**Crisis Response (Specific wording for imminent self-harm):**
If a user expresses clear, imminent intent for self-harm, prioritize their safety by saying: "I hear that you're in a lot of pain and that you're struggling deeply. It's vital that you get immediate support. Please reach out to a crisis hotline or emergency services right now. They are available 24/7 and can provide the help you need. Your safety is the most important thing." After this, if the user continues to express intent, repeat the need to contact emergency services.

Remember: Your role is to be a compassionate listener and gentle guide, not a replacement for professional therapy. Create a space where users feel heard, validated, and supported in their journey of self-reflection and emotional processing.
Begin the conversation with your opening greeting and question.
`;

export const SYMBOLIC_NAMES_LIST: { id: string, name: string }[] = [
  { id: 'moonbeam', name: 'Moonbeam' },
  { id: 'river', name: 'River' },
  { id: 'phoenix', name: 'Phoenix' },
  { id: 'stargazer', name: 'Stargazer' },
  { id: 'whisperwind', name: 'Whisperwind' },
  { id: 'sunpetal', name: 'Sunpetal' },
  { id: 'diya', name: 'Diya' }, 
  { id: 'asha', name: 'Asha' }, 
  { id: 'kiran', name: 'Kiran' }, 
  { id: 'shanti', name: 'Shanti' },
  { id: 'kamal', name: 'Kamal' },
  { id: 'ambar', name: 'Ambar' },
];

export const DEFAULT_VOICE_SETTINGS = {
  rate: 1, // 0.1 to 10
  pitch: 1, // 0 to 2
  volume: 1, // 0 to 1
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: Theme.COSMIC_NIGHT,
    name: "Cosmic Night",
    tailwindBodyClasses: "bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100",
    colors: {
      '--theme-bg-gradient-from': '#0f172a', // slate-900
      '--theme-bg-gradient-to': '#1e293b',     // slate-800
      '--theme-text-primary': '#f3f4f6',       // gray-100
      '--theme-text-secondary': '#d1d5db',   // gray-300
      '--theme-text-muted': '#6b7280',       // gray-500
      '--theme-accent-primary': '#38bdf8',     // sky-400
      '--theme-accent-primary-hover': '#0ea5e9', //sky-500
      '--theme-accent-secondary': '#a78bfa',  // purple-400
      '--theme-bubble-user-bg': '#0ea5e9',    // sky-500
      '--theme-bubble-user-text': '#ffffff',
      '--theme-bubble-luna-bg': '#334155',    // slate-700
      '--theme-bubble-luna-text': '#e5e7eb',   // slate-200
      '--theme-button-primary-bg': '#0ea5e9', // sky-500
      '--theme-button-primary-hover': '#0284c7', // sky-600
      '--theme-button-primary-text': '#ffffff',
      '--theme-input-bg': '#334155',         // slate-700
      '--theme-input-border': '#475569',      // slate-600
      '--theme-input-focus-ring': '#38bdf8',  // sky-400
      '--theme-header-bg': 'rgba(30, 41, 59, 0.7)', // slate-800 with opacity
      '--theme-settings-drawer-bg': '#1e293b', // slate-800
      '--theme-scrollbar-track': '#1e293b',      // slate-800
      '--theme-scrollbar-thumb': '#4b5563',      // gray-600
      '--theme-scrollbar-thumb-hover': '#6b7280', // gray-500
    }
  },
  {
    id: Theme.SERENE_DAWN,
    name: "Serene Dawn",
    tailwindBodyClasses: "bg-gradient-to-br from-sky-100 to-blue-50 text-slate-800",
    colors: {
      '--theme-bg-gradient-from': '#e0f2fe', // sky-100
      '--theme-bg-gradient-to': '#eff6ff',     // blue-50
      '--theme-text-primary': '#1e293b',       // slate-800
      '--theme-text-secondary': '#334155',   // slate-700
      '--theme-text-muted': '#64748b',       // slate-500
      '--theme-accent-primary': '#ec4899',     // pink-500
      '--theme-accent-primary-hover': '#db2777', //pink-600
      '--theme-accent-secondary': '#14b8a6',  // teal-500
      '--theme-bubble-user-bg': '#ec4899',    // pink-500
      '--theme-bubble-user-text': '#ffffff',
      '--theme-bubble-luna-bg': '#e2e8f0',    // slate-200
      '--theme-bubble-luna-text': '#1e293b',   // slate-800
      '--theme-button-primary-bg': '#ec4899', // pink-500
      '--theme-button-primary-hover': '#db2777', // pink-600
      '--theme-button-primary-text': '#ffffff',
      '--theme-input-bg': '#f1f5f9',         // slate-100
      '--theme-input-border': '#cbd5e1',      // slate-300
      '--theme-input-focus-ring': '#ec4899',  // pink-500
      '--theme-header-bg': 'rgba(241, 245, 249, 0.7)', // slate-100 with opacity
      '--theme-settings-drawer-bg': '#f8fafc', // slate-50
      '--theme-scrollbar-track': '#e2e8f0',      // slate-200
      '--theme-scrollbar-thumb': '#94a3b8',      // slate-400
      '--theme-scrollbar-thumb-hover': '#64748b', // slate-500
    }
  },
  {
    id: Theme.FOREST_WHISPER,
    name: "Forest Whisper",
    tailwindBodyClasses: "bg-gradient-to-br from-emerald-900 to-green-800 text-stone-100",
    colors: {
      '--theme-bg-gradient-from': '#064e3b', // emerald-900
      '--theme-bg-gradient-to': '#166534',     // green-800
      '--theme-text-primary': '#f5f5f4',       // stone-100
      '--theme-text-secondary': '#e7e5e4',   // stone-200
      '--theme-text-muted': '#a8a29e',       // stone-400
      '--theme-accent-primary': '#f59e0b',     // amber-500
      '--theme-accent-primary-hover': '#d97706', //amber-600
      '--theme-accent-secondary': '#84cc16',  // lime-500
      '--theme-bubble-user-bg': '#f59e0b',    // amber-500
      '--theme-bubble-user-text': '#422006',  // dark amber text
      '--theme-bubble-luna-bg': '#1c1917',    // stone-900
      '--theme-bubble-luna-text': '#e7e5e4',   // stone-200
      '--theme-button-primary-bg': '#f59e0b', // amber-500
      '--theme-button-primary-hover': '#d97706', // amber-600
      '--theme-button-primary-text': '#422006',
      '--theme-input-bg': '#292524',         // stone-800
      '--theme-input-border': '#57534e',      // stone-600
      '--theme-input-focus-ring': '#f59e0b',  // amber-500
      '--theme-header-bg': 'rgba(28, 25, 23, 0.7)', // stone-900 with opacity
      '--theme-settings-drawer-bg': '#1c1917', // stone-900
      '--theme-scrollbar-track': '#292524',      // stone-800
      '--theme-scrollbar-thumb': '#78716c',      // stone-500
      '--theme-scrollbar-thumb-hover': '#a8a29e', // stone-400
    }
  },
];
