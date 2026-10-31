import { useState } from "react";
import { validateItem } from "../validation";
export function ItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  function submit(event) {
    event.preventDefault();
    const result = validateItem({ name, description });
    setErrors(result.errors);
    if (Object.keys(result.errors).length) return;
    onAdd(result.values);
    setName("");
    setDescription("");
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label htmlFor="item-name">Nome</label>
        <input
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="mt-1 block w-full rounded border p-2"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-red-700">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="item-description">
          {"Descri\u00e7\u00e3o (opcional)"}
        </label>
        <textarea
          id="item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded border p-2"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-blue-700 px-4 py-2 text-white"
      >
        Adicionar
      </button>
    </form>
  );
}
