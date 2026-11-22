import { useState } from 'react';

import { Outlet, useLocation, useSearchParams } from 'react-router-dom';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { PageHeader } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import SearchInput from '@/components/ui/SearchInput';
import type {
  CharterAudienceFilter,
  ServiceSourceFilter,
} from '@/types/servicesTypes';

import ServicesSidebar from './components/ServicesSidebar';

// Additional filter types
export type ClassificationFilter =
  | 'Simple'
  | 'Complex'
  | 'Highly Technical'
  | 'all';

export interface ServicesOutletContext {
  searchQuery: string;
  selectedCategorySlug: string;
  selectedOfficeDivision: string;
  selectedSource: ServiceSourceFilter;
  selectedAudience: CharterAudienceFilter;
  selectedClassification: ClassificationFilter;
  setOfficeDivision: (division: string) => void;
  setSource: (source: ServiceSourceFilter) => void;
  setAudience: (audience: CharterAudienceFilter) => void;
  setClassification: (classification: ClassificationFilter) => void;
}

export default function ServicesLayout() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isIndexPage =
    location.pathname === '/services' || location.pathname === '/services/';

  const selectedCategorySlug = searchParams.get('category') || 'all';

  const handleCategoryChange = (slug: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('category', slug);
      return next;
    });
  };

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  // New filter states
  const [selectedOfficeDivision, setSelectedOfficeDivision] = useState('all');
  const [selectedSource, setSelectedSource] = useQueryState(
    'source',
    parseAsStringLiteral([
      'all',
      'aklan-2026',
      'citizens-charter',
      'community',
    ] as const).withDefault('all')
  );
  const [selectedAudience, setSelectedAudience] = useQueryState(
    'audience',
    parseAsStringLiteral(['public', 'internal', 'all'] as const).withDefault(
      'public'
    )
  );
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationFilter>('all');

  return (
    <SidebarLayout
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // Unified header using PageHeader component
      headerNode={
        isIndexPage ? (
          <PageHeader
            variant='hero'
            title='Government Services'
            description='Explore provincial and municipal services from citizens’ charters and community contributions.'
            actions={
              <SearchInput
                placeholder='Search for services (e.g., Business Permit)...'
                value={searchQuery}
                onChangeValue={setSearchQuery}
                size='md'
              />
            }
          />
        ) : (
          <PageHeader
            variant='compact'
            title='Service Directory'
            description='Browse requirements and procedures.'
          />
        )
      }
      sidebar={
        <ServicesSidebar
          selectedCategorySlug={selectedCategorySlug}
          handleCategoryChange={handleCategoryChange}
        />
      }
    >
      <Outlet
        context={{
          searchQuery,
          selectedCategorySlug,
          selectedOfficeDivision,
          selectedSource,
          selectedAudience,
          selectedClassification,
          setOfficeDivision: setSelectedOfficeDivision,
          setSource: setSelectedSource,
          setAudience: setSelectedAudience,
          setClassification: setSelectedClassification,
        }}
      />
    </SidebarLayout>
  );
}
