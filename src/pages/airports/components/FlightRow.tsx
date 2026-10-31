import { PlaneLandingIcon, PlaneTakeoffIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { SplitFlap } from '@/components/ui/SplitFlap';

import {
  formatFlightTime,
  formatRelativeToNow,
  getStatusVariant,
} from '@/lib/flightStatus';

import { NormalizedFlight } from '@/types/flights';

export function FlightRow({
  flight,
  style,
}: {
  flight: NormalizedFlight;
  style?: React.CSSProperties;
}) {
  const isDeparture = flight.direction === 'departure';
  const DirectionIcon = isDeparture ? PlaneTakeoffIcon : PlaneLandingIcon;

  return (
    <div
      className='border-kapwa-border-weak bg-kapwa-bg-surface animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-3 rounded-xl border p-4 shadow-xs duration-500 sm:flex-row sm:items-center sm:justify-between'
      style={style}
    >
      <div className='flex items-center gap-3'>
        <div
          className={`shrink-0 rounded-lg border p-2 ${
            isDeparture
              ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
              : 'border-kapwa-border-success bg-kapwa-bg-success-weak text-kapwa-text-success'
          }`}
        >
          <DirectionIcon className='h-4 w-4' aria-hidden='true' />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <SplitFlap
              text={flight.flightNumber}
              className='text-[11px]'
              cellHeightEm={1.6}
            />
          </div>
          <p className='text-kapwa-text-support mt-1 truncate text-xs font-medium'>
            {flight.airline}
            {flight.otherAirport && (
              <>
                {' '}
                · {isDeparture ? 'to' : 'from'}{' '}
                <span className='font-bold'>{flight.otherAirport.iata}</span>{' '}
                {flight.otherAirport.name}
              </>
            )}
          </p>
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 sm:justify-end'>
        <div className='text-right'>
          <SplitFlap
            text={formatFlightTime(flight.scheduledLocal)}
            className='text-xs'
            cellHeightEm={1.7}
            cellWidthEm={0.95}
          />
          <p className='text-kapwa-text-disabled mt-1 text-[10px] font-medium tracking-wide'>
            {formatRelativeToNow(flight.scheduledLocal)}
            {flight.terminal ? ` · Terminal ${flight.terminal}` : ''}
          </p>
        </div>
        <Badge variant={getStatusVariant(flight.status)}>{flight.status}</Badge>
      </div>
    </div>
  );
}
