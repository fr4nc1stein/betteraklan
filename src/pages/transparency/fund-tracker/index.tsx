import { useState } from 'react';

import { Banknote, Landmark, ReceiptText, Wallet } from 'lucide-react';

import { StatGrid } from '@/components/ui/StatCard';
import fundReports from '@/data/transparency/fundReports2025.json';
import { formatPeso } from '@/lib/format';

import FundReportTable from './FundReportTable';
import SpendingChart from './SpendingChart';
import { type Fund, funds, reportedAmount } from './reports';

const disclosureUrl =
  'https://aklan.gov.ph/full-disclosures/2025-full-disclosure/';
const selectClass =
  'border-kapwa-border-weak bg-kapwa-bg-surface w-full rounded-xl border px-3 py-2 text-sm';

export default function FundTracker() {
  const [fund, setFund] = useState<Fund>('sef');
  const [quarter, setQuarter] = useState('4');
  const allQuarters = quarter === 'all';
  const reports = fundReports
    .filter(report => report.fund === fund)
    .sort((a, b) => a.quarter - b.quarter);
  const visibleReports = allQuarters
    ? reports
    : reports.filter(report => String(report.quarter) === quarter);
  const latestVisibleReport = visibleReports.at(-1);
  const { receiptsLabel, spendingLabel, spendingRow, balanceLabel } =
    funds[fund];
  const spendingHistory = reports.map(report => ({
    quarter: `Q${report.quarter}`,
    spending: reportedAmount(report, spendingRow),
  }));

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
            See how the Province of Aklan used its school and disaster funds in
            2025.
          </p>
          <a
            className='text-kapwa-text-brand text-sm underline'
            href={disclosureUrl}
          >
            Aklan Province 2025 Full Disclosure
          </a>
        </div>

        <div className='bg-kapwa-bg-surface-raised grid min-w-0 gap-3 rounded-2xl p-3 sm:grid-cols-[minmax(0,1fr)_auto]'>
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
            Quarter
            <select
              className={selectClass}
              value={quarter}
              onChange={event => setQuarter(event.target.value)}
            >
              <option value='all'>All quarters</option>
              {reports.map(({ quarter }) => (
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
            allQuarters ? 'Latest reported totals' : 'Reported totals'
          }
        >
          {allQuarters && (
            <h3 className='mb-3 text-lg font-semibold'>
              Latest reported totals
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
                subtext: `Through Q${latestVisibleReport.quarter} 2025`,
                hover: false,
              };
            })}
          />
        </section>
      )}

      <SpendingChart
        data={spendingHistory}
        selectedQuarter={allQuarters ? undefined : `Q${quarter}`}
      />

      {visibleReports.length ? (
        visibleReports.map(report => (
          <FundReportTable
            key={`${fund}-${report.quarter}`}
            fund={fund}
            report={report}
          />
        ))
      ) : (
        <p role='status'>No report is available for this quarter.</p>
      )}
    </div>
  );
}
