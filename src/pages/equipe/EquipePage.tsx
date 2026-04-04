import { Card } from "../../components/ui/Card";
import { useCompanyProfileStore } from "../../store/companyProfileStore";

export function EquipePage() {
  const technicians = useCompanyProfileStore((state) => state.profile.technicians);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <span className="rounded-xl bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          {technicians.length} membro(s)
        </span>
      </div>

      {technicians.length ? (
        technicians.map((membro) => (
          <Card key={membro.id}>
            <div className="space-y-1">
              <h3 className="font-semibold">{membro.name}</h3>
              <p className="text-sm text-slate-500">
                {membro.role === "supervisor" ? "Supervisor" : "Técnico de Campo"}
              </p>
              <p className="text-sm text-slate-500">{membro.phone || "Sem telefone"}</p>
              <p
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  membro.accessEnabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {membro.accessEnabled ? "Acesso liberado" : "Acesso bloqueado"}
              </p>
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <p className="text-sm text-slate-500">
            Nenhum técnico cadastrado. Vá em Configurações para cadastrar a equipe.
          </p>
        </Card>
      )}
    </div>
  );
}
