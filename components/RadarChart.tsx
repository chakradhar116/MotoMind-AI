
import React from 'react';
import { Bike } from '../types';

interface RadarChartProps {
  bikes: Bike[];
  size?: number;
}

// Helper to parse stats from strings like "350cc" or "20.5 bhp"
const parseStat = (val: string): number => {
  if (!val) return 0;
  // Remove non-numeric chars except decimal point
  const clean = val.replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
};

// Normalize values to a 0-1 scale relative to assumed max values
const normalize = (val: number, max: number) => Math.min(val / max, 1);

export const RadarChart: React.FC<RadarChartProps> = ({ bikes, size = 300 }) => {
  if (!bikes.length) return null;

  const center = size / 2;
  const radius = (size / 2) - 40; // Padding
  const categories = ['Power', 'Mileage', 'Agility', 'Value', 'Tech'];
  
  // Color palette for up to 3 bikes
  const colors = [
    { stroke: 'var(--accent-color)', fill: 'var(--accent-glow)' },
    { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.5)' }, // Purple
    { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.5)' }, // Emerald
  ];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = center + Math.cos(angle) * (value * radius);
    const y = center + Math.sin(angle) * (value * radius);
    return { x, y };
  };

  const getBikeStats = (bike: Bike) => {
    // 1. Power (Engine CC + Power bhp)
    const cc = parseStat(bike.specs.engineCC);
    const power = parseStat(bike.specs.power);
    const normalizedPower = normalize(power, 50); // Assume 50bhp is max for this segment

    // 2. Mileage
    const mileage = parseStat(bike.specs.mileage);
    const normalizedMileage = normalize(mileage, 80); // 80kmpl max

    // 3. Agility (Inverse Weight) - Lighter is better usually for agility
    const weight = parseStat(bike.specs.weight);
    const normalizedAgility = Math.max(0, 1 - (weight - 100) / 150); // 100kg is agile, 250kg is heavy

    // 4. Value (Inverse Price) - Lower price is higher value score (simplistic view)
    const price = parseStat(bike.price);
    const normalizedValue = Math.max(0, 1 - (price / 5)); // 5 Lakh max reference

    // 5. Tech/Features (Based on Match Score as proxy)
    const normalizedTech = bike.matchScore / 100;

    return [normalizedPower, normalizedMileage, normalizedAgility, normalizedValue, normalizedTech];
  };

  return (
    <div className="relative flex justify-center items-center py-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid (Web) */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <polygon
            key={i}
            points={categories.map((_, idx) => {
              const { x, y } = getCoordinates(scale, idx, categories.length);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            className="opacity-30"
          />
        ))}

        {/* Axes */}
        {categories.map((cat, i) => {
          const { x, y } = getCoordinates(1.1, i, categories.length);
          const centerPt = getCoordinates(0, i, categories.length);
          return (
            <g key={i}>
              <line x1={centerPt.x} y1={centerPt.y} x2={x} y2={y} stroke="#334155" strokeWidth="1" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.35em"
                className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider font-tech"
              >
                {cat}
              </text>
            </g>
          );
        })}

        {/* Bike Data Polygons */}
        {bikes.map((bike, i) => {
          const stats = getBikeStats(bike);
          const points = stats.map((val, idx) => {
            const { x, y } = getCoordinates(val, idx, categories.length);
            return `${x},${y}`;
          }).join(' ');
          
          const style = colors[i % colors.length];

          return (
            <g key={bike.id} className="radar-polygon" style={{ animationDelay: `${i * 0.2}s` }}>
              <polygon
                points={points}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="2"
                fillOpacity="0.4"
              />
              {/* Data Points */}
              {stats.map((val, idx) => {
                const { x, y } = getCoordinates(val, idx, categories.length);
                return (
                  <circle key={idx} cx={x} cy={y} r="3" fill={style.stroke} />
                );
              })}
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-0 right-0 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
         {bikes.map((bike, i) => (
            <div key={bike.id} className="flex items-center gap-2 mb-1 last:mb-0">
               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length].stroke }}></div>
               <span className="text-slate-300 font-bold">{bike.model}</span>
            </div>
         ))}
      </div>
    </div>
  );
};
