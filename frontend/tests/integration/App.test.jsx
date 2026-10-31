import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import App from "../../src/App";
it("cadastra item e mostra na lista", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.type(screen.getByLabelText(/Descrição/), "14 polegadas");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(screen.getByText("Notebook")).toBeInTheDocument();
  expect(screen.getByText("14 polegadas")).toBeInTheDocument();
});
