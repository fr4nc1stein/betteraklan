import { Outlet, useLocation } from 'react-router-dom';

import { SidebarLayout } from '@/components/layout/SidebarLayout';

import MunicipalitiesSidebar from './components/MunicipalitiesSidebar';

export default function MunicipalitiesPageLayout() {
  const location = useLocation();

  // Logic: Collapse if not on the index
  const isDeepPage = location.pathname !== '/government/municipalities';

  return (
    <SidebarLayout
      sidebar={<MunicipalitiesSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
