import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const AIChatBox = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you optimize irrigation, soil health, or crop planning today?", sender: 'ai', time: '09:00 AM' },
    { id: 2, text: "What is the best watering schedule for tomatoes in zone 3?", sender: 'user', time: '09:01 AM' },
    { id: 3, text: "Water tomatoes early in the morning every 2 days while keeping soil moisture between 60-70%.", sender: 'ai', time: '09:02 AM' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text) => {
    const userMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, userMsg]);
    
    // Fake AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm processing that. Based on your sensors in Zone 3, you might want to check the pH levels as well.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 md:col-span-8 flex flex-col gap-6 shadow-[0_0_20px_rgba(46,125,50,0.08)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#40493d] mb-1">AI Chat</h4>
          <h2 className="text-2xl font-bold text-[#1a1c1c]">Ask the AI about your farm</h2>
        </div>
        <span className="bg-[#0d631b]/10 text-[#0d631b] px-3 py-1 rounded-full text-xs font-bold">GPT-powered</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-[600px]">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {messages.map(msg => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default AIChatBox;
