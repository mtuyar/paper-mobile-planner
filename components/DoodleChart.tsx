import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DoodleChartProps {
  completed: number;
  total: number;
}

const COLORS = ['#2c2925', '#e5e7eb']; // Ink and Paper-line color

export const DoodleChart: React.FC<DoodleChartProps> = ({ completed, total }) => {
  const data = [
    { name: 'Tamamlanan', value: completed },
    { name: 'Kalan', value: total - completed },
  ];

  if (total === 0) return (
    <div className="flex items-center justify-center h-full text-ink font-hand text-lg opacity-50">
      Henüz bir şey yok...
    </div>
  );

  return (
    <div className="h-48 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ fontFamily: '"Patrick Hand"', backgroundColor: '#fdfbf7', border: '1px solid #2c2925', borderRadius: '4px' }}
             itemStyle={{ color: '#2c2925' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-hand text-ink">
        <div className="text-2xl font-bold">{Math.round((completed / total) * 100)}%</div>
        <div className="text-sm">Bitti</div>
      </div>
    </div>
  );
};