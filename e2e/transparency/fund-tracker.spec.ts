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
  await expect(page.getByRole('status')).toHaveText('8 of 8 reports');
  await page
    .getByRole('combobox', { name: 'Fund', exact: true })
    .selectOption('drrmf');
  await page
    .getByRole('combobox', { name: 'Quarter', exact: true })
    .selectOption('4');

  await expect(page.getByRole('status')).toHaveText('1 of 8 reports');
  await expect(page.getByRole('table')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download CSV' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('aklan-2025-drrmf-q4.csv');
});
