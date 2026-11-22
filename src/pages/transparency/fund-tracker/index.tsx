import { useState } from 'react';

import { Download, ExternalLink } from 'lucide-react';

import fundReports from '@/data/transparency/fundReports2025.json';

const funds = {
  sef: {
    name: 'Special Education Fund',
    columns: ['Amount'],
  },
  drrmf: {
    name: 'Local Disaster Risk Reduction and Management Fund',
    columns: [
      'Quick Response Fund (30%)',
      'Mitigation Fund (70%)',
      'National DRRM Fund',
      'Other LGUs',
      'Other sources',
      'Total',
    ],
  },
};

const disclosureUrl =
  'https://aklan.gov.ph/full-disclosures/2025-full-disclosure/';
const quarterOptions = [1, 2, 3, 4];
const numberFormat = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const selectClass =
  'border-kapwa-border-weak bg-kapwa-bg-surface max-w-full rounded-lg border px-3 py-2';

type Report = (typeof fundReports)[number];

function fundInfo(fund: string) {
  return fund === 'sef' ? funds.sef : funds.drrmf;
}

function csvCell(value: string | number | null) {
  if (value === null) return '';
  if (typeof value === 'number') return value.toFixed(2);
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function reportCsv(report: Report) {
  const rows = [
    [
      'Year',
      'Quarter',
      'Fund',
      'Official workbook',
      'Worksheet',
      'Source row',
      'Particulars',
      ...fundInfo(report.fund).columns,
    ],
    ...report.rows.map(([sourceRow, label, ...amounts]) => [
      '2025',
      String(report.quarter),
      fundInfo(report.fund).name,
      report.source,
      report.sheet,
      String(sourceRow),
      label,
      ...amounts,
    ]),
  ];
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent('\uFEFF' + csv)}`;
}

export default function FundTracker() {
  const [fundFilter, setFundFilter] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('');
  const reports = fundReports.filter(
    report =>
      (!fundFilter || report.fund === fundFilter) &&
      (!quarterFilter || String(report.quarter) === quarterFilter)
  );

  return (
    <div className='text-kapwa-text-strong space-y-6'>
      <header className='space-y-2'>
        <h2 className='text-2xl font-bold sm:text-3xl'>
          School and Disaster Fund Tracker
        </h2>
        <p className='text-kapwa-text-support'>
          Explore how the Provincial Government of Aklan reported using its
          education and disaster funds in 2025.
        </p>
        <a className='text-kapwa-text-brand underline' href={disclosureUrl}>
          Aklan Province 2025 Full Disclosure
        </a>
      </header>

      <div className='flex flex-wrap gap-4'>
        <label className='flex min-w-0 max-w-full flex-col gap-1 text-sm font-medium'>
          Fund
          <select
            className={selectClass}
            value={fundFilter}
            onChange={event => setFundFilter(event.target.value)}
          >
            <option value=''>All funds</option>
            <option value='sef'>Special Education Fund (SEF)</option>
            <option value='drrmf'>
              Disaster Risk Reduction and Management Fund (DRRMF)
            </option>
          </select>
        </label>
        <label className='flex min-w-0 max-w-full flex-col gap-1 text-sm font-medium'>
          Quarter
          <select
            className={selectClass}
            value={quarterFilter}
            onChange={event => setQuarterFilter(event.target.value)}
          >
            <option value=''>All quarters</option>
            {quarterOptions.map(quarter => (
              <option key={quarter} value={quarter}>
                Quarter {quarter}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised space-y-1 rounded-lg border p-4 text-sm'>
        <p role='status'>
          {reports.length} of {fundReports.length} reports
        </p>
        <p className='text-kapwa-text-support'>
          Each quarter is a cumulative snapshot. Adding quarters would count
          some amounts more than once. The tables retain the workbook totals and
          show blank cells as dashes. All amounts are in Philippine pesos.
        </p>
      </div>

      {reports.map(report => {
        const { name, columns } = fundInfo(report.fund);
        const id = `${report.fund}-q${report.quarter}`;
        return (
          <article
            aria-labelledby={id}
            className='border-kapwa-border-weak bg-kapwa-bg-surface space-y-3 rounded-xl border p-4 sm:p-6'
            key={id}
          >
            <h3 className='text-lg font-semibold' id={id}>
              {name}, Quarter {report.quarter}
            </h3>
            <div className='text-kapwa-text-brand flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium'>
              <a
                className='inline-flex items-center gap-1.5 underline'
                href={report.source}
                target='_blank'
                rel='noreferrer'
              >
                Official workbook{' '}
                <ExternalLink aria-hidden='true' className='h-4 w-4' />
              </a>
              <a
                className='inline-flex items-center gap-1.5 underline'
                href={reportCsv(report)}
                download={`aklan-2025-${id}.csv`}
              >
                Download CSV <Download aria-hidden='true' className='h-4 w-4' />
              </a>
            </div>
            <details open={reports.length === 1 || undefined}>
              <summary className='cursor-pointer py-2 text-sm font-semibold'>
                Financial table
              </summary>
              <p className='text-kapwa-text-support mb-2 text-sm'>
                Worksheet {report.sheet}
              </p>
              {id === 'drrmf-q3' && (
                <p className='text-kapwa-text-support mb-2 text-sm'>
                  Some published totals differ from the sum of their displayed
                  components by a few centavos. Cell I19 contains an additional
                  unlabeled figure of ₱105,732,122.00 outside the report table.
                </p>
              )}
              {id === 'sef-q1' && (
                <p className='text-kapwa-text-support mb-2 text-sm'>
                  The workbook prints the Sub-total label on row 28 and its
                  amount on row 27.
                </p>
              )}
              <div
                className='border-kapwa-border-weak overflow-x-auto rounded-lg border'
                tabIndex={0}
                role='region'
                aria-label={`${name}, Quarter ${report.quarter}, table`}
              >
                <table className='w-full border-collapse text-left text-sm'>
                  <caption className='sr-only'>
                    {name}, Quarter {report.quarter}, 2025
                  </caption>
                  <thead className='bg-kapwa-bg-surface-raised'>
                    <tr>
                      <th scope='col' className='p-2'>
                        Particulars
                      </th>
                      {columns.map(column => (
                        <th scope='col' className='p-2 text-right' key={column}>
                          {column}
                        </th>
                      ))}
                      <th scope='col' className='p-2 text-right'>
                        Source row
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map(([sourceRow, label, ...amounts]) => (
                      <tr
                        className='border-kapwa-border-weak border-t'
                        key={sourceRow}
                      >
                        <th scope='row' className='min-w-48 p-2 font-medium'>
                          {label || 'Unlabeled'}
                        </th>
                        {amounts.map((amount, index) => (
                          <td
                            className='p-2 text-right whitespace-nowrap tabular-nums'
                            key={columns[index]}
                          >
                            {typeof amount === 'number'
                              ? numberFormat.format(amount)
                              : '—'}
                          </td>
                        ))}
                        <td className='p-2 text-right tabular-nums'>
                          {sourceRow}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </article>
        );
      })}
    </div>
  );
}
