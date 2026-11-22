import { expect, test } from '../test-config';

test('residents can reach the fund tracker and download a quarterly report', async ({
  page,
}) => {
  await page.goto('/transparency');
  await page
    .getByRole('main')
    .getByText('School and Disaster Funds', { exact: true })
    .click();

  await expect(page).toHaveURL(/\/transparency\/fund-tracker$/);
  await expect(
    page.getByRole('table', { name: /education fund, quarter 4/i })
  ).toBeVisible();
  const chart = page.getByRole('region', {
    name: 'Reported spending through each quarter',
  });
  await expect(chart.locator('.recharts-line-curve')).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Fund', exact: true })
    .selectOption('drrmf');
  const quarter = page.getByRole('combobox', { name: 'Quarter', exact: true });
  await quarter.selectOption('all');
  await expect(page.getByRole('table', { name: /disaster/i })).toHaveCount(4);
  await quarter.selectOption('2');

  await expect(
    page.getByRole('table', { name: /disaster.*quarter 2/i })
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Reported totals' })
  ).toContainText('₱57,430,309.20');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /download csv.*quarter 2/i }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('aklan-2025-drrmf-q2.csv');
});
