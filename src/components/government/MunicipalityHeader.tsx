import { GlobeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';

import { toTitleCase } from '@/lib/stringUtils';
import { lguLabels } from '@/lib/lguLabels';

interface MunicipalityHeaderProps {
  municipality: {
    barangay_name: string;
    address?: string;
    trunkline?: string[];
    website?: string;
  };
}

export function MunicipalityHeader({ municipality }: MunicipalityHeaderProps) {
  const contactValue = Array.isArray(municipality.trunkline)
    ? municipality.trunkline[0]
    : municipality.trunkline;

  return (
    <header
      className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'
      role='banner'
      aria-label='Municipality information header'
    >
      {/* Top Row: Name + Badge */}
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-5 w-5'
          />
          <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
            Municipality of{' '}
            {toTitleCase(municipality.barangay_name.replace('BARANGAY', ''))}
          </h1>
        </div>
        <Badge variant='secondary' dot>
          Official Profile
        </Badge>
      </div>

      {/* Middle: Address */}
      {municipality.address && (
        <p className='text-kapwa-text-support mb-4 text-sm'>
          {municipality.address}, {lguLabels.location}
        </p>
      )}

      {/* Bottom: Contact Row */}
      <div className='flex flex-col gap-4 text-sm md:flex-row md:gap-6'>
        {contactValue && (
          <a
            href={`tel:${contactValue}`}
            className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
          >
            <PhoneIcon aria-hidden='true' className='h-4 w-4' />
            <span>{contactValue}</span>
          </a>
        )}
        {municipality.website && (
          <a
            href={municipality.website}
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
          >
            <GlobeIcon aria-hidden='true' className='h-4 w-4' />
            <span>Facebook</span>
          </a>
        )}
      </div>
    </header>
  );
}
