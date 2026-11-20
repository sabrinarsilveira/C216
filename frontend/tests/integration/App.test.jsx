import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

const api = vi.hoisted(() => ({
  getApplications: vi.fn(),
  getJobs: vi.fn(),
  getCompanies: vi.fn(),
  getDashboard: vi.fn(),
  createApplication: vi.fn(),
  createCompany: vi.fn(),
  createJob: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));
vi.mock("../../src/services/career", () => api);

describe("painel Trilha", () => {
  beforeEach(() => {
    api.getApplications.mockResolvedValue([]);
    api.getJobs.mockResolvedValue([]);
    api.getCompanies.mockResolvedValue([]);
    api.getDashboard.mockResolvedValue({
      total: 0,
      em_andamento: 0,
      aprovados: 0,
      reprovados: 0,
      sem_atualizacao: 0,
    });
  });

  it("carrega o pipeline e apresenta os estados vazios", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Acompanhe seu caminho." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Um novo começo/)).toBeInTheDocument();
    expect(api.getApplications).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.queryByText("Carregando seu espaço..."),
      ).not.toBeInTheDocument(),
    );
  });
});
