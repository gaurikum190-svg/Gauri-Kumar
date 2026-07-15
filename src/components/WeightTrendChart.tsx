import { useState, useMemo } from 'react';
import { WeightLog } from '../types';
import { TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';

interface WeightTrendChartProps {
  logs: WeightLog[];
  weightUnit: 'kg' | 'lb';
}

export default function WeightTrendChart({ logs, weightUnit }: WeightTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; weight: number; date: string } | null>(null);

  // Sort logs by date ascending
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  // Calculations for chart sizing & mapping
  const chartData = useMemo(() => {
    if (sortedLogs.length === 0) return null;

    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600;
    const height = 240;

    const weights = sortedLogs.map(log => weightUnit === 'lb' ? log.weight * 2.20462 : log.weight);
    
    let maxW = Math.max(...weights);
    let minW = Math.min(...weights);

    // Padding for max/min weight boundary
    if (maxW === minW) {
      maxW += 5;
      minW = Math.max(0, minW - 5);
    } else {
      const diff = maxW - minW;
      maxW += diff * 0.15;
      minW = Math.max(0, minW - diff * 0.15);
    }

    const minTime = new Date(sortedLogs[0].date).getTime();
    const maxTime = new Date(sortedLogs[sortedLogs.length - 1].date).getTime();
    const timeDiff = maxTime - minTime || 86400000; // default 1 day if single entry

    const points = sortedLogs.map((log, index) => {
      const currentWeight = weightUnit === 'lb' ? log.weight * 2.20462 : log.weight;
      const t = new Date(log.date).getTime();
      
      // Map to coordinates
      const x = sortedLogs.length === 1 
        ? padding.left + (width - padding.left - padding.right) / 2
        : padding.left + ((t - minTime) / timeDiff) * (width - padding.left - padding.right);
      
      const y = height - padding.bottom - ((currentWeight - minW) / (maxW - minW)) * (height - padding.top - padding.bottom);
      
      return {
        x,
        y,
        weight: Math.round(currentWeight * 10) / 10,
        date: log.date,
      };
    });

    // Create Path String
    let pathD = '';
    let areaD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }

      // Complete area path (down to the bottom of the chart area)
      const bottomY = height - padding.bottom;
      areaD = `${pathD} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    }

    // Gridlines (Y-axis ticks)
    const tickCount = 4;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const val = minW + (i / tickCount) * (maxW - minW);
      const y = height - padding.bottom - (i / tickCount) * (height - padding.top - padding.bottom);
      ticks.push({
        value: Math.round(val * 10) / 10,
        y,
      });
    }

    return {
      width,
      height,
      padding,
      points,
      pathD,
      areaD,
      ticks,
      minW,
      maxW,
    };
  }, [sortedLogs, weightUnit]);

  // Overall statistics for weights
  const stats = useMemo(() => {
    if (sortedLogs.length === 0) return null;
    const weights = sortedLogs.map(log => weightUnit === 'lb' ? log.weight * 2.20462 : log.weight);
    const start = weights[0];
    const current = weights[weights.length - 1];
    const diff = current - start;
    const isLoss = diff < 0;
    
    return {
      current: Math.round(current * 10) / 10,
      diff: Math.round(Math.abs(diff) * 10) / 10,
      isLoss,
      count: logs.length,
    };
  }, [sortedLogs, weightUnit]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-emerald-50/40 rounded-2xl border border-emerald-100/50">
        <HelpCircle className="w-12 h-12 text-emerald-400 mb-3" />
        <p className="text-emerald-900 font-medium mb-1">No weight logs recorded yet</p>
        <p className="text-sm text-emerald-600/80 max-w-sm">
          Log your daily weight in the "Daily Check-in" or "Body Metrics" tab to see your weight trend chart.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Weight Trend</h4>
          {stats && (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-800">
                {stats.current} <span className="text-base font-normal text-gray-500">{weightUnit}</span>
              </span>
              {stats.count > 1 && (
                <span className={`inline-flex items-center gap-0.5 text-sm font-medium px-2 py-0.5 rounded-full ${stats.isLoss ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'}`}>
                  {stats.isLoss ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  {stats.isLoss ? '-' : '+'}{stats.diff} {weightUnit} overall
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          Hover points for details
        </div>
      </div>

      {chartData && (
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <svg 
              viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {chartData.ticks.map((tick, i) => (
                <g key={i}>
                  <line 
                    x1={chartData.padding.left} 
                    y1={tick.y} 
                    x2={chartData.width - chartData.padding.right} 
                    y2={tick.y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                  />
                  <text 
                    x={chartData.padding.left - 10} 
                    y={tick.y + 4} 
                    textAnchor="end" 
                    className="text-[10px] font-mono fill-gray-400 font-medium"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              {/* Area under the path */}
              {chartData.areaD && (
                <path d={chartData.areaD} fill="url(#chart-gradient)" />
              )}

              {/* Line path */}
              {chartData.pathD && (
                <path 
                  d={chartData.pathD} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Points */}
              {chartData.points.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.date === pt.date ? "6" : "4"}
                  className="fill-white stroke-emerald-500 cursor-pointer transition-all duration-150"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* X-axis label (First & Last Date) */}
              {chartData.points.length > 0 && (
                <>
                  <text 
                    x={chartData.points[0].x} 
                    y={chartData.height - chartData.padding.bottom + 18} 
                    textAnchor="middle" 
                    className="text-[10px] font-sans fill-gray-400 font-medium"
                  >
                    {new Date(chartData.points[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </text>
                  {chartData.points.length > 1 && (
                    <text 
                      x={chartData.points[chartData.points.length - 1].x} 
                      y={chartData.height - chartData.padding.bottom + 18} 
                      textAnchor="middle" 
                      className="text-[10px] font-sans fill-gray-400 font-medium"
                    >
                      {new Date(chartData.points[chartData.points.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                  )}
                </>
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute z-10 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md pointer-events-none flex flex-col gap-0.5 border border-gray-800"
                style={{ 
                  left: `${(hoveredPoint.x / chartData.width) * 100}%`, 
                  top: `${(hoveredPoint.y / chartData.height) * 100 - 18}%`,
                  transform: 'translate(-50%, -100%)' 
                }}
              >
                <span className="font-semibold text-[11px] text-emerald-400">{hoveredPoint.weight} {weightUnit}</span>
                <span className="text-[9px] text-gray-300">
                  {new Date(hoveredPoint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
