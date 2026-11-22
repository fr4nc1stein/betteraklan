import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ResponsiveChart } from '@/components/data-display';
import { standardAxisProps } from '@/constants/charts';
import { formatPeso } from '@/lib/format';

type SpendingPoint = { quarter: string; spending: number | null };

export default function SpendingChart({
  data,
  selectedQuarter,
}: {
  data: SpendingPoint[];
  selectedQuarter: string;
}) {
  return (
    <section
      aria-labelledby='fund-spending-chart-title'
      className='border-kapwa-border-weak bg-kapwa-bg-surface min-w-0 space-y-3 rounded-3xl border p-4 shadow-sm sm:p-6'
    >
      <h3 id='fund-spending-chart-title' className='text-lg font-semibold'>
        Reported spending through each quarter
      </h3>
      <p className='text-kapwa-text-support text-sm'>
        Each point is the cumulative amount reported through that quarter.
      </p>
      <ResponsiveChart height={240}>
        <LineChart
          data={data}
          accessibilityLayer
          margin={{ top: 12, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke='var(--color-kapwa-border-weak)'
          />
          <XAxis
            {...standardAxisProps}
            dataKey='quarter'
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            {...standardAxisProps}
            width={56}
            domain={[0, 'auto']}
            tickFormatter={value => `₱${value / 1_000_000}M`}
          />
          <Tooltip formatter={formatPeso} />
          <ReferenceLine
            x={selectedQuarter}
            stroke='var(--color-kapwa-border-weak)'
            strokeDasharray='4 4'
          />
          <Line
            dataKey='spending'
            name='Reported spending'
            stroke='var(--color-kapwa-brand-600)'
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveChart>
      <ul className='sr-only' aria-label='Quarterly reported spending amounts'>
        {data.map(({ quarter, spending }) => (
          <li key={quarter}>
            {quarter}:{' '}
            {spending === null ? 'Unavailable' : formatPeso(spending)}
          </li>
        ))}
      </ul>
    </section>
  );
}
