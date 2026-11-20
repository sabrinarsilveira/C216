const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API = `${API_URL}/api`;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Confira se os serviços estão ativos.",
    );
  }
  if (!response.ok) {
    let detail = "Não foi possível concluir a operação.";
    try {
      const body = await response.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      // A resposta pode não conter JSON.
    }
    throw new Error(detail);
  }
  return response.status === 204 ? null : response.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const getCompanies = () => request("/companies/");
export const getJobs = () => request("/jobs/");
export const getApplications = () => request("/applications/");
export const getDashboard = () => request("/dashboard/");
export const createCompany = (data) =>
  request("/companies/", json("POST", data));
export const createJob = (data) => request("/jobs/", json("POST", data));
export const updateCompany = (id, data) =>
  request(`/companies/${id}`, json("PATCH", data));
export const deleteCompany = (id) =>
  request(`/companies/${id}`, { method: "DELETE" });
export const updateJob = (id, data) =>
  request(`/jobs/${id}`, json("PATCH", data));
export const deleteJob = (id) => request(`/jobs/${id}`, { method: "DELETE" });
export const createApplication = (data) =>
  request("/applications/", json("POST", data));
export const updateApplication = (id, data) =>
  request(`/applications/${id}`, json("PATCH", data));
export const deleteApplication = (id) =>
  request(`/applications/${id}`, { method: "DELETE" });
