import fundReports from '@/data/transparency/fundReports2025.json';

export const funds = {
  sef: {
    name: 'Special Education Fund',
    columns: ['Amount'],
    receiptsLabel: 'Receipt from SEF',
    spendingLabel: 'Total Disbursements',
    spendingRow: 'Sub-total',
    balanceLabel: 'Balance',
  },
  drrmf: {
    name: 'Local Disaster Risk Reduction and Management Fund',
    receiptsLabel: 'Total Funds Available',
    spendingLabel: 'Total Utilization',
    spendingRow: 'Total Utilization',
    balanceLabel: 'Unutilized Balance',
    columns: [
      'Quick Response Fund (30%)',
      'Mitigation Fund (70%)',
      'National DRRM Fund',
      'Other LGUs',
      'Other sources',
      'Total',
    ],
  },
};

export type Fund = keyof typeof funds;
export type Report = (typeof fundReports)[number];

export function reportedAmount(report: Report, label: string): number | null {
  const amount = report.rows.find(row => row[1] === label)?.at(-1);
  return typeof amount === 'number' ? amount : null;
}

function csvCell(value: string | number | null) {
  if (value === null) return '';
  if (typeof value === 'number') return value.toFixed(2);
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function reportCsv(report: Report, fund: Fund) {
  const rows = [
    [
      'Year',
      'Quarter',
      'Fund',
      'Official workbook',
      'Worksheet',
      'Source row',
      'Particulars',
      ...funds[fund].columns,
    ],
    ...report.rows.map(([sourceRow, label, ...amounts]) => [
      '2025',
      String(report.quarter),
      funds[fund].name,
      report.source,
      report.sheet,
      String(sourceRow),
      label,
      ...amounts,
    ]),
  ];
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent('\uFEFF' + csv)}`;
}
