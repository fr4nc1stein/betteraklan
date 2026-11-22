import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FundTracker from './index';

afterEach(cleanup);

describe('School and Disaster Fund Tracker', () => {
  it('shows all eight reports and filters them by fund and quarter', () => {
    render(<FundTracker />);

    expect(
      screen.getAllByRole('link', { name: /official workbook/i })
    ).toHaveLength(8);

    fireEvent.change(screen.getByLabelText('Fund'), {
      target: { value: 'drrmf' },
    });
    fireEvent.change(screen.getByLabelText('Quarter'), {
      target: { value: '4' },
    });

    expect(
      screen.getAllByRole('link', { name: /official workbook/i })
    ).toHaveLength(1);
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
    const links = screen.getAllByRole('link', { name: 'Download CSV' });
    expect(links).toHaveLength(reports.length);

    for (const [index, link] of links.entries()) {
      const [id, expectedRows, utilization] = reports[index];
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
