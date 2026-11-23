import { expect, test } from '../test-config';

test('finds the provincial Tourism Code and links to its official document', async ({
  page,
}) => {
  await page.goto('/government/local-codes');
  await page
    .getByRole('searchbox', { name: 'Search local codes and ordinances' })
    .fill('tourism');

  const tourism = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Tourism Code', exact: true }),
  });
  await expect(
    tourism.getByRole('link', {
      name: 'Open official document for Tourism Code',
      exact: true,
    })
  ).toHaveAttribute(
    'href',
    /drive\.google\.com\/.*0B57nO5rKmbOeVTZnTEFQZTJ5TUE/
  );
  await expect(
    tourism.getByRole('link', {
      name: 'Official source page for Tourism Code',
      exact: true,
    })
  ).toHaveAttribute('href', 'https://aklan.gov.ph/local-codes/');
  await expect(page).toHaveURL(/search=tourism/);
  await page.reload();
  await expect(tourism).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Environment Code', exact: true })
  ).toHaveCount(0);
});

test('browses the catalogue from Government and finds an amendment by number', async ({
  page,
}) => {
  await page.goto('/government');
  await page
    .getByRole('link', {
      name: /Local Codes.*Search published provincial codes/,
    })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: '13 documents' })
  ).toBeVisible();

  const type = page.getByRole('combobox', { name: 'Document type' });
  await type.selectOption('code');
  await expect(
    page.getByRole('status').filter({ hasText: '8 documents' })
  ).toBeVisible();

  const search = page.getByRole('searchbox', {
    name: 'Search local codes and ordinances',
  });
  await search.fill('2020 008');
  await expect(page.getByText('No documents found')).toBeVisible();
  await type.selectOption('ordinance');

  const amendment = page
    .getByRole('article')
    .filter({ hasText: 'General Ordinance No. 2020-008' });
  await expect(
    amendment.getByRole('link', { name: 'Open official document' })
  ).toHaveAttribute('href', /12cItRkLnx0c6q6InCC43iVQSQNeovSJ5/);
  await expect(
    amendment.getByRole('link', { name: /Official source page/ })
  ).toHaveAttribute(
    'href',
    'https://aklan.gov.ph/general-ordinance-no-2020-008/'
  );
});

test('opens the official gallery for a scanned ordinance', async ({ page }) => {
  await page.goto('/government/local-codes?search=face+masks');
  const result = page
    .getByRole('article')
    .filter({ hasText: 'SP General Ordinance No. 2020-006' });
  await expect(
    result.getByText('Scanned gallery', { exact: true })
  ).toBeVisible();
  await expect(
    result.getByRole('link', { name: 'Open official scan' })
  ).toHaveAttribute(
    'href',
    'https://aklan.gov.ph/sp-general-ordinance-no-2020-006/'
  );
});
