
import React from 'react';
import { ChatMessage, ChatMessageSender } from '../types';
import { UserIcon, BotIcon, TrashIcon } from './icons';

interface MessageBubbleProps {
  message: ChatMessage;
  onDeleteMessage?: (id: string) => void; // Optional: only user messages can be deleted
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDeleteMessage }) => {
  const isUser = message.sender === ChatMessageSender.USER;

  const bubbleBaseClasses = 'px-4 py-3 shadow-md relative';
  const userBubbleSpecificClasses = 'self-end rounded-l-xl rounded-tr-xl';
  const lunaBubbleSpecificClasses = 'self-start rounded-r-xl rounded-tl-xl';

  const alignmentClasses = isUser ? 'items-end' : 'items-start';
  
  const IconComponent = isUser ? UserIcon : BotIcon;
  const iconContainerBg = isUser ? 'var(--theme-bubble-user-bg)' : 'var(--theme-input-bg)';
  const iconColor = isUser ? 'var(--theme-bubble-user-text)' : 'var(--theme-accent-secondary)';


  return (
    <div className={`group flex flex-col w-full max-w-lg mb-4 ${alignmentClasses} animate-fade-in-up`}>
      <div className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1`}
            style={{ backgroundColor: iconContainerBg }}
            >
          <IconComponent className={`w-5 h-5 text-[${iconColor}]`} />
        </div>
        <div 
          className={`${bubbleBaseClasses} ${isUser ? userBubbleSpecificClasses : lunaBubbleSpecificClasses}`}
          style={{
            backgroundColor: isUser ? 'var(--theme-bubble-user-bg)' : 'var(--theme-bubble-luna-bg)',
            color: isUser ? 'var(--theme-bubble-user-text)' : 'var(--theme-bubble-luna-text)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
        </div>
        {isUser && onDeleteMessage && (
          <button 
            onClick={() => onDeleteMessage(message.id)}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100"
            style={{ color: 'var(--theme-text-muted)' }}
            onMouseOver={e => e.currentTarget.style.color = 'red'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--theme-text-muted)'}
            aria-label="Delete message"
            title="Delete message"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <p 
        className={`text-xs mt-1 ${isUser ? 'text-right pr-12' : 'text-left pl-10'}`}
        style={{ color: 'var(--theme-text-muted)' }}
      >
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default MessageBubble;
