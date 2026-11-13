import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, it, expect, vi } from "vitest";
import App from "../../src/App";
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
  );
});
it("carrega itens da API e cadastra item", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Nenhum item cadastrado.");
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      id: 1,
      name: "Notebook",
      description: "14 polegadas",
    }),
  });
  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.type(screen.getByLabelText(/Descrição/), "14 polegadas");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(await screen.findByText("Notebook")).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(2);
});
it("mostra erro ao carregar", async () => {
  fetch.mockRejectedValueOnce(new Error("offline"));
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
});
it("mantém campos e mostra erro ao cadastrar duplicado", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Nenhum item cadastrado.");
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ detail: "Já existe um item com esse nome" }),
  });
  await user.type(screen.getByLabelText("Nome"), "Livro");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um item com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue("Livro");
});
