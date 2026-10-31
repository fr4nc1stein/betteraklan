import { CreditCard, Hammer, Truck } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

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
    // The FY2027 budget transparency portal, deployed separately.
    name: 'DPWH Projects',
    slug: 'https://transparency.betteraklan.org',
    icon: Truck,
  },
];

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
