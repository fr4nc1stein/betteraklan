import { Download, ExternalLink } from 'lucide-react';

import { type Fund, type Report, funds, reportCsv } from './reports';

const numberFormat = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function FundReportTable({
  fund,
  report,
}: {
  fund: Fund;
  report: Report;
}) {
  const { name, columns } = funds[fund];
  const id = `${fund}-q${report.quarter}`;
  return (
    <article
      aria-labelledby={id}
      className='border-kapwa-border-weak bg-kapwa-bg-surface space-y-3 rounded-3xl border p-4 shadow-sm sm:p-6'
    >
      <h3 className='text-lg font-semibold' id={id}>
        {name}, Quarter {report.quarter}
      </h3>
      <div className='text-kapwa-text-brand flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium'>
        <a
          className='inline-flex items-center gap-1.5 underline'
          aria-label={`Official workbook for ${name}, Quarter ${report.quarter}`}
          href={report.source}
          target='_blank'
          rel='noreferrer'
        >
          Official workbook{' '}
          <ExternalLink aria-hidden='true' className='h-4 w-4' />
        </a>
        <a
          className='inline-flex items-center gap-1.5 underline'
          aria-label={`Download CSV for ${name}, Quarter ${report.quarter}`}
          href={reportCsv(report, fund)}
          download={`aklan-2025-${id}.csv`}
        >
          Download CSV <Download aria-hidden='true' className='h-4 w-4' />
        </a>
      </div>
      <p className='text-kapwa-text-support mb-2 text-sm'>
        Worksheet {report.sheet}. Amounts are in Philippine pesos. Dashes mark
        blank cells.
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
          The workbook prints the Sub-total label on row 28 and its amount on
          row 27.
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
              <tr className='border-kapwa-border-weak border-t' key={sourceRow}>
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
                <td className='p-2 text-right tabular-nums'>{sourceRow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
