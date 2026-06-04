import React from 'react';
import ReportFilters from '../components/Reports/ReportFilters';
import AnalyticsCard from '../components/Reports/AnalyticsCard';
import HealthTrendsChart from '../components/Reports/HealthTrendsChart';
import WaterUsagePerZone from '../components/Reports/WaterUsagePerZone';

const ReportsPage = () => {
  return (
    <div className="space-y-10">
      <ReportFilters />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard 
          title="Water Efficiency" 
          value="94" 
          unit="%" 
          trend="up" 
          trendValue="+2.4% vs last week" 
          icon="water_drop" 
          iconColor="text-[#2e7d32]" 
          bgColor="bg-[#0d631b]/10"
        />
        <AnalyticsCard 
          title="Soil Health Index" 
          value="8.7" 
          unit="/10" 
          trend="up" 
          trendValue="+0.3 improvement" 
          icon="park" 
          iconColor="text-[#77574d]" 
          bgColor="bg-[#77574d]/10"
        />
        <AnalyticsCard 
          title="Sensor Alerts" 
          value="3" 
          trend="down" 
          trendValue="-2 vs last week" 
          icon="warning" 
          iconColor="text-[#ba1a1a]" 
          bgColor="bg-[#ba1a1a]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HealthTrendsChart />
        <WaterUsagePerZone />
      </div>
    </div>
  );
};

export default ReportsPage;
