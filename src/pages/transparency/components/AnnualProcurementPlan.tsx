import { FC, useState } from 'react';

import { Building2, ClipboardList, Info } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';

import procurementPlan from '@/data/transparency/procurementPlan';

import { formatPesoAdaptive } from '@/lib/format';

const AnnualProcurementPlan: FC = () => {
  const [selectedYear, setSelectedYear] = useState(
    procurementPlan[procurementPlan.length - 1].year
  );

  const current =
    procurementPlan.find(y => y.year === selectedYear) ??
    procurementPlan[procurementPlan.length - 1];

  const topDepartment = current.departments[0];

  return (
    <section className='space-y-6'>
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface flex flex-col gap-6 rounded-3xl border p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='primary' dot>
              Planned, not yet awarded
            </Badge>
            <Badge variant='slate'>CY {current.year}</Badge>
          </div>
          <h2 className='text-kapwa-text-strong kapwa-heading-lg font-extrabold flex items-center gap-3'>
            <ClipboardList className='h-6 w-6 text-kapwa-text-brand' />
            Annual Procurement Plan
          </h2>
          <p className='text-kapwa-text-disabled max-w-xl text-sm leading-relaxed'>
            Each department&apos;s planned procurement budget for the year, as
            filed with the Bids and Awards Committee. This is the budget plan,
            not the record of contracts actually awarded &mdash; see the award
            search above for that.
          </p>
        </div>

        <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex shrink-0 gap-1 rounded-2xl border p-2'>
          {procurementPlan.map(y => (
            <button
              key={y.year}
              onClick={() => setSelectedYear(y.year)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                y.year === selectedYear
                  ? 'bg-kapwa-brand-600 text-kapwa-text-inverse'
                  : 'text-kapwa-text-support hover:bg-kapwa-bg-surface'
              }`}
            >
              {y.year}
            </button>
          ))}
        </div>
      </div>

      <CardGrid columns={3}>
        <StatCard
          icon={ClipboardList}
          label='Total Planned Budget'
          value={formatPesoAdaptive(current.grandTotal).fullString}
          subtext={`Across ${current.departments.length} offices`}
          iconBg='bg-kapwa-green-50 text-kapwa-green-600'
        />
        <StatCard
          icon={Building2}
          label='Largest Allocation'
          value={formatPesoAdaptive(topDepartment.totalCost).fullString}
          subtext={topDepartment.department}
          iconBg='bg-kapwa-bg-brand-weak text-kapwa-text-brand'
        />
        <StatCard
          icon={Info}
          label='Offices Listed'
          value={current.departments.length}
          subtext='Procuring entities'
          iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
        />
      </CardGrid>

      <div className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-xl border shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled border-b text-xs font-bold tracking-wider uppercase'>
              <tr>
                <th className='px-4 py-3 sm:px-6 sm:py-4'>
                  Office / Department
                </th>
                <th className='hidden px-4 py-3 sm:table-cell sm:px-6 sm:py-4'>
                  Head
                </th>
                <th className='px-4 py-3 text-right sm:px-6 sm:py-4'>
                  Planned Budget
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-kapwa-border-weak'>
              {current.departments.map(dept => (
                <tr
                  key={dept.department}
                  className='hover:bg-kapwa-bg-surface-raised/50 transition-colors'
                >
                  <td className='text-kapwa-text-strong px-4 py-3 font-medium sm:px-6 sm:py-4'>
                    {dept.department}
                  </td>
                  <td className='text-kapwa-text-support hidden px-4 py-3 text-xs sm:table-cell sm:px-6 sm:py-4'>
                    {dept.head ?? '—'}
                  </td>
                  <td className='text-kapwa-text-strong px-4 py-3 text-right font-mono font-bold sm:px-6 sm:py-4'>
                    {formatPesoAdaptive(dept.totalCost).fullString}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className='text-kapwa-text-disabled text-center text-xs leading-relaxed'>
        {current.sourceNote}
      </p>
    </section>
  );
};

export default AnnualProcurementPlan;
