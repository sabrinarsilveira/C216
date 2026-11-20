import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ItemList } from "../../src/components/ItemList";
it("mostra lista vazia", () => {
  render(<ItemList items={[]} />);
  expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
});
