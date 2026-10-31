import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRight,
  PlaneIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
} from 'lucide-react';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';

import { fetchFlightsData } from '@/lib/flights';
import { formatRelativeToNow } from '@/lib/flightStatus';

import airports from '@/data/airports.json';
import { AirportSchedule } from '@/types/flights';

export default function AirportsIndex() {
  const [schedules, setSchedules] = useState<Record<string, AirportSchedule>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlightsData()
      .then(data => {
        const bySlug: Record<string, AirportSchedule> = {};
        data.airports.forEach(a => (bySlug[a.slug] = a));
        setSchedules(bySlug);
      })
      .catch(() => {
        // Non-fatal — cards below just fall back to "—" stats.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className='animate-in fade-in space-y-8 duration-500'>
      <PageHero
        title='Airports'
        description='Kalibo International Airport and Godofredo P. Ramos Airport in Caticlan are the two gateways to Aklan and Boracay Island. Browse live-ish flight schedules for each.'
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {airports.map(airport => {
          const schedule = schedules[airport.slug];
          const departures =
            schedule?.flights.filter(f => f.direction === 'departure').length ??
            null;
          const arrivals =
            schedule?.flights.filter(f => f.direction === 'arrival').length ??
            null;
          const nextFlight = schedule?.flights.find(f =>
            (formatRelativeToNow(f.scheduledLocal) || '').startsWith('in')
          );

          return (
            <Link
              key={airport.slug}
              to={`/airports/${airport.slug}`}
              className='group block h-full'
            >
              <Card hover className='flex h-full flex-col'>
                <CardContent className='flex h-full flex-col space-y-5 p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse rounded-full border-2 p-2.5 transition-colors'>
                        <PlaneIcon className='h-5 w-5' />
                      </div>
                      <div>
                        <h3 className='text-kapwa-text-strong text-xl leading-tight font-black'>
                          {airport.iata}
                        </h3>
                        <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                          {airport.municipality}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support mt-1 h-4 w-4 transition-all group-hover:translate-x-1' />
                  </div>

                  <p className='text-kapwa-text-support text-sm leading-relaxed'>
                    {airport.name}
                  </p>

                  <div className='mt-auto grid grid-cols-2 gap-3 border-t border-kapwa-border-weak pt-4'>
                    <div className='flex items-center gap-2'>
                      <PlaneTakeoffIcon className='text-kapwa-text-brand h-4 w-4 shrink-0' />
                      <div>
                        <p className='text-kapwa-text-strong text-sm font-bold'>
                          {loading ? '—' : (departures ?? 0)}
                        </p>
                        <p className='text-kapwa-text-disabled text-[10px] uppercase'>
                          Departures
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <PlaneLandingIcon className='text-kapwa-text-success h-4 w-4 shrink-0' />
                      <div>
                        <p className='text-kapwa-text-strong text-sm font-bold'>
                          {loading ? '—' : (arrivals ?? 0)}
                        </p>
                        <p className='text-kapwa-text-disabled text-[10px] uppercase'>
                          Arrivals
                        </p>
                      </div>
                    </div>
                  </div>

                  {nextFlight && (
                    <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 rounded-lg border px-3 py-2 text-xs'>
                      <span className='text-kapwa-text-disabled'>Next: </span>
                      <span className='text-kapwa-text-strong font-bold'>
                        {nextFlight.flightNumber}
                      </span>{' '}
                      <span className='text-kapwa-text-support'>
                        {formatRelativeToNow(nextFlight.scheduledLocal)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
