import React from 'react';
import AIChatBox from '../components/AI/AIChatBox';
import QuickTips from '../components/AI/QuickTips';
import RecentQueries from '../components/AI/RecentQueries';

const AIChatPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-bold text-[#1a1c1c]">AI Assistant</h3>
          <p className="text-base text-[#40493d] mt-1">Chat with the AI to get farming advice, sensor insights, and smart recommendations.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 font-bold text-xs px-6 py-3 rounded-lg text-[#40493d] flex items-center gap-2 transition-colors hover:text-[#0d631b] shadow-sm">
            <span className="material-symbols-outlined text-lg">history</span>
            View History
          </button>
          <button className="bg-[#0d631b] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-sm hover:bg-[#2e7d32] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
            Ask AI
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <AIChatBox />
        
        {/* Sidebar Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <QuickTips />
          <RecentQueries />
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
