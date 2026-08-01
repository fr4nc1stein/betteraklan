import { FC, useState } from 'react';

import {
  BarChart3,
  Banknote,
  Info,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';

import FinancialPieChart, {
  ChartDataPoint,
} from '@/pages/transparency/components/FinancialPieChart';

import budgetSummary from '@/data/transparency/budgetSummary';

import { formatPesoAdaptive } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  actual: 'Actual',
  current: 'Current Year',
  proposed: 'Proposed',
};

const STATUS_VARIANT: Record<
  string,
  'success' | 'primary' | 'warning' | 'slate'
> = {
  actual: 'success',
  current: 'primary',
  proposed: 'warning',
};

// Hidden for now — proposed budget years (e.g. 2026) aren't finalized yet.
const visibleBudgetSummary = budgetSummary.filter(y => y.status !== 'proposed');

const BudgetPage: FC = () => {
  const [selectedYear, setSelectedYear] = useState(
    visibleBudgetSummary[visibleBudgetSummary.length - 1].year
  );

  const current =
    visibleBudgetSummary.find(y => y.year === selectedYear) ??
    visibleBudgetSummary[visibleBudgetSummary.length - 1];

  const calcPct = (val: number, total: number) => (total > 0 ? val / total : 0);

  const incomeTotal =
    current.income.totalReceipts ??
    current.income.totalLocalSources +
      (current.income.totalExternalSources ?? 0);

  const incomeChartData: ChartDataPoint[] = [
    {
      name: 'Local Sources',
      value: current.income.totalLocalSources,
      percent: calcPct(current.income.totalLocalSources, incomeTotal),
      details: [
        {
          name: 'Tax Revenue',
          value: current.income.totalTaxRevenue,
          percent: calcPct(
            current.income.totalTaxRevenue,
            current.income.totalLocalSources
          ),
        },
        {
          name: 'Non-Tax Revenue',
          value: current.income.totalNonTaxRevenue,
          percent: calcPct(
            current.income.totalNonTaxRevenue,
            current.income.totalLocalSources
          ),
        },
      ],
    },
    ...(current.income.totalExternalSources
      ? [
          {
            name: 'External Sources',
            value: current.income.totalExternalSources,
            percent: calcPct(
              current.income.totalExternalSources,
              incomeTotal
            ),
            details: [
              {
                name: 'National Tax Allotment',
                value: current.income.nationalTaxAllotment,
                percent: calcPct(
                  current.income.nationalTaxAllotment,
                  current.income.totalExternalSources
                ),
              },
              ...(current.income.philhealthPayments
                ? [
                    {
                      name: 'Philhealth Payments',
                      value: current.income.philhealthPayments,
                      percent: calcPct(
                        current.income.philhealthPayments,
                        current.income.totalExternalSources
                      ),
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  const exp = current.expenditure;
  const expenditureChartData: ChartDataPoint[] = exp
    ? [
        {
          name: 'Personal Services',
          value: exp.personalServices,
          percent: calcPct(exp.personalServices, exp.totalExpenditures),
        },
        {
          name: 'MOOE',
          value: exp.maintenanceAndOperatingExpenses,
          percent: calcPct(
            exp.maintenanceAndOperatingExpenses,
            exp.totalExpenditures
          ),
        },
        {
          name: 'Special Purpose Appropriation',
          value: exp.specialPurposeAppropriation,
          percent: calcPct(
            exp.specialPurposeAppropriation,
            exp.totalExpenditures
          ),
        },
        {
          name: 'Capital Outlay',
          value: exp.capitalOutlay,
          percent: calcPct(exp.capitalOutlay, exp.totalExpenditures),
        },
        {
          name: 'Financial Expenses',
          value: exp.financialExpenses,
          percent: calcPct(exp.financialExpenses, exp.totalExpenditures),
        },
      ]
    : [];

  const net =
    exp && current.income.totalReceipts
      ? current.income.totalReceipts - exp.totalExpenditures
      : undefined;

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 pb-20 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/transparency'>Transparency</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Budget</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='border-kapwa-border-weak bg-kapwa-bg-surface flex flex-col gap-8 rounded-3xl border p-8 shadow-sm xl:flex-row xl:items-center xl:justify-between'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant={STATUS_VARIANT[current.status]} dot>
              {STATUS_LABEL[current.status]}
            </Badge>
            <Badge variant='slate'>{current.label}</Badge>
            <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase'>
              <Info className='text-kapwa-text-disabled h-3.5 w-3.5' />
              <span>Philippine Peso</span>
            </div>
          </div>
          <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold flex items-center gap-3'>
            <Banknote className='h-8 w-8 text-kapwa-text-success' />
            Provincial Budget
          </h1>
          <p className='text-kapwa-text-disabled max-w-xl text-sm leading-relaxed font-medium'>
            Programmed appropriation and income by object of expenditure, as
            reported in the province&apos;s annual budget documents.
          </p>
        </div>

        <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised shrink-0 rounded-2xl border p-2 flex gap-1'>
          {visibleBudgetSummary.map(y => (
            <button
              key={y.year}
              onClick={() => setSelectedYear(y.year)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                y.year === selectedYear
                  ? 'bg-kapwa-brand-600 text-kapwa-text-inverse'
                  : 'text-kapwa-text-support hover:bg-kapwa-bg-surface'
              }`}
            >
              {y.year}
            </button>
          ))}
        </div>
      </div>

      <div role='region' aria-label='Budget Summary Cards'>
        <CardGrid columns={4}>
          <StatCard
            icon={Landmark}
            label='Total Receipts'
            value={
              current.income.totalReceipts
                ? formatPesoAdaptive(current.income.totalReceipts).fullString
                : 'Pending'
            }
            subtext='Local + External Sources'
            iconBg='bg-kapwa-green-50 text-kapwa-green-600'
          />
          <StatCard
            icon={ReceiptText}
            label='Total Expenditures'
            value={
              exp
                ? formatPesoAdaptive(exp.totalExpenditures).fullString
                : 'Not yet published'
            }
            subtext='Personal Services + MOOE + CO + FE + SPA'
            iconBg='bg-kapwa-bg-brand-weak text-kapwa-text-brand'
          />
          <StatCard
            icon={BarChart3}
            label='Net Position'
            value={
              net !== undefined
                ? formatPesoAdaptive(net).fullString
                : 'Not available'
            }
            subtext='Receipts minus expenditures'
            iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
          />
          <StatCard
            icon={Info}
            label='National Tax Allotment'
            value={
              formatPesoAdaptive(current.income.nationalTaxAllotment)
                .fullString
            }
            subtext='Share from national government'
            iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
          />
        </CardGrid>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        <FinancialPieChart
          title='Income Composition'
          icon={Landmark}
          data={incomeChartData}
          colors={[
            'var(--color-kapwa-brand-600)',
            'var(--color-kapwa-blue-600)',
            'var(--color-kapwa-gray-500)',
            'var(--color-kapwa-gray-400)',
          ]}
        />

        {exp ? (
          <FinancialPieChart
            title='Expenditure Allocation'
            icon={ReceiptText}
            data={expenditureChartData}
            colors={[
              'var(--color-kapwa-red-600)',
              'var(--color-kapwa-orange-600)',
              'var(--color-kapwa-yellow-600)',
              'var(--color-kapwa-blue-600)',
              'var(--color-kapwa-gray-400)',
            ]}
          />
        ) : (
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm'>
            <ReceiptText className='text-kapwa-text-disabled mb-3 h-8 w-8' />
            <p className='text-kapwa-text-strong font-bold'>
              Expenditure breakdown not yet published
            </p>
            <p className='text-kapwa-text-disabled mt-1 max-w-sm text-sm'>
              The {current.year} budget document available to us only covers
              proposed income at this time.
            </p>
          </div>
        )}
      </div>

      <footer className='space-y-3 pt-10 text-center'>
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface mx-auto inline-flex max-w-2xl items-center gap-2 rounded-full border px-4 py-2 shadow-sm'>
          <ShieldCheck className='h-4 w-4 shrink-0 text-kapwa-text-success' />
          <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            Source: Province of Aklan Annual Budget Reports (FDPP Form 1b)
          </span>
        </div>
        <p className='text-kapwa-text-disabled mx-auto max-w-2xl text-xs leading-relaxed'>
          {current.sourceNote}
        </p>
      </footer>
    </div>
  );
};

export default BudgetPage;
