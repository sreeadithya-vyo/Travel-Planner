import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TripItinerary } from '../types';

interface BudgetChartProps {
  itinerary: TripItinerary;
  travelers: number;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1'];

const BudgetChart: React.FC<BudgetChartProps> = ({ itinerary, travelers }) => {
  // Aggregate costs by category
  const dataMap = new Map<string, number>();

  itinerary.days.forEach(day => {
    day.activities.forEach(act => {
      const current = dataMap.get(act.category) || 0;
      dataMap.set(act.category, current + (act.costEstimate || 0));
    });
  });

  const data = Array.from(dataMap.entries()).map(([name, value]) => ({
    name,
    value: value * travelers // Total for all travelers
  })).filter(item => item.value > 0);

  // If no cost data is available, show a placeholder
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        No cost estimates available to visualize.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Estimated Cost Breakdown</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${itinerary.currency} ${value}`, 'Cost']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-slate-400 mt-2">
        *Estimates for {travelers} traveler(s). Excludes flights/accommodation unless specified.
      </p>
    </div>
  );
};

export default BudgetChart;
