interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  height?: number;
}

function LineChart({ points, height = 260 }: LineChartProps): React.JSX.Element {
  if (points.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No Data</div>;
  }

  const width = 720;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const innerWidth: number = width - padding.left - padding.right;
  const innerHeight: number = height - padding.top - padding.bottom;

  const values: number[] = points.map((point) => point.value);
  const min: number = Math.min(...values);
  const max: number = Math.max(...values);
  const range: number = max - min || 1;

  const xAt = (index: number): number => padding.left + (index / Math.max(points.length - 1, 1)) * innerWidth;
  const yAt = (value: number): number => padding.top + innerHeight - ((value - min) / range) * innerHeight;

  const linePath: string = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xAt(index)},${yAt(point.value)}`).join(' ');
  const areaPath: string = `${linePath} L${xAt(points.length - 1)},${padding.top + innerHeight} L${xAt(0)},${padding.top + innerHeight} Z`;

  const ticks: number[] = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Equity Curve">
      <defs>
        <linearGradient id="equity-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={yAt(tick)}
            y2={yAt(tick)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="4 4"
          />
          <text x={padding.left - 8} y={yAt(tick) + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
            {Math.round(tick).toLocaleString()}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#equity-area)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
      {points
        .filter((_, index) => index % Math.ceil(points.length / 8) === 0 || index === points.length - 1)
        .map((point, index) => (
          <text key={`${point.label}-${index}`} x={xAt(index)} y={height - 8} textAnchor="middle" className="fill-gray-400 text-[10px]">
            {point.label}
          </text>
        ))}
    </svg>
  );
}

export { LineChart };
export type { LineChartPoint, LineChartProps };
