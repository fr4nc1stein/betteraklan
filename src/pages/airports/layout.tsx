import { Outlet, useLocation } from 'react-router-dom';

import { SidebarLayout } from '@/components/layout/SidebarLayout';

import AirportsSidebar from './components/AirportsSidebar';

export default function AirportsPageLayout() {
  const location = useLocation();
  const isDeepPage = location.pathname !== '/airports';

  return (
    <SidebarLayout
      sidebar={<AirportsSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
