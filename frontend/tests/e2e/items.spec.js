import { expect, test } from "@playwright/test";

const unique = (prefix) => `${prefix}-${Date.now()}`;

test("gerencia empresa, vaga e candidatura com persistência no PostgreSQL", async ({
  page,
}) => {
  const company = unique("Estudio Horizonte");
  const job = unique("UX Designer");

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Acompanhe seu caminho." }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Empresa" }).click();
  await page.getByLabel(/Nome da empresa/).fill(company);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("status")).toContainText("Cadastro salvo");

  await page.getByRole("button", { name: "Nova vaga" }).click();
  await page
    .locator('select[name="company_id"]')
    .selectOption({ label: company });
  await page.locator('input[name="title"]').fill(job);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("status")).toContainText("Cadastro salvo");

  await page
    .getByRole("button", { name: "+ Candidatura", exact: true })
    .click();
  await page
    .locator('select[name="job_id"]')
    .selectOption({ label: `${job} · ${company}` });
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: job })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: job })).toBeVisible();
  await page.getByRole("button", { name: /Ver detalhes/ }).click();
  await page.getByLabel("Etapa do processo").selectOption("triagem");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("heading", { name: job })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir candidatura" }).click();
  await expect(page.getByRole("heading", { name: job })).not.toBeVisible();
});

test("API libera preflight CORS para a interface web", async ({ page }) => {
  await page.goto("/");
  const origin = new URL(page.url()).origin;
  const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8000";
  const response = await page.request.fetch(`${apiUrl}/api/companies/`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["access-control-allow-origin"]).toBe(origin);
});
