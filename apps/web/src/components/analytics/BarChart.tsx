interface BarChartPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  points: BarChartPoint[];
  height?: number;
}

function BarChart({ points, height = 240 }: BarChartProps): React.JSX.Element {
  if (points.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No Data</div>;
  }

  const width = 720;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerWidth: number = width - padding.left - padding.right;
  const innerHeight: number = height - padding.top - padding.bottom;

  const values: number[] = points.map((point) => point.value);
  const maxAbs: number = Math.max(...values.map((value) => Math.abs(value)), 1);
  const slotWidth: number = innerWidth / points.length;
  const barWidth: number = Math.min(slotWidth * 0.6, 32);

  const yFor = (value: number): number => innerHeight / 2 - (value / maxAbs) * (innerHeight / 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Monthly PnL">
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={padding.top + innerHeight / 2}
        y2={padding.top + innerHeight / 2}
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <text x={padding.left - 8} y={padding.top + innerHeight / 2 + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
        0
      </text>
      {points.map((point, index) => {
        const x: number = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
        const y: number = yFor(point.value);
        const isPositive: boolean = point.value >= 0;
        return (
          <g key={point.label}>
            <rect
              x={x}
              y={Math.min(y, padding.top + innerHeight / 2)}
              width={barWidth}
              height={Math.max(Math.abs((point.value / maxAbs) * (innerHeight / 2)), 1)}
              rx="2"
              fill={isPositive ? '#10b981' : '#ef4444'}
            />
            <text
              x={padding.left + index * slotWidth + slotWidth / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export { BarChart };
export type { BarChartPoint, BarChartProps };
