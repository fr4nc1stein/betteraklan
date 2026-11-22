import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import FundTracker from './index';

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 640, 240)
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('School and Disaster Fund Tracker', () => {
  it('opens on the latest school report and updates totals and trend when the fund changes', () => {
    render(<FundTracker />);

    const summary = screen.getByRole('region', { name: 'Reported totals' });
    const trend = screen.getByRole('region', {
      name: /reported spending by quarter/i,
    });
    expect(within(summary).getByText('₱85,621,172.88')).toBeDefined();
    expect(within(trend).getByText('Q1: ₱1,747,380.30')).toBeDefined();
    expect(
      screen.getByRole('table', { name: /school|education/i })
    ).toBeDefined();

    fireEvent.change(screen.getByLabelText('Fund'), {
      target: { value: 'drrmf' },
    });
    fireEvent.change(screen.getByLabelText('Quarter'), {
      target: { value: '4' },
    });

    expect(
      screen.getAllByRole('link', { name: /official workbook/i })
    ).toHaveLength(1);
    expect(within(summary).getByText('₱66,708,894.10')).toBeDefined();
    expect(within(trend).getByText('Q1: ₱55,386,350.00')).toBeDefined();
    const report = screen.getByRole('article', {
      name: /disaster.*quarter 4/i,
    });
    expect(
      within(report).getAllByRole('cell', { name: '66,708,894.10' })
    ).toHaveLength(2);
    expect(
      within(report).getByText(
        'Construction of Agdugayan Revetment Wall (Phase-2) Ibajay,Aklan'
      )
    ).toBeDefined();
    expect(
      within(report)
        .getByRole('link', { name: /official workbook/i })
        .getAttribute('href')
    ).toContain('1vVawHiTrAS7OBvcTT-1zgXcCG7_gb3iM');
  });
  it('shows all four reports for the selected fund and keeps the latest reported totals', () => {
    render(<FundTracker />);
    const quarter = screen.getByRole('combobox', { name: 'Quarter' });
    expect(
      within(quarter).getByRole('option', { name: 'All quarters' })
    ).toBeDefined();

    fireEvent.change(quarter, { target: { value: 'all' } });
    expect(
      screen.getAllByRole('table', { name: /education fund/i })
    ).toHaveLength(4);

    fireEvent.change(screen.getByLabelText('Fund'), {
      target: { value: 'drrmf' },
    });
    expect(screen.getAllByRole('table', { name: /disaster/i })).toHaveLength(4);
    for (const number of [1, 2, 3, 4]) {
      for (const action of ['Official workbook', 'Download CSV']) {
        expect(
          screen.getByRole('link', {
            name: `${action} for Local Disaster Risk Reduction and Management Fund, Quarter ${number}, 2025`,
          })
        ).toBeDefined();
      }
    }
    expect(screen.queryByRole('table', { name: /education fund/i })).toBeNull();
    expect(
      within(
        screen.getByRole('region', { name: 'Latest digitized totals' })
      ).getByText('₱66,708,894.10')
    ).toBeDefined();
  });

  it('navigates the full archive and distinguishes digitized, PDF, and missing quarters', () => {
    render(<FundTracker />);
    const year = screen.getByRole('combobox', { name: 'Year' });
    const quarter = screen.getByRole('combobox', { name: 'Quarter' });
    expect(within(year).getAllByRole('option')).toHaveLength(15);

    fireEvent.change(year, { target: { value: '2013' } });
    expect((quarter as HTMLSelectElement).value).toBe('4');
    expect(
      screen.getByRole('link', { name: /official pdf.*quarter 4.*2013/i })
    ).toBeDefined();

    fireEvent.change(year, { target: { value: '2026' } });
    expect(
      screen.getAllByRole('table', { name: /education fund.*2026/i })
    ).toHaveLength(3);
    expect(
      screen.getByText('The province does not list a report for this quarter.')
    ).toBeDefined();
    expect(
      screen
        .getByRole('link', { name: /download csv.*quarter 3.*2026/i })
        .getAttribute('download')
    ).toBe('aklan-2026-sef-q3.csv');

    fireEvent.change(screen.getByLabelText('Fund'), {
      target: { value: 'drrmf' },
    });
    fireEvent.change(year, { target: { value: '2012' } });
    expect(screen.queryByRole('table')).toBeNull();
    expect(
      screen.getByRole('link', { name: /official pdf.*quarter 4.*2012/i })
    ).toBeDefined();

    fireEvent.change(year, { target: { value: '2019' } });
    fireEvent.change(quarter, { target: { value: '1' } });
    expect(
      screen.getByText(/20% Internal Revenue Allotment report/i)
    ).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('exports the complete financial tables for every quarterly report', () => {
    render(<FundTracker />);

    const reports = [
      ['sef-q1', 11, '1747380.30'],
      ['sef-q2', 15, '7430190.35'],
      ['sef-q3', 18, '23171532.28'],
      ['sef-q4', 23, '85621172.88'],
      ['drrmf-q1', 38, '55386350.00'],
      ['drrmf-q2', 40, '57430309.20'],
      ['drrmf-q3', 51, '63221488.10'],
      ['drrmf-q4', 58, '66708894.10'],
    ] as const;
    for (const [id, expectedRows, utilization] of reports) {
      const [fund, quarter] = id.split('-q');
      fireEvent.change(screen.getByLabelText('Fund'), {
        target: { value: fund },
      });
      fireEvent.change(screen.getByLabelText('Quarter'), {
        target: { value: quarter },
      });
      const link = screen.getByRole('link', { name: /download csv/i });
      expect(link.getAttribute('download')).toBe(`aklan-2025-${id}.csv`);
      const csv = decodeURIComponent(
        (link.getAttribute('href') ?? '').split(',')[1]
      );
      const [header, ...rows] = csv.split('\r\n');
      expect(header).toContain('"Official workbook","Worksheet","Source row"');
      expect(rows).toHaveLength(expectedRows);
      expect(rows.at(-2)?.endsWith(`,${utilization}`)).toBe(true);
    }
  });
});
