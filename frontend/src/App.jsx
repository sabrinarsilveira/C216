import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createApplication,
  createCompany,
  createJob,
  deleteApplication,
  deleteCompany,
  deleteJob,
  getApplications,
  getCompanies,
  getDashboard,
  getJobs,
  updateApplication,
  updateCompany,
  updateJob,
} from "./services/career";

const STAGES = [
  ["inscrito", "Inscrito"],
  ["triagem", "Triagem"],
  ["entrevista", "Entrevista"],
  ["teste_tecnico", "Teste técnico"],
  ["aprovado", "Aprovado"],
  ["reprovado", "Reprovado"],
];
const NEXT = {
  inscrito: ["triagem", "reprovado"],
  triagem: ["entrevista", "teste_tecnico", "aprovado", "reprovado"],
  entrevista: ["teste_tecnico", "aprovado", "reprovado"],
  teste_tecnico: ["aprovado", "reprovado"],
  aprovado: [],
  reprovado: [],
};
const labelFor = (key) => STAGES.find(([id]) => id === key)?.[1] ?? key;
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
      }).format(new Date(`${value.slice(0, 10)}T12:00:00`))
    : "";
const initials = (value) =>
  (value || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function App() {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [view, setView] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);

  const refresh = useCallback(async () => {
    const [a, j, c, d] = await Promise.all([
      getApplications(),
      getJobs(),
      getCompanies(),
      getDashboard(),
    ]);
    setApps(a);
    setJobs(j);
    setCompanies(c);
    setStats(d);
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return apps.filter(
      (a) =>
        !q ||
        `${a.job.title} ${a.job.company.name}`
          .toLocaleLowerCase("pt-BR")
          .includes(q),
    );
  }, [apps, query]);
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return jobs.filter(
      (j) =>
        !q ||
        `${j.title} ${j.company.name}`.toLocaleLowerCase("pt-BR").includes(q),
    );
  }, [jobs, query]);
  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return companies.filter(
      (company) => !q || company.name.toLocaleLowerCase("pt-BR").includes(q),
    );
  }, [companies, query]);

  async function save(values) {
    if (modal.type === "company") await createCompany(values);
    if (modal.type === "company-edit")
      await updateCompany(modal.item.id, values);
    if (modal.type === "job") await createJob(values);
    if (modal.type === "job-edit") await updateJob(modal.item.id, values);
    if (modal.type === "application") await createApplication(values);
    if (modal.type === "edit") await updateApplication(modal.item.id, values);
    await refresh();
    setModal(null);
    setToast(
      modal.type === "edit"
        ? "Candidatura atualizada"
        : modal.type === "company-edit"
          ? "Empresa atualizada"
          : modal.type === "job-edit"
            ? "Vaga atualizada"
            : "Cadastro salvo",
    );
  }
  async function remove(item) {
    if (
      !window.confirm(
        `Excluir a candidatura para ${item.job.title} na ${item.job.company.name}?`,
      )
    )
      return;
    try {
      await deleteApplication(item.id);
      await refresh();
      setToast("Candidatura excluída");
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeCompany(company) {
    if (
      !window.confirm(
        `Excluir a empresa ${company.name} e as vagas sem candidaturas vinculadas?`,
      )
    )
      return;
    try {
      await deleteCompany(company.id);
      await refresh();
      setToast("Empresa excluida");
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function removeJob(job) {
    if (!window.confirm(`Excluir a vaga ${job.title}?`)) return;
    try {
      await deleteJob(job.id);
      await refresh();
      setToast("Vaga excluida");
    } catch (reason) {
      setError(reason.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio">
          <span className="brand-mark">
            <BrandIcon />
          </span>
          <span>
            trilha<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="side-label">ESPAÇO DE TRABALHO</div>
        <nav className="side-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={`nav-item ${view === "pipeline" ? "active" : ""}`}
            onClick={() => setView("pipeline")}
          >
            <GridIcon />
            <span>Visão geral</span>
          </button>
          <button
            type="button"
            className={`nav-item ${view === "jobs" ? "active" : ""}`}
            onClick={() => setView("jobs")}
          >
            <BriefcaseIcon />
            <span>Vagas</span>
            <span className="nav-count">{jobs.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${view === "companies" ? "active" : ""}`}
            onClick={() => setView("companies")}
          >
            <GridIcon />
            <span>Empresas</span>
            <span className="nav-count">{companies.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div className="profile-copy">
            <strong>Meu espaço</strong>
            <span>Plano pessoal</span>
          </div>
          <span className="online-dot" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Meu espaço</span>
            <span className="crumb-sep">/</span>
            <strong>
              {view === "jobs"
                ? "Vagas"
                : view === "companies"
                  ? "Empresas"
                  : "Visão geral"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">
              {new Intl.DateTimeFormat("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(new Date())}
            </span>
            <button type="button" className="avatar-small">
              S
            </button>
          </div>
        </header>
        <div className="page-wrap">
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> SUA BUSCA, NO SEU RITMO
              </div>
              <h1>
                {view === "jobs"
                  ? "Suas vagas"
                  : view === "companies"
                    ? "Suas empresas"
                    : "Acompanhe seu caminho."}
              </h1>
              <p className="welcome-subtitle">
                {view === "jobs"
                  ? "Empresas e oportunidades que estao no seu radar."
                  : view === "companies"
                    ? "Organize as empresas do seu caminho profissional."
                    : "Cada candidatura e um passo. Veja como as coisas estao andando."}
              </p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setModal({ type: "company" })}
              >
                <b>+</b> Empresa
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setModal({ type: "job" })}
              >
                <b>+</b> Nova vaga
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setModal({ type: "application" })}
              >
                <b>+</b> Candidatura
              </button>
            </div>
          </section>
          <section className="stats-grid" aria-label="Resumo das candidaturas">
            <Stat
              title="Candidaturas"
              value={stats.total ?? 0}
              note="no seu pipeline"
              tone="ink"
              icon={<StackIcon />}
            />
            <Stat
              title="Em andamento"
              value={stats.em_andamento ?? 0}
              note="seguindo o fluxo"
              tone="blue"
              icon={<PulseIcon />}
            />
            <Stat
              title="Aprovações"
              value={stats.aprovados ?? 0}
              note="novas conquistas"
              tone="green"
              icon={<CheckIcon />}
            />
            <Stat
              title="Reprovações"
              value={stats.reprovados ?? 0}
              note="processos encerrados"
              tone="rose"
              icon={<span>×</span>}
            />
            <Stat
              title="Precisam de atenção"
              value={stats.sem_atualizacao ?? 0}
              note="há mais de 7 dias"
              tone="amber"
              icon={<ClockIcon />}
            />
          </section>
          <section className="section-heading">
            <div>
              <h2>
                {view === "jobs"
                  ? "Oportunidades"
                  : view === "companies"
                    ? "Empresas"
                    : "Seu pipeline"}
              </h2>
              <span className="section-count">
                {view === "jobs"
                  ? `${filteredJobs.length} vagas`
                  : view === "companies"
                    ? `${filteredCompanies.length} empresas`
                    : `${filteredApps.length} candidaturas`}
              </span>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <SearchIcon />
                <input
                  aria-label="Buscar empresa ou cargo"
                  placeholder="Buscar empresa ou cargo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label="Atualizar"
                onClick={() => refresh().catch((e) => setError(e.message))}
              >
                <RefreshIcon />
              </button>
            </div>
          </section>
          {loading ? (
            <div className="loading-state">
              <span className="spinner" />
              Carregando seu espaço...
            </div>
          ) : view === "jobs" ? (
            <Jobs
              jobs={filteredJobs}
              onAdd={() => setModal({ type: "job" })}
              onEdit={(item) => setModal({ type: "job-edit", item })}
              onDelete={removeJob}
            />
          ) : view === "companies" ? (
            <Companies
              companies={filteredCompanies}
              onAdd={() => setModal({ type: "company" })}
              onEdit={(item) => setModal({ type: "company-edit", item })}
              onDelete={removeCompany}
            />
          ) : (
            <Pipeline
              apps={filteredApps}
              onOpen={(item) => setModal({ type: "edit", item })}
              onDelete={remove}
            />
          )}
          <footer className="page-footer">
            <span>Pequenos passos também levam longe.</span>
            <span>
              TRILHA <i>•</i> ORGANIZE SUA JORNADA
            </span>
          </footer>
        </div>
      </main>
      {modal && (
        <Modal
          modal={modal}
          jobs={jobs}
          companies={companies}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, note, tone, icon }) {
  return (
    <article className={`stat-card accent-${tone}`}>
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{note}</div>
    </article>
  );
}
function Pipeline({ apps, onOpen, onDelete }) {
  return (
    <div className="kanban-scroll">
      <div className="kanban-board">
        {STAGES.map(([id, label]) => {
          const items = apps.filter((a) => a.status === id);
          return (
            <section
              className="kanban-column"
              key={id}
              aria-label={`${label}: ${items.length}`}
            >
              <div className="column-heading">
                <span className={`lane-dot dot-${id}`} />
                <h3>{label}</h3>
                <span className="column-count">{items.length}</span>
              </div>
              <div className="column-cards">
                {items.map((item) => (
                  <ApplicationCard
                    key={item.id}
                    item={item}
                    onOpen={() => onOpen(item)}
                    onDelete={() => onDelete(item)}
                  />
                ))}
                {!items.length && (
                  <div className="empty-lane">
                    {id === "inscrito" ? (
                      <>
                        ✳<br />
                        Um novo começo
                        <br />
                        pode ser aqui.
                      </>
                    ) : (
                      <>
                        Nenhuma candidatura
                        <br />
                        nesta etapa.
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
function ApplicationCard({ item, onOpen, onDelete }) {
  const elapsed = Math.floor(
    (Date.now() - new Date(item.last_updated).getTime()) / 86400000,
  );
  const stale =
    elapsed >= 7 && !["aprovado", "reprovado"].includes(item.status);
  return (
    <article className="application-card">
      <div className="card-company-row">
        <span className={`company-avatar company-${item.status}`}>
          {initials(item.job.company.name)}
        </span>
        <span className="company-name">{item.job.company.name}</span>
        <button
          className="card-delete"
          type="button"
          title="Excluir candidatura"
          aria-label="Excluir candidatura"
          onClick={onDelete}
        >
          ×
        </button>
      </div>
      <h4>{item.job.title}</h4>
      <div className="card-meta">
        <span>
          <PinIcon />
          {item.job.location}
        </span>
        <span>
          <CalendarIcon />
          {dateLabel(item.applied_on)}
        </span>
      </div>
      {item.interview_at && (
        <div className="interview-chip">
          <CalendarIcon /> Entrevista ·{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(item.interview_at))}
        </div>
      )}
      <div className="card-footer">
        <span className={stale ? "updated stale" : "updated"}>
          <i />
          {stale
            ? `Parada há ${elapsed} dias`
            : `Atualizada ${dateLabel(item.last_updated)}`}
        </span>
        <button className="card-arrow" type="button" onClick={onOpen}>
          Ver detalhes <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
function Jobs({ jobs, onAdd, onEdit, onDelete }) {
  if (!jobs.length)
    return (
      <div className="empty-jobs">
        <div className="empty-illustration">
          <BriefcaseIcon />
        </div>
        <h3>O próximo passo começa com uma vaga.</h3>
        <p>Salve uma oportunidade e acompanhe sua candidatura por aqui.</p>
        <button type="button" className="button button-primary" onClick={onAdd}>
          Adicionar primeira vaga
        </button>
      </div>
    );
  return (
    <div className="jobs-grid">
      {jobs.map((job) => (
        <article className="job-card" key={job.id}>
          <div className="job-card-top">
            <span className="company-avatar company-inscrito">
              {initials(job.company.name)}
            </span>
            <span className="job-mode">
              {job.work_mode === "hibrido"
                ? "Híbrido"
                : job.work_mode === "presencial"
                  ? "Presencial"
                  : "Remoto"}
            </span>
          </div>
          <div className="job-company">{job.company.name}</div>
          <h3>{job.title}</h3>
          <div className="job-meta">
            <span>
              <PinIcon />
              {job.location}
            </span>
            {job.salary_range && <span>{job.salary_range}</span>}
          </div>
          {job.description && (
            <p className="job-description">{job.description}</p>
          )}
          {job.url && (
            <a
              className="job-link"
              href={job.url}
              target="_blank"
              rel="noreferrer"
            >
              Ver descrição da vaga ↗
            </a>
          )}
          <div className="job-card-actions">
            <button
              type="button"
              aria-label={`Editar vaga ${job.title}`}
              onClick={() => onEdit(job)}
            >
              Editar
            </button>
            <button
              type="button"
              aria-label={`Excluir vaga ${job.title}`}
              onClick={() => onDelete(job)}
            >
              Excluir
            </button>
          </div>
          <div className="job-card-footer">
            Criada em {dateLabel(job.created_at)}
          </div>
        </article>
      ))}
    </div>
  );
}

function Companies({ companies, onAdd, onEdit, onDelete }) {
  if (!companies.length)
    return (
      <div className="empty-jobs">
        <h3>Nenhuma empresa cadastrada.</h3>
        <p>Cadastre uma empresa para organizar suas oportunidades.</p>
        <button type="button" className="button button-primary" onClick={onAdd}>
          Adicionar empresa
        </button>
      </div>
    );
  return (
    <div className="jobs-grid">
      {companies.map((company) => (
        <article className="job-card company-card" key={company.id}>
          <div className="job-card-top">
            <span className="company-avatar company-inscrito">
              {initials(company.name)}
            </span>
            <span className="job-mode">Empresa</span>
          </div>
          <h3>{company.name}</h3>
          {company.website && (
            <a
              className="job-link"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
              Visitar site
            </a>
          )}
          {company.notes && <p className="job-description">{company.notes}</p>}
          <div className="job-card-actions">
            <button
              type="button"
              aria-label={`Editar empresa ${company.name}`}
              onClick={() => onEdit(company)}
            >
              Editar
            </button>
            <button
              type="button"
              aria-label={`Excluir empresa ${company.name}`}
              onClick={() => onDelete(company)}
            >
              Excluir
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Modal({ modal, jobs, companies, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const item = modal.item;
  const isCompany = modal.type === "company" || modal.type === "company-edit";
  const isJob = modal.type === "job" || modal.type === "job-edit";
  const title = {
    company: "Nova empresa",
    "company-edit": "Editar empresa",
    job: "Adicionar uma vaga",
    "job-edit": "Editar vaga",
    application: "Nova candidatura",
    edit: "Detalhes da candidatura",
  }[modal.type];
  const sub =
    modal.type === "edit"
      ? `${item.job.company.name} - ${item.job.title}`
      : modal.type === "company-edit"
        ? item.name
        : modal.type === "job-edit"
          ? `${item.company.name} - ${item.title}`
          : "Organize the details and next step.";
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    if (isCompany) {
      values.website ||= null;
      values.notes ||= null;
    }
    if (isJob) {
      values.company_id = Number(values.company_id);
      values.salary_range ||= null;
      values.url ||= null;
      values.description ||= null;
    }
    if (modal.type === "application") {
      values.job_id = Number(values.job_id);
      values.interview_at = values.interview_at
        ? new Date(values.interview_at).toISOString()
        : null;
      values.notes ||= null;
    }
    if (modal.type === "edit") {
      values.interview_at = values.interview_at
        ? new Date(values.interview_at).toISOString()
        : null;
      values.notes ||= null;
    }
    try {
      await onSave(values);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }
  const interviewValue = item?.interview_at
    ? new Date(item.interview_at).toISOString().slice(0, 16)
    : "";
  return (
    <div className="modal-backdrop">
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <div className="modal-kicker">TRILHA · SEU ESPAÇO</div>
        <h2 id="modal-title">{title}</h2>
        <p className="modal-subtitle">{sub}</p>
        <form className="modal-form" onSubmit={submit}>
          {isCompany && (
            <>
              <Field
                label="Nome da empresa"
                name="name"
                required
                defaultValue={item?.name}
                placeholder="Ex.: Estúdio Aurora"
              />
              <Field
                label="Site"
                name="website"
                type="url"
                defaultValue={item?.website ?? ""}
                placeholder="https://empresa.com.br"
              />
              <label className="field">
                <span>Observacoes</span>
                <textarea
                  name="notes"
                  rows="3"
                  defaultValue={item?.notes ?? ""}
                />
              </label>
            </>
          )}
          {isJob && (
            <>
              {companies.length ? (
                <label className="field">
                  <span>Empresa</span>
                  <select
                    name="company_id"
                    required
                    defaultValue={item?.company_id ?? ""}
                  >
                    <option value="" disabled>
                      Selecione uma empresa
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="form-hint">
                  Cadastre uma empresa antes de adicionar uma vaga. Use o botão
                  “Empresa” no topo.
                </p>
              )}
              <Field
                label="Cargo"
                name="title"
                required
                defaultValue={item?.title}
                placeholder="Ex.: Product Designer"
              />
              <div className="form-row">
                <label className="field">
                  <span>Modelo</span>
                  <select
                    name="work_mode"
                    defaultValue={item?.work_mode ?? "remoto"}
                  >
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </label>
                <Field
                  label="Localidade"
                  name="location"
                  defaultValue={item?.location ?? "Remoto"}
                  required
                  placeholder="São Paulo, SP"
                />
              </div>
              <div className="form-row">
                <Field
                  label="Faixa salarial"
                  name="salary_range"
                  defaultValue={item?.salary_range ?? ""}
                  placeholder="R$ 6.000–8.000"
                />
                <Field
                  label="Link da vaga"
                  name="url"
                  type="url"
                  defaultValue={item?.url ?? ""}
                  placeholder="https://..."
                />
              </div>
              <label className="field">
                <span>Sobre a oportunidade</span>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={item?.description ?? ""}
                  placeholder="Anotações sobre a vaga"
                />
              </label>
            </>
          )}
          {modal.type === "application" && (
            <>
              {jobs.length ? (
                <label className="field">
                  <span>Vaga</span>
                  <select name="job_id" required defaultValue="">
                    <option value="" disabled>
                      Selecione uma oportunidade
                    </option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} · {j.company.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="form-hint">
                  Adicione uma empresa e uma vaga antes de registrar uma
                  candidatura.
                </p>
              )}
              <div className="form-row">
                <Field
                  label="Data da candidatura"
                  name="applied_on"
                  type="date"
                  required
                  defaultValue={today()}
                />
                <Field
                  label="Data da entrevista"
                  name="interview_at"
                  type="datetime-local"
                />
              </div>
              <label className="field">
                <span>Observações</span>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Contato, próximos passos, detalhes para lembrar..."
                />
              </label>
            </>
          )}
          {modal.type === "edit" && (
            <>
              <div className="detail-summary">
                <span className={`company-avatar company-${item.status}`}>
                  {initials(item.job.company.name)}
                </span>
                <div>
                  <strong>{item.job.company.name}</strong>
                  <span>
                    {item.job.title} · candidatura de{" "}
                    {dateLabel(item.applied_on)}
                  </span>
                </div>
              </div>
              <label className="field">
                <span>Etapa do processo</span>
                <select name="status" defaultValue={item.status}>
                  <option value={item.status}>
                    {labelFor(item.status)} · atual
                  </option>
                  {NEXT[item.status].map((s) => (
                    <option key={s} value={s}>
                      {labelFor(s)}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Data da entrevista"
                name="interview_at"
                type="datetime-local"
                defaultValue={interviewValue}
              />
              <label className="field">
                <span>Observações</span>
                <textarea
                  name="notes"
                  rows="3"
                  defaultValue={item.notes ?? ""}
                  placeholder="Anotações e próximos passos"
                />
              </label>
              {item.history?.length > 0 && (
                <div className="history-box">
                  <span className="history-title">HISTÓRICO</span>
                  {[...item.history].reverse().map((entry) => (
                    <div className="history-line" key={entry.id}>
                      <i className="history-dot" />
                      <span>
                        <strong>
                          {entry.from_status
                            ? `${labelFor(entry.from_status)} → ${labelFor(entry.to_status)}`
                            : "Candidatura criada"}
                        </strong>
                        <small>
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(entry.changed_at))}
                          {entry.note ? ` · ${entry.note}` : ""}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={
                saving ||
                (isJob && !companies.length) ||
                (modal.type === "application" && !jobs.length)
              }
            >
              {saving
                ? "Salvando..."
                : modal.type === "edit"
                  ? "Salvar alterações"
                  : "Salvar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  defaultValue,
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}
function BrandIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 24.5c5.3 0 7-7 12-7s6.7 7 8 7M8.5 19c2-1.1 3.1-2.8 4.3-5.2 1.2-2.4 2.3-4.8 5.2-4.8 2.7 0 4.4 2 5.5 4.2" />
      <circle cx="7" cy="24.5" r="2" />
      <circle cx="25" cy="24.5" r="2" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3.5 12h17M10 12v2h4v-2" />
    </svg>
  );
}
function StackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.5 9a7 7 0 0 1 11.8-2L20 12M4 12l2.7 5a7 7 0 0 0 11.8-2" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="15" rx="2" />
      <path d="M8 3v6m8-6v6M4 11h16" />
    </svg>
  );
}
