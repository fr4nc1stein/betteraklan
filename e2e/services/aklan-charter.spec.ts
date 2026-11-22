import { expect, test } from '../test-config';

test('finds employment registration and its provincial Charter details', async ({
  page,
}) => {
  await page.goto('/services');
  await page
    .getByPlaceholder(/search for services/i)
    .fill('Registration of Local and Overseas Applicants');
  await page
    .getByRole('link', {
      name: /view details for registration of local and overseas applicants/i,
    })
    .click();

  await expect(
    page.getByText(/original copy of signed application letter/i)
  ).toBeVisible();
  await expect(page.getByText(/^42 minutes$/i)).toBeVisible();
  await expect(page.getByText('No fee', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: /public employment service manager.*view profile/i,
    })
  ).toHaveAttribute(
    'href',
    '/government/departments/office-of-the-provincial-public-employment-service'
  );
  await expect(
    page.getByRole('link', { name: /4th Edition.*421–422/i })
  ).toBeVisible();
});

test('browses the complete edition and switches to internal procedures', async ({
  page,
}) => {
  await page.goto('/services');
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Complex', exact: true }).click();
  await page
    .getByRole('link', { name: 'Browse all 2026 Aklan Charter services' })
    .click();
  await expect(page.getByText('409 Results', { exact: true })).toBeVisible();

  await page.getByLabel('Audience').selectOption('public');
  await page
    .getByPlaceholder(/search for services/i)
    .fill('Auditing/Review of Regular Payroll');
  await expect(
    page.getByText('No services found', { exact: true })
  ).toBeVisible();
  await page.getByLabel('Audience').selectOption('internal');
  await page
    .getByRole('link', {
      name: 'View details for Auditing/Review of Regular Payroll',
    })
    .click();
  await expect(
    page.getByText('Internal service', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /4th Edition.*467–469/i })
  ).toBeVisible();
});

test('shows a variable charge and its exact source without presenting it as free', async ({
  page,
}) => {
  await page.goto(
    '/services?source=aklan-2026&audience=all&search=Payment%20of%20Online%20Transaction%20for%20Terminal%20Pass'
  );
  await page
    .getByRole('link', {
      name: 'View details for Payment of Online Transaction for Terminal Pass',
    })
    .click();

  await expect(
    page.getByText(/P 150\.00.*Additional Transaction Fee/i)
  ).toBeVisible();
  await expect(page.getByText('20 minutes', { exact: true })).toBeVisible();
  await expect(
    page.getByText('The Charter checklist lists no documents.', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /4th Edition.*738–739/i })
  ).toBeVisible();
});

test('identifies the hospital when a service title is shared', async ({
  page,
}) => {
  await page.goto(
    '/services?source=aklan-2026&search=Emergency%20Department%20Services'
  );
  await page
    .getByRole('link', {
      name: 'View details for Emergency Department Services — Buruanga Municipal Hospital',
    })
    .click();

  await expect(
    page.getByText('Responsible Offices', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('Buruanga Municipal Hospital', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /4th Edition.*116–117/i })
  ).toBeVisible();
});
