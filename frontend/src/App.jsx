import { useEffect, useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
import { createItem, listItems } from "./services/items";
export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    listItems()
      .then(setItems)
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);
  async function addItem(values) {
    const created = await createItem(values);
    setItems((current) => [...current, created]);
  }
  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-7 p-5 sm:p-10">
      <header>
        <p className="font-semibold text-blue-700">C216 · Prática 7</p>
        <h1 className="my-2 text-3xl font-bold">Gerenciador de Itens</h1>
        <p className="text-slate-600">
          Cadastre e consulte itens persistidos pela API.
        </p>
      </header>
      <ItemForm onAdd={addItem} />
      <section aria-labelledby="items-title" className="space-y-3">
        <h2 id="items-title" className="text-xl font-semibold">
          Itens cadastrados ({items.length})
        </h2>
        {loading ? (
          <p>Carregando itens...</p>
        ) : loadError ? (
          <p role="alert">{loadError}</p>
        ) : (
          <ItemList items={items} />
        )}
      </section>
      <footer className="border-t pt-4 text-sm text-slate-500">
        Frontend conectado à API e ao PostgreSQL.
      </footer>
    </main>
  );
}
