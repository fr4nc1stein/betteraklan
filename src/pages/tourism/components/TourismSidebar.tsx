import { useNavigate, useParams } from 'react-router-dom';

import { BedIcon, CompassIcon, MapPinIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import municipalitiesTourism from '@/data/tourism/municipalities.json';

export default function TourismSidebar() {
  const { municipality: activeSlug } = useParams();
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Tourism'>
      <SidebarGroup title='Attractions'>
        <SidebarItem
          label='Overview'
          icon={CompassIcon}
          isActive={!activeSlug}
          onClick={() =>
            navigate('/tourism', { state: { scrollToContent: true } })
          }
        />
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
      </SidebarGroup>

      <SidebarGroup title='Accommodations'>
        <SidebarItem
          label='Boracay'
          icon={BedIcon}
          path='/tourism/accommodations/boracay'
        />
        <SidebarItem
          label='Aklan Mainland'
          icon={BedIcon}
          path='/tourism/accommodations/mainland'
        />
      </SidebarGroup>
    </SidebarContainer>
  );
}
