import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Camera, Image, Sparkles } from 'lucide-react';

export default function ChatInput({ 
  onSend, 
  onVoiceToggle,
  isListening = false,
  disabled = false,
  placeholder = "Escribe tu mensaje..." 
}) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Action buttons */}
          <div className="flex gap-2 pb-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onVoiceToggle}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isListening 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
              `}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none rounded-2xl border-2 border-slate-200 focus:border-sky-400 
                bg-white pr-12 py-3 min-h-[48px] max-h-[120px] text-slate-700
                placeholder:text-slate-400"
              rows={1}
            />
            
            {/* Quick actions inside input */}
            <div className="absolute right-3 bottom-3 flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <Camera className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Send button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pb-2">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={`
                w-12 h-12 rounded-full p-0 shadow-lg transition-all
                ${message.trim() 
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-sky-500/30' 
                  : 'bg-slate-200 shadow-none'}
              `}
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Explícame con un dibujo', 'Dame un ejemplo', 'Tengo una tarea'].map((suggestion) => (
            <motion.button
              key={suggestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-medium
                border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}