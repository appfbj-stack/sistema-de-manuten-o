import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToQueue } from "../../lib/db/queue";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import {
  fetchEquipmentOptionsSupabase,
  type EquipmentOption
} from "../../lib/supabaseOrders";
import {
  getChecklistTemplateByTechnicalType,
  getTechnicalTypeLabel,
  TECHNICAL_TYPE_OPTIONS,
  TECHNICAL_TYPE_VALUES
} from "../../lib/technicalModules";
import type { TechnicalType } from "../../lib/technicalModules";
import { useOSStore } from "../../store/osStore";

const schema = z.object({
  titulo: z.string().min(3, "Informe o título da OS"),
  cliente: z.string().min(1, "Selecione o cliente"),
  equipamento: z.string().min(1, "Selecione ou crie o equipamento"),
  equipamentoPersonalizado: z.string().optional(),
  tecnico: z.string().min(1, "Selecione o técnico"),
  technicalType: z.enum(TECHNICAL_TYPE_VALUES, {
    message: "Selecione o módulo técnico"
  }),
  tipoServico: z.string().min(1, "Selecione o tipo de serviço"),
  prioridade: z.string().min(1, "Selecione a prioridade"),
  dataAgendada: z.string().min(1, "Informe a data"),
  observacoes: z.string().optional(),
  servicoExecutado: z.string().optional(),
  diagnosticoTecnico: z.string().optional(),
  acoesExecutadas: z.string().optional(),
  pendenciasRecomendacoes: z.string().optional(),
  liberacaoFinal: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const clientes = [
  { nome: "Metalúrgica Alfa" },
  { nome: "Usinagem Delta" }
];

const equipamentos: { nome: string; technicalType: TechnicalType }[] = [
  { nome: "Chiller Carrier 30TR", technicalType: "HVAC" },
  { nome: "UTA Trane Bloco B", technicalType: "HVAC" },
  { nome: "Self-Contained York 20TR", technicalType: "HVAC" },
  { nome: "VRF Daikin Torre Norte", technicalType: "HVAC" },
  { nome: "Splitão Hitachi 15TR", technicalType: "HVAC" },
  { nome: "Inversor Fronius 50kW", technicalType: "SOLAR" },
  { nome: "Inversor Huawei SUN2000 100kW", technicalType: "SOLAR" },
  { nome: "String Box Usina Leste", technicalType: "SOLAR" },
  { nome: "Tracker Solar Fileira A", technicalType: "SOLAR" },
  { nome: "Quadro Elétrico QDG-01", technicalType: "ELETRICA" },
  { nome: "QGBT Bloco A", technicalType: "ELETRICA" },
  { nome: "Transformador 500kVA", technicalType: "ELETRICA" },
  { nome: "Banco de Capacitores BC-01", technicalType: "ELETRICA" },
  { nome: "Ponte Rolante 10T", technicalType: "PONTE_ROLANTE" },
  { nome: "Ponte Rolante 15T", technicalType: "PONTE_ROLANTE" },
  { nome: "Talha Elétrica 3T", technicalType: "PONTE_ROLANTE" },
  { nome: "Monovia 2T Linha Norte", technicalType: "PONTE_ROLANTE" }
];

const tecnicos = [
  { nome: "Fernando Borges" },
  { nome: "Técnico João" }
];

export function CriarOSPage() {
  const navigate = useNavigate();
  const createOrder = useOSStore((state) => state.createOrder);
  const [equipamentosRemotos, setEquipamentosRemotos] = useState<EquipmentOption[]>([]);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      cliente: "",
      equipamento: "",
      equipamentoPersonalizado: "",
      tecnico: "",
      technicalType: "PONTE_ROLANTE",
      tipoServico: "",
      prioridade: "media",
      dataAgendada: "",
      observacoes: "",
      servicoExecutado: "",
      diagnosticoTecnico: "",
      acoesExecutadas: "",
      pendenciasRecomendacoes: "",
      liberacaoFinal: ""
    }
  });
  const selectedTechnicalType = watch("technicalType");
  const selectedEquipamento = watch("equipamento");
  const checklistSugestivo = getChecklistTemplateByTechnicalType(selectedTechnicalType);
  const equipamentosFonte = equipamentosRemotos.length ? equipamentosRemotos : equipamentos;
  const equipamentosDoModulo = useMemo(
    () => equipamentosFonte.filter((item) => item.technicalType === selectedTechnicalType),
    [equipamentosFonte, selectedTechnicalType]
  );
  const equipamentosFiltrados = useMemo(() => {
    const term = equipmentSearch.trim().toLowerCase();
    if (!term) return equipamentosDoModulo;
    return equipamentosDoModulo.filter((item) => item.nome.toLowerCase().includes(term));
  }, [equipamentosDoModulo, equipmentSearch]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void fetchEquipmentOptionsSupabase()
      .then((items) => {
        if (items.length) {
          setEquipamentosRemotos(items);
        }
      })
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    if (selectedEquipamento === "OUTRO" || !selectedEquipamento) return;
    const existsInModulo = equipamentosDoModulo.some((item) => item.nome === selectedEquipamento);
    if (!existsInModulo) {
      setValue("equipamento", "");
    }
  }, [equipamentosDoModulo, selectedEquipamento, setValue]);

  const onSubmit = async (data: FormData) => {
    const equipamentoFinal =
      data.equipamento === "OUTRO"
        ? (data.equipamentoPersonalizado ?? "").trim()
        : data.equipamento;
    if (!equipamentoFinal) {
      alert("Informe o nome do equipamento personalizado.");
      return;
    }

    const {
      equipamentoPersonalizado,
      servicoExecutado,
      diagnosticoTecnico,
      acoesExecutadas,
      pendenciasRecomendacoes,
      liberacaoFinal,
      ...rest
    } = data;
    const os = {
      id: Date.now().toString(),
      ...rest,
      equipamento: equipamentoFinal,
      relatorioDetalhado: {
        servicoExecutado,
        diagnosticoTecnico,
        acoesExecutadas,
        pendenciasRecomendacoes,
        liberacaoFinal
      },
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
                  <option key={item.nome} value={item.nome}>
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
              <input
                value={equipmentSearch}
                onChange={(event) => setEquipmentSearch(event.target.value)}
                className="mb-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Buscar equipamento por nome"
              />
              <select
                {...register("equipamento")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione</option>
                {equipamentosFiltrados.map((item) => (
                  <option key={item.nome} value={item.nome}>
                    {item.nome}
                  </option>
                ))}
                <option value="OUTRO">Outro (digitar nome)</option>
              </select>
              {errors.equipamento ? (
                <p className="mt-1 text-xs text-red-600">{errors.equipamento.message}</p>
              ) : null}
              {selectedEquipamento === "OUTRO" ? (
                <div className="mt-2">
                  <input
                    {...register("equipamentoPersonalizado")}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Digite o nome do equipamento"
                  />
                </div>
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
                  <option key={item.nome} value={item.nome}>
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
              <label className="mb-1 block text-sm font-medium">Módulo técnico</label>
              <select
                {...register("technicalType")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                {TECHNICAL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.technicalType ? (
                <p className="mt-1 text-xs text-red-600">{errors.technicalType.message}</p>
              ) : null}
            </div>

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

            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                Checklist sugerido para {getTechnicalTypeLabel(selectedTechnicalType)}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {checklistSugestivo.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
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

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Relatório técnico detalhado
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Serviço executado</label>
                  <textarea
                    {...register("servicoExecutado")}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Descreva de forma objetiva o serviço realizado"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Diagnóstico técnico</label>
                  <textarea
                    {...register("diagnosticoTecnico")}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Falhas identificadas, causa provável e impacto"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Ações executadas</label>
                  <textarea
                    {...register("acoesExecutadas")}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Itens corrigidos, substituições e testes executados"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Pendências e recomendações</label>
                  <textarea
                    {...register("pendenciasRecomendacoes")}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Pendências abertas e recomendações para próxima visita"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Liberação final</label>
                  <textarea
                    {...register("liberacaoFinal")}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Ex: Liberado para operação / Liberado com ressalvas"
                  />
                </div>
              </div>
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
