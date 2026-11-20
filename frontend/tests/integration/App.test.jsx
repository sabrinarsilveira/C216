import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  deleteApplication: vi.fn(),
  deleteCompany: vi.fn(),
  deleteJob: vi.fn(),
  updateApplication: vi.fn(),
  updateCompany: vi.fn(),
  updateJob: vi.fn(),
}));
vi.mock("../../src/services/career", () => api);

const applicationFixture = () => ({
  id: 17,
  job_id: 8,
  status: "inscrito",
  applied_on: "2026-11-20",
  interview_at: null,
  notes: null,
  last_updated: "2026-11-20T12:00:00Z",
  job: {
    id: 8,
    title: "Product Designer",
    location: "Remoto",
    company: { id: 3, name: "Aurora Studio" },
  },
  history: [
    {
      id: 21,
      from_status: null,
      to_status: "inscrito",
      note: "Candidatura criada",
      changed_at: "2026-11-20T12:00:00Z",
    },
  ],
});

describe("fluxos de candidatura da Trilha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("avança uma candidatura para triagem e atualiza a coluna do Kanban", async () => {
    const user = userEvent.setup();
    let applications = [applicationFixture()];
    api.getApplications.mockImplementation(async () => applications);
    api.updateApplication.mockImplementation(async (_id, values) => {
      applications = [{ ...applications[0], ...values }];
    });

    render(<App />);

    await screen.findByRole("heading", { name: "Product Designer" });
    await user.click(screen.getByRole("button", { name: "Ver detalhes" }));
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Etapa do processo"),
      "triagem",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar alterações" }),
    );

    await waitFor(() =>
      expect(api.updateApplication).toHaveBeenCalledWith(
        17,
        expect.objectContaining({ status: "triagem" }),
      ),
    );
    expect(
      await screen.findByRole("region", { name: "Triagem: 1" }),
    ).toHaveTextContent("Product Designer");
    expect(screen.getByRole("region", { name: "Inscrito: 0" })).toBeVisible();
  });

  it("mostra o erro retornado ao falhar a atualização da candidatura", async () => {
    const user = userEvent.setup();
    api.getApplications.mockResolvedValue([applicationFixture()]);
    api.updateApplication.mockRejectedValue(
      new Error("Falha ao atualizar candidatura"),
    );

    render(<App />);

    await screen.findByRole("heading", { name: "Product Designer" });
    await user.click(screen.getByRole("button", { name: "Ver detalhes" }));
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Etapa do processo"),
      "triagem",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar alterações" }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Falha ao atualizar candidatura",
    );
  });
});
