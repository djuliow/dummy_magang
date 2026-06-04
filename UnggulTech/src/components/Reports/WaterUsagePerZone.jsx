import React from 'react';

const WaterUsagePerZone = () => {
  const zones = [
    { name: 'Zone Alpha (Tomatoes)', usage: '1,240 L', percentage: 80 },
    { name: 'Zone Beta (Corn)', usage: '890 L', percentage: 60 },
    { name: 'Zone Gamma (Peppers)', usage: '450 L', percentage: 35 },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#0d631b]/20 rounded-xl p-8 flex flex-col shadow-[0_0_20px_rgba(46,125,50,0.08)] hover:border-[#2e7d32] transition-colors duration-300">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#1a1c1c]">Water Usage</h3>
        <p className="text-xs text-[#40493d] mt-1">Liters per zone (Weekly)</p>
      </div>
      
      <div className="flex flex-col gap-6 flex-1 justify-center">
        {zones.map((zone) => (
          <div key={zone.name}>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-[#1a1c1c]">{zone.name}</span>
              <span className="text-[#40493d]">{zone.usage}</span>
            </div>
            <div className="w-full h-3 bg-[#e2e2e2] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0054a7] rounded-full relative overflow-hidden transition-all duration-1000" 
                style={{ width: `${zone.percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 pt-6 border-t border-[#0d631b]/20">
        <button className="w-full py-2.5 border border-[#0d631b] text-[#0d631b] rounded-lg text-sm font-semibold hover:bg-[#0d631b]/5 transition-colors">
          View Detailed Log
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default WaterUsagePerZone;
