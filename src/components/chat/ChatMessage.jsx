import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Avatar3D from '../avatars/Avatar3D';
import VoiceButton, { HighlightedText } from './VoiceButton';

export default function ChatMessage({ 
  message, 
  isUser, 
  avatarType = 'robot',
  companionName = 'Lia',
  userName = 'Tú',
  image = null,
  companionPersonality = 'lia',
  autoPlayVoice = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Avatar3D type={avatarType} size="sm" state="idle" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className="flex items-center gap-2 mb-1 px-2">
          <span className="text-xs text-slate-400">
            {isUser ? userName : companionName}
          </span>
          
          {!isUser && (
            <VoiceButton
              text={message}
              companionPersonality={companionPersonality}
              autoPlay={autoPlayVoice}
              onPlayingChange={(playing) => setIsPlaying(playing)}
            />
          )}
        </div>
        
        <div className={`
          rounded-2xl px-4 py-3 shadow-sm
          ${isUser 
            ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm' 
            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}
        `}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          ) : (
            <>
              <ReactMarkdown 
                className="text-sm leading-relaxed prose prose-sm max-w-none prose-slate
                  prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5
                  prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sky-600"
              >
                {message}
              </ReactMarkdown>
              
              {image && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={image}
                  alt="Imagen generada"
                  className="mt-3 rounded-xl max-w-full h-auto shadow-lg"
                />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}