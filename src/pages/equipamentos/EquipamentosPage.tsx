import { Card } from "../../components/ui/Card";

const equipamentos = [
  {
    id: 1,
    nome: "Chiller Carrier 30TR",
    tipo: "Chiller",
    moduloTecnico: "HVAC",
    cliente: "Hospital São Lucas"
  },
  {
    id: 2,
    nome: "Inversor Fronius 50kW",
    tipo: "Inversor",
    moduloTecnico: "Solar",
    cliente: "Usina Solar Vale"
  },
  {
    id: 3,
    nome: "QGBT Bloco A",
    tipo: "Quadro elétrico",
    moduloTecnico: "Elétrica",
    cliente: "Metalúrgica Alfa"
  },
  {
    id: 4,
    nome: "Ponte Rolante 10T",
    tipo: "Ponte rolante",
    moduloTecnico: "Ponte rolante",
    cliente: "Metalúrgica Alfa"
  }
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
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{item.nome}</h3>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              {item.moduloTecnico}
            </span>
          </div>
          <p className="text-sm text-slate-500">{item.tipo}</p>
          <p className="mt-1 text-xs text-slate-400">{item.cliente}</p>
        </Card>
      ))}
    </div>
  );
}
