import { Link } from 'react-router-dom';

import {
  ArrowRight,
  CalendarHeart,
  CompassIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PartyPopperIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TreesIcon,
  WavesIcon,
} from 'lucide-react';

import { PageHero } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { YouTubeFacade } from '@/components/ui/YouTubeFacade';

import { lguLabels } from '@/lib/lguLabels';

import featuredAttractions from '@/data/tourism/resorts.json';
import municipalitiesTourism from '@/data/tourism/municipalities.json';
import { FeaturedAttraction } from '@/types/tourism';

function attractionIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('beach') || n.includes('island') || n.includes('point'))
    return WavesIcon;
  if (n.includes('falls') || n.includes('spring') || n.includes('eco'))
    return TreesIcon;
  if (n.includes('festival')) return PartyPopperIcon;
  return SparklesIcon;
}

export default function TourismIndex() {
  const attractions = featuredAttractions as FeaturedAttraction[];
  const municipalities = [...municipalitiesTourism].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className='animate-in fade-in space-y-12 duration-500'>
      <PageHero
        title='Tourism'
        description={`From the world-famous shores of Boracay to the hidden waterfalls and centuries-old festivals of its 17 municipalities, ${lguLabels.fullName} invites you to discover a province where nature, culture, and hospitality meet.`}
      />

      {/* --- PROMO VIDEO --- */}
      <section>
        <YouTubeFacade
          videoId='0iy3YKv1FZk'
          title='Welcome to Aklan!'
          subtitle='Watch · Aklan Tourism'
        />
      </section>

      {/* --- FEATURED HIGHLIGHTS --- */}
      <section className='space-y-4'>
        <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
          <CompassIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-4 w-4'
          />
          <h2 className='kapwa-heading-md text-kapwa-text-strong'>
            Featured Highlights
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {attractions.map(spot => {
            const Icon = attractionIcon(spot.name);
            return (
              <Card key={spot.id} className='group flex h-full flex-col'>
                <CardContent className='flex h-full flex-col space-y-3 p-5'>
                  <div className='flex items-start gap-3'>
                    <div className='border-kapwa-border-brand bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='text-kapwa-text-strong text-base leading-tight font-bold'>
                        {spot.name}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 text-[11px] font-medium'>
                        {spot.address}
                      </p>
                    </div>
                  </div>

                  <p className='text-kapwa-text-support flex-1 text-sm leading-relaxed'>
                    {spot.notes}
                  </p>

                  <a
                    href={spot.google_maps_link}
                    target='_blank'
                    rel='noreferrer'
                    className='text-kapwa-text-brand mt-auto flex items-center gap-1.5 border-kapwa-border-weak border-t pt-3 text-[11px] font-bold tracking-widest uppercase hover:underline'
                  >
                    <MapPinIcon className='h-3.5 w-3.5' />
                    View on Map
                    <ExternalLinkIcon className='h-3 w-3' />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* --- EXPLORE BY MUNICIPALITY --- */}
      <section className='space-y-4'>
        <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-4 w-4'
          />
          <h2 className='kapwa-heading-md text-kapwa-text-strong'>
            Explore by Municipality
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {municipalities.map(m => (
            <Link
              key={m.slug}
              to={`/tourism/${m.slug}`}
              className='group block h-full'
              aria-label={`Explore tourism in ${m.name}`}
            >
              <Card
                hover
                className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <MapPinIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-base leading-tight font-bold transition-colors'>
                        {m.name}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        Municipality
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-kapwa-text-link text-kapwa-text-support mt-1 h-4 w-4 transition-all' />
                  </div>

                  <div className='mt-auto flex flex-wrap items-center gap-2 border-t border-kapwa-border-weak pt-3'>
                    <Badge variant='secondary' className='gap-1'>
                      <CalendarHeart className='h-3 w-3' />
                      {m.festivals.length} Festival
                      {m.festivals.length === 1 ? '' : 's'}
                    </Badge>
                    <Badge variant='primary' className='gap-1'>
                      <SparklesIcon className='h-3 w-3' />
                      {m.attractions.length} Attraction
                      {m.attractions.length === 1 ? '' : 's'}
                    </Badge>
                    {m.products.length > 0 && (
                      <Badge variant='slate' className='gap-1'>
                        <ShoppingBagIcon className='h-3 w-3' />
                        Local Products
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* --- SOURCE NOTE --- */}
      <p className='text-kapwa-text-disabled text-center text-xs italic'>
        Attraction, festival, and product details are adapted from the official{' '}
        <a
          href='https://aklan.gov.ph/tourism/'
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand not-italic hover:underline'
        >
          Aklan Provincial Government Tourism pages
        </a>
        . Photos and additional curated experiences are coming soon.
      </p>
    </div>
  );
}
