import React from 'react';

const ChatMessage = ({ text, sender, time }) => {
  const isAI = sender === 'ai';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
          isAI 
            ? 'bg-[#f3f3f3] border border-[#bfcaba]/30 text-[#1a1c1c] rounded-tl-none' 
            : 'bg-[#0d631b] text-white rounded-tr-none'
        }`}>
          <p>{text}</p>
        </div>
        {time && <span className="text-[10px] text-[#40493d] mt-1 font-medium">{time}</span>}
      </div>
    </div>
  );
};

export default ChatMessage;
