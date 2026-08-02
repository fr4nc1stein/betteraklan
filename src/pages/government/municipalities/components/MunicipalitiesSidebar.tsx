import { useNavigate, useParams } from 'react-router-dom';

import { MapPinIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { formatGovName } from '@/lib/stringUtils';

import municipalitiesData from '@/data/directory/municipal.json';

export default function MunicipalitiesSidebar() {
  const { municipality: activeSlug } = useParams(); // URL param: /municipalities/:municipality
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Municipalities'>
      {municipalitiesData
        .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name))
        .map(municipality => (
          <SidebarItem
            key={municipality.slug}
            label={formatGovName(municipality.barangay_name, 'municipality')}
            icon={MapPinIcon}
            isActive={activeSlug === municipality.slug}
            onClick={() =>
              navigate(`/government/municipalities/${municipality.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        ))}
    </SidebarContainer>
  );
}
