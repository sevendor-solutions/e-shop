import React, { useState } from 'react';

interface SalesDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
}

export const DashboardCharts: React.FC<ChartProps> = ({ salesData, categoryData }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG dimensions for Sales Chart
  const width = 600;
  const height = 240;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max values for scaling
  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 100);
  const maxSales = Math.max(...salesData.map((d) => d.sales), 5);

  // Map data points to SVG coordinates
  const points = salesData.map((d, index) => {
    const x = padding + (index / (salesData.length - 1)) * chartWidth;
    const yRevenue = padding + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    const ySales = padding + chartHeight - (d.sales / maxSales) * chartHeight;
    return { x, yRevenue, ySales, data: d };
  });

  // Build SVG path strings
  const revenueLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yRevenue}`).join(' ');
  const revenueAreaPath = `${revenueLinePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const salesLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySales}`).join(' ');

  // Donut chart parameters
  const donutSize = 180;
  const radius = 65;
  const strokeWidth = 14;
  const center = donutSize / 2;
  const totalValue = categoryData.reduce((sum, d) => sum + d.value, 0);

  const colors = ['#0A58CA', '#FF5722', '#10B981', '#F59E0B'];

  let accumulatedAngle = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sales and Revenue Analytics Card */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Sales & Revenue</h3>
            <span className="text-xs text-slate-450 mt-0.5">Last 7 days performance metrics</span>
          </div>
          {/* Legend */}
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="w-2.5 h-2.5 rounded bg-primary" />
              Revenue ($)
            </span>
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-2.5 h-2.5 rounded bg-accent" />
              Sales Count
            </span>
          </div>
        </div>

        {/* SVG Sales Chart */}
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Gradients */}
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A58CA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0A58CA" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {Array.from({ length: 4 }).map((_, i) => {
              const y = padding + (chartHeight / 3) * i;
              return (
                <line
                  key={i}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-700/40"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Path */}
            <path d={revenueAreaPath} fill="url(#revenueGrad)" />

            {/* Revenue Line */}
            <path
              d={revenueLinePath}
              fill="none"
              stroke="#0A58CA"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Sales Line */}
            <path
              d={salesLinePath}
              fill="none"
              stroke="#FF5722"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />

            {/* Interactive Circles & Dots */}
            {points.map((p, index) => (
              <g key={index} onMouseEnter={() => setHoveredPoint(index)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle
                  cx={p.x}
                  cy={p.yRevenue}
                  r={hoveredPoint === index ? 6 : 4}
                  className="fill-primary stroke-white dark:stroke-slate-800 cursor-pointer"
                  strokeWidth="2"
                />
                
                {/* Tooltip Overlay inside SVG */}
                {hoveredPoint === index && (
                  <g className="transition-all duration-200">
                    <rect
                      x={p.x - 60}
                      y={p.yRevenue - 55}
                      width="120"
                      height="45"
                      rx="8"
                      className="fill-slate-900 dark:fill-slate-950 opacity-90 shadow-lg"
                    />
                    <text x={p.x} y={p.yRevenue - 38} textAnchor="middle" className="fill-white text-[10px] font-bold">
                      Revenue: ${p.data.revenue}
                    </text>
                    <text x={p.x} y={p.yRevenue - 24} textAnchor="middle" className="fill-accent text-[9px] font-bold">
                      Sales: {p.data.sales} orders
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* X-Axis Labels */}
            {points.map((p, index) => (
              <text
                key={index}
                x={p.x}
                y={height - padding + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-bold"
              >
                {p.data.date}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Category Distribution Card (Donut Chart) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Sales by Category</h3>
          <p className="text-xs text-slate-450 mt-0.5">Top performing departments</p>
        </div>

        {/* SVG Donut Circle */}
        <div className="flex items-center justify-center my-4 relative">
          <svg width={donutSize} height={donutSize} className="transform -rotate-90">
            {categoryData.map((d, index) => {
              const angle = (d.value / totalValue) * 360;
              const strokeDasharray = `${(2 * Math.PI * radius * angle) / 360} ${2 * Math.PI * radius}`;
              const strokeDashoffset = `${-(2 * Math.PI * radius * accumulatedAngle) / 360}`;
              
              accumulatedAngle += angle;
              
              return (
                <circle
                  key={d.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          
          {/* Centered Total Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Total</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">100%</span>
          </div>
        </div>

        {/* Donut Legend */}
        <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
          {categoryData.map((d, index) => (
            <div key={d.name} className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-350">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="truncate">{d.name} ({d.value}%)</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default DashboardCharts;
