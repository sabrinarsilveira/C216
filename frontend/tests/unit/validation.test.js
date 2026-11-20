import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, validateItem } from "../../src/validation";
describe("validateItem", () => {
  it("rejeita nome vazio", () =>
    expect(validateItem({ name: " ", description: "" }).errors.name).toBe(
      "O nome é obrigatório.",
    ));
  it("limita nome a 100 caracteres", () =>
    expect(
      validateItem({ name: "x".repeat(NAME_MAX_LENGTH + 1), description: "" })
        .errors.name,
    ).toContain("100"));
  it("remove espaços externos", () =>
    expect(
      validateItem({ name: " Livro ", description: " Novo " }).values,
    ).toEqual({ name: "Livro", description: "Novo" }));
});
