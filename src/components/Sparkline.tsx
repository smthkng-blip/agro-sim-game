import React from 'react';

interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const Sparkline: React.FC<Props> = ({
  values,
  width = 76,
  height = 24,
  color = '#34d399',
}) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((v - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastPoint = points.split(' ').pop()?.split(',') ?? ['0', '0'];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={Number(lastPoint[0])} cy={Number(lastPoint[1])} r="2.5" fill={color} />
    </svg>
  );
};
