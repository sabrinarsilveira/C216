export function ItemList({ items }) {
  if (!items.length)
    return (
      <p className="rounded border border-dashed p-6 text-center text-slate-600">
        Nenhum item cadastrado.
      </p>
    );
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded border bg-white p-4 shadow-sm">
          <p className="font-semibold">{item.name}</p>
          {item.description && (
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
