import { FC, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRightIcon,
  LoaderIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { SplitFlap } from '@/components/ui/SplitFlap';

import { fetchFlightsData } from '@/lib/flights';
import {
  formatFlightTime,
  formatRelativeToNow,
  getStatusVariant,
} from '@/lib/flightStatus';

import airports from '@/data/airports.json';
import { AirportSchedule } from '@/types/flights';

const FlightsTeaserSection: FC = () => {
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
        // Non-fatal — cards below just render an empty state.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className='border-kapwa-border-weak bg-kapwa-bg-surface border-t py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='text-kapwa-text-strong text-2xl font-bold md:text-3xl'>
            Flight Schedule
          </h2>
          <p className='text-kapwa-text-support mt-2'>
            Next flights from Kalibo and Caticlan (Boracay) airports
          </p>
        </div>

        <div className='flex flex-col items-stretch gap-6 md:flex-row'>
          {airports.map(airport => {
            const schedule = schedules[airport.slug];
            const upcoming = schedule?.flights
              .filter(f =>
                (formatRelativeToNow(f.scheduledLocal) || '').startsWith('in')
              )
              .slice(0, 2);

            return (
              <Card key={airport.slug} className='w-full flex-1'>
                <CardContent className='p-4 md:p-6'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-kapwa-text-strong text-lg font-bold'>
                        {airport.iata} · {airport.municipality}
                      </h3>
                      <p className='text-kapwa-text-disabled text-xs'>
                        {airport.name}
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className='text-kapwa-text-disabled flex items-center gap-2 py-4'>
                      <LoaderIcon className='h-4 w-4 animate-spin' />
                      Loading flights...
                    </div>
                  ) : upcoming && upcoming.length > 0 ? (
                    <div className='space-y-3'>
                      {upcoming.map(flight => {
                        const Icon =
                          flight.direction === 'departure'
                            ? PlaneTakeoffIcon
                            : PlaneLandingIcon;
                        return (
                          <div
                            key={`${flight.direction}-${flight.flightNumber}`}
                            className='border-kapwa-border-weak bg-kapwa-bg-hover flex items-center justify-between gap-3 rounded-xl border p-3'
                          >
                            <div className='flex items-center gap-2.5'>
                              <Icon className='text-kapwa-text-brand h-4 w-4 shrink-0' />
                              <div>
                                <SplitFlap
                                  text={flight.flightNumber}
                                  className='text-[10px]'
                                  cellHeightEm={1.5}
                                />
                                <p className='text-kapwa-text-disabled mt-1 text-[11px]'>
                                  {formatFlightTime(flight.scheduledLocal)} ·{' '}
                                  {formatRelativeToNow(flight.scheduledLocal)}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getStatusVariant(flight.status)}>
                              {flight.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-kapwa-text-disabled py-4 text-sm'>
                      No upcoming flights in the current window.
                    </p>
                  )}

                  <Link
                    to={`/airports/${airport.slug}`}
                    className='text-kapwa-text-brand mt-4 flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase hover:underline'
                  >
                    Full Schedule
                    <ArrowRightIcon className='h-3.5 w-3.5' />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlightsTeaserSection;
