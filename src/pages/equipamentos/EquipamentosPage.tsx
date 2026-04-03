import { Card } from "../../components/ui/Card";

const equipamentos = [
  { id: 1, nome: "Ponte Rolante 10T", tipo: "Ponte rolante", cliente: "Metalúrgica Alfa" },
  { id: 2, nome: "Talha Elétrica 3T", tipo: "Talha", cliente: "Metalúrgica Alfa" }
];

export function EquipamentosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipamentos</h1>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-medium text-white">
          Novo
        </button>
      </div>

      {equipamentos.map((item) => (
        <Card key={item.id}>
          <h3 className="font-semibold">{item.nome}</h3>
          <p className="text-sm text-slate-500">{item.tipo}</p>
          <p className="mt-1 text-xs text-slate-400">{item.cliente}</p>
        </Card>
      ))}
    </div>
  );
}
