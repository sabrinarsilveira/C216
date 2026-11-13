export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const ITEMS_URL = `${API_URL}/items/`;
async function request(url, options, fallback) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }
  if (!response.ok) {
    let detail;
    try {
      detail = (await response.json()).detail;
    } catch {
      /* resposta sem JSON */
    }
    throw new Error(typeof detail === "string" ? detail : fallback);
  }
  return response.json();
}
export function listItems() {
  return request(ITEMS_URL, undefined, "Erro ao carregar os itens.");
}
export function createItem({ name, description }) {
  return request(
    ITEMS_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || null }),
    },
    "Erro ao cadastrar o item.",
  );
}
