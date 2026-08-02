import { useParams } from 'react-router-dom';

import { Briefcase, GraduationCapIcon, UsersIcon } from 'lucide-react';

import { MunicipalityBoundaryMap } from '@/components/government/MunicipalityBoundaryMap';
import { MunicipalityHeader } from '@/components/government/MunicipalityHeader';
import {
  MayorCard,
  OfficialCard,
} from '@/components/government/OfficialCard';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';

import { toTitleCase } from '@/lib/stringUtils';

import municipalitiesData from '@/data/directory/municipal.json';

export default function MunicipalityDetail() {
  const { municipality: slug } = useParams();
  const municipality = municipalitiesData.find(m => m.slug === slug);

  if (!municipality)
    return <div className='p-20 text-center'>Municipality not found</div>;

  const mayor = municipality.officials?.find(o =>
    o.role.includes('Municipal Mayor')
  );
  const councilors = municipality.officials?.filter(o =>
    o.role.includes('SB Member')
  );
  const skOfficials = municipality.officials?.filter(o =>
    o.role.includes('SK')
  );
  const secretary = municipality.officials?.find(o =>
    o.role.includes('Secretary')
  );
  const treasurer = municipality.officials?.find(o =>
    o.role.includes('Treasurer')
  );
  const hasAdministration = Boolean(secretary || treasurer);
  const boundarySlug = municipality.slug.replace('municipality-of-', '');

  return (
    <div className='animate-in fade-in space-y-6 pb-20 duration-500'>
      {/* Skip Link for Accessibility */}
      <a
        href='#main-content'
        className='focus:bg-kapwa-bg-surface focus:text-kapwa-text-strong focus:ring-kapwa-border-focus sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:ring-2'
      >
        Skip to main content
      </a>

      {/* --- BREADCRUMBS --- */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/government/municipalities'>
              Municipalities
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {toTitleCase(
                municipality.barangay_name.replace('BARANGAY ', '')
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- COMPACT IDENTITY HEADER --- */}
      <MunicipalityHeader municipality={municipality} />

      {/* --- BOUNDARY MAP --- */}
      <MunicipalityBoundaryMap
        key={boundarySlug}
        slug={boundarySlug}
        className='border-kapwa-border-weak h-64 w-full overflow-hidden rounded-xl border shadow-sm md:h-80'
      />

      {/* --- OFFICIALS SECTION (Unified) --- */}
      <main id='main-content' className='space-y-6'>
        {/* Section Header */}
        <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-3'>
          <UsersIcon
            aria-hidden='true'
            className='text-kapwa-text-disabled h-4 w-4'
          />
          <h2
            id='officials-heading'
            className='kapwa-heading-md text-kapwa-text-strong'
          >
            Municipal Officials
          </h2>
        </div>

        {/* Mayor */}
        {mayor && (
          <div className='space-y-2' role='group' aria-label='Chief Executive'>
            <p className='sr-only'>Chief Executive</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Chief Executive
            </p>
            <MayorCard official={mayor} />
          </div>
        )}

        {/* Sangguniang Bayan */}
        {councilors && councilors.length > 0 && (
          <div
            className='space-y-2'
            role='group'
            aria-label='Sangguniang Bayan'
          >
            <p className='sr-only'>Sangguniang Bayan</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Sangguniang Bayan
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {councilors.map(councilor => (
                <OfficialCard
                  key={councilor.name}
                  official={councilor}
                  role='Councilor'
                  icon={UsersIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sangguniang Kabataan */}
        {skOfficials && skOfficials.length > 0 && (
          <div
            className='space-y-2'
            role='group'
            aria-label='Sangguniang Kabataan'
          >
            <p className='sr-only'>Sangguniang Kabataan</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Sangguniang Kabataan
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {skOfficials.map(sk => (
                <OfficialCard
                  key={sk.name}
                  official={sk}
                  role={sk.role.replace('SK ', '')}
                  icon={GraduationCapIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Municipal Administration */}
        {hasAdministration && (
          <div
            className='space-y-2'
            role='group'
            aria-label='Municipal Administration'
          >
            <p className='sr-only'>Municipal Administration</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Municipal Administration
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {secretary && (
                <OfficialCard
                  official={secretary}
                  role='Municipal Secretary'
                  icon={Briefcase}
                />
              )}
              {treasurer && (
                <OfficialCard
                  official={treasurer}
                  role='Municipal Treasurer'
                  icon={Briefcase}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
