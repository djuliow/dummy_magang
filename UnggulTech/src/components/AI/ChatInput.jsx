import React, { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-auto bg-[#f3f3f3] rounded-2xl border border-[#bfcaba] p-4">
      <label className="text-xs font-medium text-[#40493d] mb-2 block">Type your message</label>
      <div className="flex gap-3">
        <textarea 
          className="flex-1 min-h-[100px] resize-none rounded-xl border border-[#bfcaba] p-3 bg-white text-[#1a1c1c] text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/50" 
          placeholder="Ask the AI about soil, irrigation, sensors, or alerts..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button 
          type="submit" 
          className="bg-[#0d631b] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#2e7d32] transition-colors self-end h-12"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
