import { ExternalLink } from 'lucide-react';

import { type Fund, funds, listedDocument } from './reports';

export default function ArchiveReport({
  fund,
  year,
  quarter,
}: {
  fund: Fund;
  year: number;
  quarter: number;
}) {
  const document = listedDocument(year, fund, quarter);
  const name = `${funds[fund].name}, Quarter ${quarter}, ${year}`;
  const headingId = `archive-${year}-${fund}-${quarter}`;
  return (
    <article
      aria-labelledby={headingId}
      className='border-kapwa-border-weak bg-kapwa-bg-surface space-y-3 rounded-3xl border p-4 shadow-sm sm:p-6'
    >
      <h3 id={headingId} className='text-lg font-semibold'>
        {name}
      </h3>
      {document?.kind === 'pdf' ? (
        <>
          <p className='text-kapwa-text-support text-sm'>
            This report is available as a PDF. Its table has yet to be
            digitized.
          </p>
          <a
            className='text-kapwa-text-brand inline-flex items-center gap-1.5 text-sm font-medium underline'
            aria-label={`Official PDF for ${name}`}
            href={document.source}
            target='_blank'
            rel='noreferrer'
          >
            Official PDF <ExternalLink aria-hidden='true' className='h-4 w-4' />
          </a>
        </>
      ) : document?.kind === 'mismatch' ? (
        <p className='text-kapwa-text-support text-sm'>
          The provincial archive links to a 20% Internal Revenue Allotment
          report for this quarter. The Disaster Fund report could not be
          verified.
        </p>
      ) : (
        <p className='text-kapwa-text-support text-sm'>
          The province does not list a report for this quarter.
        </p>
      )}
    </article>
  );
}
