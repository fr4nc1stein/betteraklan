import { useState } from 'react';

import { Banknote, Landmark, ReceiptText, Wallet } from 'lucide-react';

import { StatGrid } from '@/components/ui/StatCard';
import { formatPeso } from '@/lib/format';

import ArchiveReport from './ArchiveReport';
import FundReportTable from './FundReportTable';
import SpendingChart from './SpendingChart';
import {
  archiveYears,
  disclosureUrl,
  type Fund,
  funds,
  quarters,
  reportedAmount,
  reportsFor,
} from './reports';
const selectClass =
  'border-kapwa-border-weak bg-kapwa-bg-surface w-full rounded-xl border px-3 py-2 text-sm';

export default function FundTracker() {
  const [fund, setFund] = useState<Fund>('sef');
  const [year, setYear] = useState(2025);
  const [quarter, setQuarter] = useState('4');
  const allQuarters = quarter === 'all';
  const reports = reportsFor(year, fund);
  const visibleQuarters = allQuarters ? quarters : [Number(quarter)];
  const latestVisibleReport = reports
    .filter(report => visibleQuarters.includes(report.quarter))
    .sort((a, b) => b.quarter - a.quarter)[0];
  const { receiptsLabel, spendingLabel, spendingRow, balanceLabel } =
    funds[fund];
  const spendingHistory = quarters.map(quarter => {
    const report = reports.find(report => report.quarter === quarter);
    return {
      quarter: `Q${quarter}`,
      spending: report ? reportedAmount(report, spendingRow) : null,
    };
  });

  return (
    <div className='text-kapwa-text-strong mx-auto max-w-7xl space-y-6 pb-12'>
      <header className='border-kapwa-border-weak bg-kapwa-bg-surface flex flex-col gap-6 rounded-3xl border p-5 shadow-sm sm:p-8 xl:flex-row xl:items-center xl:justify-between'>
        <div className='space-y-3'>
          <h2 className='kapwa-heading-xl flex items-start gap-3 font-extrabold sm:items-center'>
            <Banknote
              aria-hidden='true'
              className='text-kapwa-text-success mt-1 h-7 w-7 shrink-0 sm:mt-0 sm:h-8 sm:w-8'
            />
            School and Disaster Fund Tracker
          </h2>
          <p className='text-kapwa-text-support max-w-lg text-sm'>
            Browse Aklan’s published school and disaster fund reports from 2012
            to 2026.
          </p>
          <a
            className='text-kapwa-text-brand text-sm underline'
            href={disclosureUrl(year)}
          >
            Aklan Province {year} Full Disclosure
          </a>
        </div>

        <div className='bg-kapwa-bg-surface-raised grid min-w-0 gap-3 rounded-2xl p-3 sm:grid-cols-[minmax(12rem,1fr)_auto_auto] xl:shrink-0'>
          <label className='flex min-w-0 flex-col gap-1 text-sm font-medium'>
            Fund
            <select
              className={selectClass}
              value={fund}
              onChange={event =>
                setFund(event.target.value === 'drrmf' ? 'drrmf' : 'sef')
              }
            >
              <option value='sef'>Special Education Fund</option>
              <option value='drrmf'>Local Disaster Fund</option>
            </select>
          </label>
          <label className='flex min-w-0 flex-col gap-1 text-sm font-medium'>
            Year
            <select
              className={selectClass}
              value={year}
              onChange={event => {
                const nextYear = Number(event.target.value);
                setYear(nextYear);
                if (
                  !reportsFor(nextYear, fund).some(
                    report => String(report.quarter) === quarter
                  )
                ) {
                  setQuarter('all');
                }
              }}
            >
              {archiveYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className='flex min-w-0 flex-col gap-1 text-sm font-medium'>
            Quarter
            <select
              className={selectClass}
              value={quarter}
              onChange={event => setQuarter(event.target.value)}
            >
              <option value='all'>All quarters</option>
              {quarters.map(quarter => (
                <option key={quarter} value={quarter}>
                  Quarter {quarter}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {latestVisibleReport && (
        <section
          aria-label={
            allQuarters ? 'Latest digitized totals' : 'Reported totals'
          }
        >
          {allQuarters && (
            <h3 className='mb-3 text-lg font-semibold'>
              Latest digitized totals
            </h3>
          )}
          <StatGrid
            columns={3}
            stats={[
              {
                label: receiptsLabel,
                icon: Landmark,
                iconBg: 'bg-kapwa-green-50 text-kapwa-green-600',
              },
              {
                label: spendingLabel,
                sourceLabel: spendingRow,
                icon: ReceiptText,
                iconBg: 'bg-kapwa-bg-brand-weak text-kapwa-text-brand',
              },
              { label: balanceLabel, icon: Wallet },
            ].map(({ label, sourceLabel, icon, iconBg }) => {
              const amount = reportedAmount(
                latestVisibleReport,
                sourceLabel ?? label
              );
              return {
                icon,
                iconBg,
                label,
                value: amount === null ? 'Unavailable' : formatPeso(amount),
                subtext: `Q${latestVisibleReport.quarter} ${year}`,
                hover: false,
              };
            })}
          />
        </section>
      )}

      {spendingHistory.some(point => point.spending !== null) && (
        <SpendingChart
          data={spendingHistory}
          selectedQuarter={allQuarters ? undefined : `Q${quarter}`}
        />
      )}

      {visibleQuarters.map(quarter => {
        const report = reports.find(report => report.quarter === quarter);
        return report ? (
          <FundReportTable key={quarter} fund={fund} report={report} />
        ) : (
          <ArchiveReport
            key={quarter}
            fund={fund}
            year={year}
            quarter={quarter}
          />
        );
      })}
    </div>
  );
}
