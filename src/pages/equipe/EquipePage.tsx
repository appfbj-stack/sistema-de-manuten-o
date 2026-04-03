import { Card } from "../../components/ui/Card";

const equipe = [
  { id: "t1", nome: "Fernando Borges", funcao: "Coordenador Técnico", telefone: "(15) 99999-1001" },
  { id: "t2", nome: "Técnico João", funcao: "Técnico de Campo", telefone: "(15) 99999-1002" },
  { id: "t3", nome: "Ana Paula", funcao: "Planejamento", telefone: "(15) 99999-1003" }
];

export function EquipePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <span className="rounded-xl bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          {equipe.length} membro(s)
        </span>
      </div>

      {equipe.map((membro) => (
        <Card key={membro.id}>
          <div className="space-y-1">
            <h3 className="font-semibold">{membro.nome}</h3>
            <p className="text-sm text-slate-500">{membro.funcao}</p>
            <p className="text-sm text-slate-500">{membro.telefone}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
