import { ExternalLink } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import documents from '@/data/openlgu/aklan-local-codes.json';

const documentTypes = ['all', 'code', 'ordinance'] as const;

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export default function LocalCodes() {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [type, setType] = useQueryState(
    'type',
    parseAsStringLiteral(documentTypes).withDefault('all')
  );
  const terms = normalizeSearch(search).split(' ').filter(Boolean);
  const results = documents.filter(document => {
    if (type !== 'all' && document.type !== type) return false;

    const keywords = normalizeSearch(
      [document.title, document.number, ...document.topics].join(' ')
    );
    return terms.every(term => keywords.includes(term));
  });

  return (
    <section aria-labelledby='local-codes' className='space-y-6'>
      <header>
        <h2
          id='local-codes'
          className='kapwa-heading-lg text-kapwa-text-strong'
        >
          Aklan Local Codes
        </h2>
        <p className='text-kapwa-text-support mt-2'>
          Search provincial codes and ordinances, including historical editions
          and amendments.
        </p>
      </header>

      <div className='flex flex-wrap items-end gap-4'>
        <div className='min-w-0 flex-1 basis-64'>
          <SearchInput
            type='search'
            aria-label='Search local codes and ordinances'
            placeholder='Search by title, topic, or ordinance number'
            value={search}
            onChangeValue={setSearch}
            clearable={false}
          />
        </div>
        <label className='text-kapwa-text-strong text-sm font-medium'>
          Document type
          <select
            value={type}
            onChange={event => {
              const nextType = documentTypes.find(
                value => value === event.target.value
              );
              if (nextType) void setType(nextType);
            }}
            className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong mt-1 block min-h-11 rounded-xl border px-3'
          >
            <option value='all'>All documents</option>
            <option value='code'>Local codes</option>
            <option value='ordinance'>Ordinances</option>
          </select>
        </label>
      </div>

      <p role='status' className='text-kapwa-text-support text-sm'>
        {results.length} {results.length === 1 ? 'document' : 'documents'}
      </p>

      {results.length === 0 ? (
        <EmptyState
          title='No documents found'
          message='Try another title, topic, or ordinance number.'
        />
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {results.map(document => {
            const documentAction =
              document.format === 'PDF'
                ? 'Open official document'
                : 'Open official scan';
            return (
              <Card key={document.id} hover={false}>
                <CardContent className='space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='primary'>
                      {document.type === 'code' ? 'Local code' : 'Ordinance'}
                    </Badge>
                    <Badge variant='secondary'>{document.format}</Badge>
                  </div>
                  <div>
                    <h3 className='text-kapwa-text-strong text-lg font-bold'>
                      {document.title}
                    </h3>
                    <p className='text-kapwa-text-support mt-1 text-sm'>
                      {document.number}
                    </p>
                  </div>
                  <div className='text-kapwa-text-brand flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold'>
                    <a
                      href={document.documentUrl}
                      target='_blank'
                      rel='noreferrer'
                      aria-label={`${documentAction} for ${document.title}`}
                      className='inline-flex items-center gap-2 hover:underline'
                    >
                      {documentAction}
                      <ExternalLink aria-hidden='true' className='h-4 w-4' />
                    </a>
                    {document.sourceUrl !== document.documentUrl && (
                      <a
                        href={document.sourceUrl}
                        target='_blank'
                        rel='noreferrer'
                        aria-label={`Official source page for ${document.title}`}
                        className='hover:underline'
                      >
                        Official source page
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
