import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTechnicalTypeLabel } from "../../lib/technicalModules";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useOSStore } from "../../store/osStore";

function ActionCard({
  title,
  description,
  onClick,
  buttonLabel
}: {
  title: string;
  description: string;
  onClick: () => void;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 rounded-xl bg-brand-700 px-4 py-2 text-sm font-medium text-white"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export function DetalheOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const os = useOSStore((state) => state.getOrderById(id));
  const updateOrder = useOSStore((state) => state.updateOrder);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const checklistTotal = os.checklist?.length ?? 0;
  const fotosTotal = os.fotos?.length ?? 0;
  const assinaturasTotal = Number(Boolean(os.assinaturas?.cliente)) + Number(Boolean(os.assinaturas?.tecnico));
  const handleFinish = async () => {
    await updateOrder(os.id, { status: "concluida" });
    navigate(`/os/${os.id}/relatorio`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">OS #{id}</p>
          <h1 className="text-2xl font-bold text-slate-900">{os.titulo}</h1>
        </div>
        <StatusBadge status={os.status} />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Dados da OS</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Cliente</span>
            <strong className="text-right">{os.cliente}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Equipamento</span>
            <strong className="text-right">{os.equipamento}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Técnico</span>
            <strong className="text-right">{os.tecnico}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Tipo de serviço</span>
            <strong className="text-right">{os.tipoServico}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Módulo técnico</span>
            <strong className="text-right">{getTechnicalTypeLabel(os.technicalType)}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Prioridade</span>
            <strong className="text-right">{os.prioridade}</strong>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Data agendada</span>
            <strong className="text-right">{os.dataAgendada}</strong>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Observações</h2>
        <p className="text-sm leading-6 text-slate-600">{os.observacoes || "Sem observações."}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Resumo da execução</h2>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Checklist</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{checklistTotal}</p>
          </div>

          <div className="rounded-xl bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Fotos</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{fotosTotal}</p>
          </div>

          <div className="rounded-xl bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Assinaturas</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{assinaturasTotal}</p>
          </div>
        </div>
      </div>

      <ActionCard
        title="Iniciar checklist"
        description="Abra o checklist dinâmico conforme o tipo de equipamento e serviço."
        buttonLabel="Abrir checklist"
        onClick={() => navigate(`/os/${os.id}/checklist`)}
      />

      <ActionCard
        title="Adicionar fotos"
        description="Registre evidências do equipamento, painel, defeito e serviço executado."
        buttonLabel="Adicionar fotos"
        onClick={() => navigate(`/os/${os.id}/fotos`)}
      />

      <ActionCard
        title="Capturar assinatura"
        description="Coletar assinatura do cliente e do técnico ao finalizar o atendimento."
        buttonLabel="Assinar"
        onClick={() => navigate(`/os/${os.id}/assinaturas`)}
      />

      <ActionCard
        title="Relatório final"
        description="Visualizar relatório completo do serviço"
        buttonLabel="Ver relatório"
        onClick={() => navigate(`/os/${os.id}/relatorio`)}
      />

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/os")}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700"
        >
          Voltar
        </button>

        <button
          onClick={() => void handleFinish()}
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white"
        >
          Finalizar OS
        </button>
      </div>
    </div>
  );
}
