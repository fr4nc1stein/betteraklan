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
    name: 'Reported spending by quarter',
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

test('residents can browse available reports across years', async ({
  page,
}) => {
  await page.goto('/transparency/fund-tracker');
  const year = page.getByRole('combobox', { name: 'Year', exact: true });
  await year.selectOption('2026');
  await expect(page.getByRole('table', { name: /2026/ })).toHaveCount(3);
  await expect(
    page.getByRole('article', { name: /quarter 4, 2026/i })
  ).toContainText('The province does not list a report for this quarter.');

  await page
    .getByRole('combobox', { name: 'Fund', exact: true })
    .selectOption('drrmf');
  await year.selectOption('2012');
  await expect(
    page.getByRole('link', { name: /official pdf.*quarter 4.*2012/i })
  ).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});
