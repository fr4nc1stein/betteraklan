import { test, expect } from '../test-config';

const charterPdf =
  'https://drive.google.com/file/d/1KVbRhrNpCuZWBIdN-m-uWc3hFnzLqgyl/view';

const tourismServices = [
  {
    name: 'Get basic tourism information',
    requirements: /^Request form$/,
    time: '25 minutes',
    pages: 'pp. 110–111',
  },
  {
    name: 'Request detailed tourism information',
    requirements: /^Request form$/,
    time: '5 days and 25 minutes',
    pages: 'pp. 111–113',
  },
  {
    name: 'Get tourist assistance at Kalibo International Airport',
    requirements: /No documents required\./,
    time: '10 minutes',
    pages: 'pp. 113–114',
  },
];

for (const service of tourismServices) {
  test(`shows the 2026 Charter details for ${service.name}`, async ({
    isMobile,
    page,
  }) => {
    await page.goto('/services');
    if (isMobile) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Tourism', exact: true }).click();
    await expect(page).toHaveURL(/category=tourism/);
    await page.getByPlaceholder(/Search for services/).fill(service.name);
    await page
      .getByRole('link', { name: `View details for ${service.name}` })
      .click();

    await expect(
      page.getByRole('heading', { name: service.name })
    ).toBeVisible();
    await expect(page.getByText(service.requirements)).toBeVisible();
    await expect(
      page.getByText('Processing Time', { exact: true }).locator('..')
    ).toContainText(service.time);
    await expect(
      page.getByRole('button', { name: 'Fees ₱0.00' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /Aklan Provincial Tourism Office.*View Profile/i,
      })
    ).toHaveAttribute(
      'href',
      '/government/departments/provincial-tourism-office'
    );
    await expect(
      page.getByRole('link', {
        name: `2026 Aklan Citizen’s Charter (4th Edition), ${service.pages}`,
      })
    ).toHaveAttribute('href', charterPdf);
  });
}
