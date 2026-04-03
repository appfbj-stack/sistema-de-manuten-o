import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { addToQueue } from "../../lib/db/queue";
import { useOSStore } from "../../store/osStore";

const schema = z.object({
  titulo: z.string().min(3, "Informe o título da OS"),
  cliente: z.string().min(1, "Selecione o cliente"),
  equipamento: z.string().min(1, "Selecione o equipamento"),
  tecnico: z.string().min(1, "Selecione o técnico"),
  tipoServico: z.string().min(1, "Selecione o tipo de serviço"),
  prioridade: z.string().min(1, "Selecione a prioridade"),
  dataAgendada: z.string().min(1, "Informe a data"),
  observacoes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const clientes = [
  { id: "1", nome: "Metalúrgica Alfa" },
  { id: "2", nome: "Usinagem Delta" }
];

const equipamentos = [
  { id: "1", nome: "Ponte Rolante 10T" },
  { id: "2", nome: "Talha Elétrica 3T" },
  { id: "3", nome: "Quadro Elétrico QDG-01" }
];

const tecnicos = [
  { id: "1", nome: "Fernando Borges" },
  { id: "2", nome: "Técnico João" }
];

export function CriarOSPage() {
  const navigate = useNavigate();
  const createOrder = useOSStore((state) => state.createOrder);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      cliente: "",
      equipamento: "",
      tecnico: "",
      tipoServico: "",
      prioridade: "media",
      dataAgendada: "",
      observacoes: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    const os = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };

    await createOrder(os);

    if (!navigator.onLine) {
      await addToQueue({
        type: "CREATE_OS",
        payload: os
      });

      alert("Salvo offline 🔥");
    } else {
      console.log("Enviar para API futuramente");
    }

    navigate("/os");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Ordens de Serviço</p>
        <h1 className="text-2xl font-bold text-slate-900">Criar nova OS</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Dados principais</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Título da OS</label>
              <input
                {...register("titulo")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Ex: Inspeção de ponte rolante"
              />
              {errors.titulo ? (
                <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Cliente</label>
              <select
                {...register("cliente")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione</option>
                {clientes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              {errors.cliente ? (
                <p className="mt-1 text-xs text-red-600">{errors.cliente.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Equipamento</label>
              <select
                {...register("equipamento")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione</option>
                {equipamentos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              {errors.equipamento ? (
                <p className="mt-1 text-xs text-red-600">{errors.equipamento.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Técnico responsável</label>
              <select
                {...register("tecnico")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione</option>
                {tecnicos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              {errors.tecnico ? (
                <p className="mt-1 text-xs text-red-600">{errors.tecnico.message}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Execução</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo de serviço</label>
              <select
                {...register("tipoServico")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione</option>
                <option value="inspecao">Inspeção</option>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="instalacao">Instalação</option>
              </select>
              {errors.tipoServico ? (
                <p className="mt-1 text-xs text-red-600">{errors.tipoServico.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Prioridade</label>
              <select
                {...register("prioridade")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              {errors.prioridade ? (
                <p className="mt-1 text-xs text-red-600">{errors.prioridade.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Data agendada</label>
              <input
                type="date"
                {...register("dataAgendada")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              {errors.dataAgendada ? (
                <p className="mt-1 text-xs text-red-600">{errors.dataAgendada.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Observações</label>
              <textarea
                {...register("observacoes")}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Descreva o problema ou a atividade a ser executada"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/os")}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-brand-700 px-4 py-3 font-medium text-white"
          >
            Salvar OS
          </button>
        </div>
      </form>
    </div>
  );
}
