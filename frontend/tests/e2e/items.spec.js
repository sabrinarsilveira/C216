import { expect, test } from "@playwright/test";

const uniqueName = (prefix) => `${prefix}-${Date.now()}`;

test("cadastra item, rejeita duplicado e confirma persistência após recarregar", async ({
  page,
}) => {
  const name = uniqueName("Notebook");
  const posts = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel(/Descrição/).fill("14 polegadas");
  await page.getByRole("button", { name: "Adicionar" }).click();
  const item = page.getByRole("listitem").filter({ hasText: name });
  await expect(item).toBeVisible();

  await page.getByLabel("Nome").fill(name);
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Já existe um item com esse nome",
  );
  await expect(page.getByLabel("Nome")).toHaveValue(name);
  await expect.poll(() => posts.length).toBe(2);

  const origin = new URL(page.url()).origin;
  const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8000";
  const preflight = await page.request.fetch(`${apiUrl}/items/`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  expect(preflight.status()).toBe(200);
  expect(preflight.headers()["access-control-allow-origin"]).toBe(origin);

  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: name }),
  ).toBeVisible();
});
