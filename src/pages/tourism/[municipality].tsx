import { Link, useParams } from 'react-router-dom';

import {
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  ExternalLinkIcon,
  MapPinIcon,
  PartyPopperIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';

import { toTitleCase } from '@/lib/stringUtils';

import municipalitiesTourism from '@/data/tourism/municipalities.json';
import { TourismEntry } from '@/types/tourism';

function EntryCard({ entry }: { entry: TourismEntry }) {
  return (
    <Card hover={false} className='border-kapwa-border-weak shadow-xs'>
      <CardContent className='space-y-1.5 p-4'>
        {entry.name && (
          <h4 className='text-kapwa-text-strong text-sm leading-tight font-bold'>
            {toTitleCase(entry.name)}
          </h4>
        )}
        <p className='text-kapwa-text-support text-sm leading-relaxed'>
          {entry.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function TourismMunicipalityDetail() {
  const { municipality: slug } = useParams();
  const municipalities = municipalitiesTourism;
  const index = municipalities.findIndex(m => m.slug === slug);
  const municipality = index >= 0 ? municipalities[index] : undefined;

  if (!municipality)
    return <div className='p-20 text-center'>Municipality not found</div>;

  const prev =
    municipalities[(index - 1 + municipalities.length) % municipalities.length];
  const next = municipalities[(index + 1) % municipalities.length];

  return (
    <div className='animate-in fade-in space-y-6 pb-8 duration-500'>
      {/* --- BREADCRUMBS --- */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/tourism'>Tourism</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{municipality.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- HEADER --- */}
      <header className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-5 w-5'
          />
          <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
            {municipality.name}
          </h1>
        </div>
        <p className='text-kapwa-text-support mt-2 text-sm'>
          Festivals, spots, and local products of the Municipality of{' '}
          {municipality.name}, Aklan.
        </p>
      </header>

      {/* --- FESTIVALS & EVENTS --- */}
      {municipality.festivals.length > 0 && (
        <DetailSection title='Festivals & Events' icon={PartyPopperIcon}>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {municipality.festivals.map((f, i) => (
              <EntryCard key={f.name ?? `festival-${i}`} entry={f} />
            ))}
          </div>
        </DetailSection>
      )}

      {/* --- SPOTS & ATTRACTIONS --- */}
      {municipality.attractions.length > 0 && (
        <DetailSection title='Spots & Attractions' icon={SparklesIcon}>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {municipality.attractions.map((a, i) => (
              <EntryCard key={a.name ?? `attraction-${i}`} entry={a} />
            ))}
          </div>
        </DetailSection>
      )}

      {/* --- PRODUCTS & LOCAL DELICACIES --- */}
      {municipality.products.length > 0 && (
        <DetailSection
          title='Products & Local Delicacies'
          icon={ShoppingBagIcon}
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {municipality.products.map((p, i) => (
              <EntryCard key={p.name ?? `product-${i}`} entry={p} />
            ))}
          </div>
        </DetailSection>
      )}

      {/* --- SOURCE NOTE --- */}
      <p className='text-kapwa-text-disabled text-xs italic'>
        Adapted from the official{' '}
        <a
          href={`https://aklan.gov.ph/tourism/${municipality.slug}/`}
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand not-italic hover:underline'
        >
          Aklan Provincial Government Tourism page for {municipality.name}
          <ExternalLinkIcon className='ml-1 inline h-3 w-3' />
        </a>
        .
      </p>

      {/* --- PREV / NEXT --- */}
      <div className='border-kapwa-border-weak flex items-center justify-between gap-4 border-t pt-6'>
        <Link
          to={`/tourism/${prev.slug}`}
          state={{ scrollToContent: true }}
          className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-1.5 text-sm font-bold transition-colors'
        >
          <ChevronLeft className='h-4 w-4' />
          {prev.name}
        </Link>
        <CalendarHeart
          className='text-kapwa-text-disabled h-4 w-4'
          aria-hidden='true'
        />
        <Link
          to={`/tourism/${next.slug}`}
          state={{ scrollToContent: true }}
          className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-1.5 text-sm font-bold transition-colors'
        >
          {next.name}
          <ChevronRight className='h-4 w-4' />
        </Link>
      </div>
    </div>
  );
}
