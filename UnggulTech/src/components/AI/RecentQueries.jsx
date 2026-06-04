import React from 'react';

const RecentQueries = () => {
  const queries = [
    "When should I water corn today?",
    "What are ideal soil pH levels for tomatoes?",
    "How do I set alert thresholds for dry soil?"
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 flex flex-col shadow-[0_0_20px_rgba(46,125,50,0.08)]">
      <h3 className="text-lg font-semibold text-[#1a1c1c] mb-6">Recent AI Queries</h3>
      <div className="space-y-3">
        {queries.map((query, index) => (
          <div key={index} className="p-3 rounded-lg bg-[#f3f3f3] border border-[#bfcaba] text-xs text-[#40493d] font-medium italic">
            “{query}”
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentQueries;
