import { useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
export default function App() {
  const [items, setItems] = useState([]);
  function addItem(data) {
    setItems((current) => [...current, { id: crypto.randomUUID(), ...data }]);
  }
  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-7 p-5 sm:p-10">
      <header>
        <p className="font-semibold text-blue-700">C216 · Prática 6</p>
        <h1 className="my-2 text-3xl font-bold">Gerenciador de Itens</h1>
        <p className="text-slate-600">
          Cadastre e consulte itens. Os dados são temporários e desaparecem ao
          atualizar a página.
        </p>
      </header>
      <ItemForm onAdd={addItem} />
      <section aria-labelledby="items-title" className="space-y-3">
        <h2 id="items-title" className="text-xl font-semibold">
          Itens cadastrados ({items.length})
        </h2>
        <ItemList items={items} />
      </section>
      <footer className="border-t pt-4 text-sm text-slate-500">
        Frontend independente, sem conexão com a API nesta prática.
      </footer>
    </main>
  );
}
