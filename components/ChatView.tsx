
import React, { useEffect, useRef } from 'react';
import { ChatMessage, AppPhase, ChatMessageSender } from '../types';
import MessageBubble from './MessageBubble';
import { BotIcon } from './icons';

interface ChatViewProps {
  messages: ChatMessage[];
  appPhase: AppPhase;
  lunaStatusText?: string; 
  onDeleteMessage: (id: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, appPhase, lunaStatusText, onDeleteMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, appPhase]);

  return (
    <div 
      className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto chat-container rounded-t-lg"
      style={{ backgroundColor: 'rgba(var(--theme-bg-gradient-to-rgb, 30, 41, 59), 0.5)' }} // Assuming CSS var provides RGB for opacity
    >
      {messages.map((msg) => (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          onDeleteMessage={msg.sender === ChatMessageSender.USER ? onDeleteMessage : undefined}
        />
      ))}
      {(appPhase === AppPhase.LUNA_THINKING || appPhase === AppPhase.LUNA_SPEAKING || appPhase === AppPhase.PROCESSING_USER_INPUT) && (
        <div className="flex items-start space-x-2 self-start animate-pulse mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1" style={{backgroundColor: 'var(--theme-input-bg)'}}>
            <BotIcon className="w-5 h-5 text-[var(--theme-accent-secondary)]"/>
          </div>
          <div className="px-4 py-3 rounded-r-xl rounded-tl-xl shadow-md" style={{backgroundColor: 'var(--theme-bubble-luna-bg)', color: 'var(--theme-text-muted)'}}>
            <p className="text-sm italic">
              {lunaStatusText || (appPhase === AppPhase.LUNA_THINKING ? 'Luna is thinking...' : (appPhase === AppPhase.PROCESSING_USER_INPUT ? 'Processing...' : 'Luna is speaking...'))}
            </p>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatView;
