import { useNavigate, useParams } from 'react-router-dom';

import { CompassIcon, MapPinIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import municipalitiesTourism from '@/data/tourism/municipalities.json';

export default function TourismSidebar() {
  const { municipality: activeSlug } = useParams();
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Tourism'>
      <SidebarItem
        label='Overview'
        icon={CompassIcon}
        isActive={!activeSlug}
        onClick={() =>
          navigate('/tourism', { state: { scrollToContent: true } })
        }
      />
      <div className='border-kapwa-border-weak my-2 border-t' />
      {[...municipalitiesTourism]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(municipality => (
          <SidebarItem
            key={municipality.slug}
            label={municipality.name}
            icon={MapPinIcon}
            isActive={activeSlug === municipality.slug}
            onClick={() =>
              navigate(`/tourism/${municipality.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        ))}
    </SidebarContainer>
  );
}
