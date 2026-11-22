import { CreditCard, Hammer, Truck, Wallet } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';
import { isAklanProvince } from '@/lib/lguConfig';

const sections = [
  {
    name: 'Budget',
    slug: 'budget',
    icon: CreditCard,
  },
  {
    name: 'Procurement',
    slug: 'procurement',
    icon: Hammer,
  },
  {
    name: 'School and Disaster Funds',
    slug: 'fund-tracker',
    icon: Wallet,
    hidden: !isAklanProvince,
  },
  {
    // The FY2027 budget transparency portal, deployed separately.
    name: 'DPWH Projects',
    slug: 'https://transparency.betteraklan.org',
    icon: Truck,
  },
].filter(section => !section.hidden);

export default function TransparencySidebar() {
  return (
    <SidebarContainer title='Transparency'>
      {sections.map(section => (
        <SidebarItem
          key={section.slug}
          label={section.name}
          icon={section.icon}
          path={`${section.slug}`}
        />
      ))}
    </SidebarContainer>
  );
}
