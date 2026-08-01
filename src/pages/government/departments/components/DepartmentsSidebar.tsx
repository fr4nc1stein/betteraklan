import { useNavigate, useParams } from 'react-router-dom';

import { Building2Icon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { officeIcons } from '@/lib/officeIcons';
import { lguLabels } from '@/lib/lguLabels';
import { formatGovName } from '@/lib/stringUtils';

import departmentsData from '@/data/directory/departments.json';

const prefixPattern = new RegExp(
  `${lguLabels.adjective.toUpperCase()} |LOCAL |DEPARTMENT OF |PROVINCIAL |MUNICIPAL `,
  'g'
);

export default function DepartmentsSidebar() {
  const { department: activeSlug } = useParams();
  const navigate = useNavigate();

  const sortedDepartments = [...departmentsData].sort((a, b) => {
    const cleanA = a.office_name.replace(prefixPattern, '');
    const cleanB = b.office_name.replace(prefixPattern, '');
    return cleanA.localeCompare(cleanB);
  });

  return (
    <SidebarContainer title={`${lguLabels.adjective} Departments`}>
      {sortedDepartments.map(dept => {
        // 2. Get the specific icon or fallback to a default building icon
        const IconComponent = officeIcons[dept.slug] || Building2Icon;

        return (
          <SidebarItem
            key={dept.slug}
            label={formatGovName(dept.office_name, 'department')}
            tooltip={dept.office_name}
            icon={IconComponent} // Use the specific icon
            isActive={activeSlug === dept.slug}
            onClick={() =>
              navigate(`/government/departments/${dept.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        );
      })}
    </SidebarContainer>
  );
}
