import { Outlet, useLocation } from 'react-router-dom';

import { SidebarLayout } from '@/components/layout/SidebarLayout';

import TourismSidebar from './components/TourismSidebar';

export default function TourismPageLayout() {
  const location = useLocation();

  // Logic: Collapse if not on the index
  const isDeepPage = location.pathname !== '/tourism';

  return (
    <SidebarLayout
      sidebar={<TourismSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
