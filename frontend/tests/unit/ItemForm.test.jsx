import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { ItemForm } from "../../src/components/ItemForm";
it("mostra erro e não chama onAdd sem nome", async () => {
  const user = userEvent.setup(),
    onAdd = vi.fn();
  render(<ItemForm onAdd={onAdd} />);
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(onAdd).not.toHaveBeenCalled();
});
