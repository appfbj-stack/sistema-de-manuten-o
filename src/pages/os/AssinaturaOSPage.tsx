import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOSStore } from "../../store/osStore";

export function AssinaturaOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const updateOrder = useOSStore((state) => state.updateOrder);
  const os = useOSStore((state) => state.getOrderById(id));

  const [cliente, setCliente] = useState("");
  const [tecnico, setTecnico] = useState("");

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  useEffect(() => {
    if (!os) return;
    setCliente(os.assinaturas?.cliente ?? "");
    setTecnico(os.assinaturas?.tecnico ?? "");
  }, [os]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Assinaturas OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateOrder(os.id, {
      assinaturas: {
        cliente,
        tecnico
      }
    });

    alert("Assinaturas salvas com sucesso.");
    navigate(`/os/${os.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">OS #{os.id}</p>
        <h1 className="text-2xl font-bold text-slate-900">Assinaturas</h1>
        <p className="mt-1 text-sm text-slate-500">{os.titulo}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Assinatura do cliente</h2>
        <textarea
          value={cliente}
          onChange={(event) => setCliente(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Digite o nome do cliente ou identificador da assinatura"
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Assinatura do técnico</h2>
        <textarea
          value={tecnico}
          onChange={(event) => setTecnico(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Digite o nome do técnico ou identificador da assinatura"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(`/os/${os.id}`)}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-brand-700 px-4 py-3 font-medium text-white"
        >
          Salvar assinaturas
        </button>
      </div>
    </div>
  );
}
