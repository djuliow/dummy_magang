import React from 'react';

const QuickTips = () => {
  const tips = [
    { id: 1, title: 'Tip 1', text: 'Ask the AI for watering schedules based on current weather or soil moisture.' },
    { id: 2, title: 'Tip 2', text: 'Use short, specific questions for faster recommendations.' },
    { id: 3, title: 'Tip 3', text: 'Request advice on soil pH, crop health, and alert thresholds.' }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-6 flex flex-col shadow-[0_0_20px_rgba(46,125,50,0.08)]">
      <h3 className="text-lg font-semibold text-[#1a1c1c] mb-6">Quick Tips</h3>
      <ul className="space-y-4">
        {tips.map(tip => (
          <li key={tip.id} className="bg-[#f3f3f3] rounded-2xl p-4 border border-[#bfcaba]/60">
            <p className="text-[10px] font-bold text-[#40493d] uppercase tracking-wider mb-1">{tip.title}</p>
            <p className="text-sm text-[#1a1c1c]">{tip.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickTips;
