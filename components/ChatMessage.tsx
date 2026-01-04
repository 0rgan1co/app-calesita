
import React from 'react';
import { Message, Role } from '../types';
import { UserIcon, SparklesIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${isUser ? 'bg-brand-primary' : 'bg-white/10'}`}>
          {isUser ? <UserIcon /> : <div className="text-brand-primary"><SparklesIcon /></div>}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl text-[17px] font-medium leading-normal shadow-sm ${
            isUser 
              ? 'bg-brand-primary text-white rounded-br-none' 
              : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'
          }`}>
            {message.content ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <div className="flex space-x-1.5 py-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 px-1 tracking-widest">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
