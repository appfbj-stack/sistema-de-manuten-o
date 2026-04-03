import { Card } from "../../components/ui/Card";

const clientes = [
  { id: 1, nome: "Metalúrgica Alfa", telefone: "(15) 99999-0001" },
  { id: 2, nome: "Clínica Frio Forte", telefone: "(15) 99999-0002" }
];

export function ClientesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-medium text-white">
          Novo
        </button>
      </div>

      {clientes.map((cliente) => (
        <Card key={cliente.id}>
          <h3 className="font-semibold">{cliente.nome}</h3>
          <p className="text-sm text-slate-500">{cliente.telefone}</p>
        </Card>
      ))}
    </div>
  );
}
