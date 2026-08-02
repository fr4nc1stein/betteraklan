import { useNavigate, useParams } from 'react-router-dom';

import { CompassIcon, PlaneIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import airports from '@/data/airports.json';

export default function AirportsSidebar() {
  const { airport: activeSlug } = useParams();
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Airports'>
      <SidebarItem
        label='Overview'
        icon={CompassIcon}
        isActive={!activeSlug}
        onClick={() =>
          navigate('/airports', { state: { scrollToContent: true } })
        }
      />
      <div className='border-kapwa-border-weak my-2 border-t' />
      {airports.map(airport => (
        <SidebarItem
          key={airport.slug}
          label={`${airport.iata} — ${airport.municipality}`}
          tooltip={airport.name}
          icon={PlaneIcon}
          isActive={activeSlug === airport.slug}
          onClick={() =>
            navigate(`/airports/${airport.slug}`, {
              state: { scrollToContent: true },
            })
          }
        />
      ))}
    </SidebarContainer>
  );
}
