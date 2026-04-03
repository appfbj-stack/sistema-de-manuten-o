import { supabase, supabaseCompanyId } from "./supabaseClient";
import type { OrdemServico, OSStatus } from "../store/osStore";

export type EquipmentOption = {
  nome: string;
  technicalType: OrdemServico["technicalType"];
};

type WorkOrderRow = {
  id: string;
  title: string;
  customer_name: string;
  equipment_id: string | null;
  equipment?: { name: string } | { name: string }[] | null;
  technician_name: string;
  technical_type: OrdemServico["technicalType"];
  service_type: string;
  priority: string;
  scheduled_for: string | null;
  notes: string | null;
  status: "ABERTA" | "ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  created_at: string;
  work_order_checklist_items?: {
    label: string;
    result: "ok" | "atencao" | "critico" | "pendente";
    notes: string | null;
  }[];
  work_order_photos?: { file_url: string }[];
  work_order_signatures?: {
    signer_type: "cliente" | "tecnico";
    signer_name: string | null;
    file_url: string;
  }[];
};

type EquipmentRow = {
  name: string;
  technical_type: OrdemServico["technicalType"];
};

const REPORT_PREFIX = "__NEXUS_REPORT_V1__";

function parseNotes(
  notes: string | null
): Pick<OrdemServico, "observacoes" | "relatorioDetalhado"> {
  if (!notes) return { observacoes: "", relatorioDetalhado: undefined };
  if (!notes.startsWith(REPORT_PREFIX)) {
    return { observacoes: notes, relatorioDetalhado: undefined };
  }

  try {
    const parsed = JSON.parse(notes.slice(REPORT_PREFIX.length)) as {
      observacoes?: string;
      relatorioDetalhado?: OrdemServico["relatorioDetalhado"];
    };
    return {
      observacoes: parsed.observacoes ?? "",
      relatorioDetalhado: parsed.relatorioDetalhado
    };
  } catch {
    return { observacoes: notes, relatorioDetalhado: undefined };
  }
}

function buildNotes(
  observacoes: string | undefined,
  relatorioDetalhado: OrdemServico["relatorioDetalhado"] | undefined
) {
  const hasDetalhado = Boolean(
    relatorioDetalhado?.servicoExecutado?.trim() ||
      relatorioDetalhado?.diagnosticoTecnico?.trim() ||
      relatorioDetalhado?.acoesExecutadas?.trim() ||
      relatorioDetalhado?.pendenciasRecomendacoes?.trim() ||
      relatorioDetalhado?.liberacaoFinal?.trim()
  );
  if (!hasDetalhado) return observacoes || null;
  return `${REPORT_PREFIX}${JSON.stringify({
    observacoes: observacoes ?? "",
    relatorioDetalhado
  })}`;
}

function mapStatusFromDb(status: WorkOrderRow["status"]): OSStatus {
  if (status === "ABERTA") return "aberta";
  if (status === "ANDAMENTO") return "andamento";
  return "concluida";
}

function mapStatusToDb(status: OSStatus): WorkOrderRow["status"] {
  if (status === "aberta") return "ABERTA";
  if (status === "andamento") return "ANDAMENTO";
  return "CONCLUIDA";
}

function mapRowToOrder(row: WorkOrderRow): OrdemServico {
  const equipmentName =
    Array.isArray(row.equipment) ? row.equipment[0]?.name : row.equipment?.name;
  const signatures = row.work_order_signatures ?? [];
  const clienteSignature =
    signatures.find((item) => item.signer_type === "cliente")?.signer_name ??
    signatures.find((item) => item.signer_type === "cliente")?.file_url ??
    "";
  const tecnicoSignature =
    signatures.find((item) => item.signer_type === "tecnico")?.signer_name ??
    signatures.find((item) => item.signer_type === "tecnico")?.file_url ??
    "";

  const notes = parseNotes(row.notes);

  return {
    id: row.id,
    titulo: row.title,
    cliente: row.customer_name,
    equipamento: equipmentName ?? "Equipamento",
    tecnico: row.technician_name,
    technicalType: row.technical_type,
    tipoServico: row.service_type,
    prioridade: row.priority,
    dataAgendada: row.scheduled_for ?? "",
    observacoes: notes.observacoes,
    relatorioDetalhado: notes.relatorioDetalhado,
    status: mapStatusFromDb(row.status),
    createdAt: row.created_at,
    checklist:
      row.work_order_checklist_items?.map((item) => ({
        item: item.label,
        status: item.result,
        note: item.notes ?? undefined
      })) ?? [],
    fotos: row.work_order_photos?.map((item) => item.file_url) ?? [],
    assinaturas: {
      cliente: clienteSignature,
      tecnico: tecnicoSignature
    }
  };
}

export async function fetchOrdersSupabase() {
  if (!supabase || !supabaseCompanyId) return [] as OrdemServico[];

  const { data, error } = await supabase
    .from("work_orders")
    .select(
      "id,title,customer_name,equipment_id,technician_name,technical_type,service_type,priority,scheduled_for,notes,status,created_at,equipment:equipment_id(name),work_order_checklist_items(label,result,notes),work_order_photos(file_url),work_order_signatures(signer_type,signer_name,file_url)"
    )
    .eq("company_id", supabaseCompanyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRowToOrder(row as WorkOrderRow));
}

export async function fetchEquipmentOptionsSupabase() {
  if (!supabase || !supabaseCompanyId) return [] as EquipmentOption[];

  const { data, error } = await supabase
    .from("equipment")
    .select("name,technical_type")
    .eq("company_id", supabaseCompanyId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => {
    const item = row as EquipmentRow;
    return {
      nome: item.name,
      technicalType: item.technical_type
    };
  });
}

async function getOrCreateEquipmentId(name: string, technicalType: OrdemServico["technicalType"]) {
  if (!supabase || !supabaseCompanyId) return null;

  const normalized = name.trim();
  if (!normalized) return null;

  const { data: existing, error: selectError } = await supabase
    .from("equipment")
    .select("id")
    .eq("company_id", supabaseCompanyId)
    .eq("name", normalized)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing?.id) return existing.id as string;

  const { data: created, error: insertError } = await supabase
    .from("equipment")
    .insert({
      company_id: supabaseCompanyId,
      technical_type: technicalType,
      name: normalized
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return (created?.id as string) ?? null;
}

export async function createOrderSupabase(order: OrdemServico) {
  if (!supabase || !supabaseCompanyId) {
    throw new Error("Supabase não configurado.");
  }

  const equipmentId = await getOrCreateEquipmentId(order.equipamento, order.technicalType);
  const payload = {
    company_id: supabaseCompanyId,
    title: order.titulo,
    customer_name: order.cliente,
    equipment_id: equipmentId,
    technician_name: order.tecnico,
    technical_type: order.technicalType,
    service_type: order.tipoServico,
    priority: order.prioridade,
    scheduled_for: order.dataAgendada || null,
    notes: buildNotes(order.observacoes, order.relatorioDetalhado),
    status: mapStatusToDb(order.status)
  };

  const { data, error } = await supabase
    .from("work_orders")
    .insert(payload)
    .select(
      "id,title,customer_name,equipment_id,technician_name,technical_type,service_type,priority,scheduled_for,notes,status,created_at,equipment:equipment_id(name),work_order_checklist_items(label,result,notes),work_order_photos(file_url),work_order_signatures(signer_type,signer_name,file_url)"
    )
    .single();

  if (error) throw error;
  return mapRowToOrder(data as WorkOrderRow);
}

export async function updateOrderSupabase(id: string, updates: Partial<OrdemServico>) {
  if (!supabase || !supabaseCompanyId) return;

  const payload: Record<string, unknown> = {};
  if (updates.titulo !== undefined) payload.title = updates.titulo;
  if (updates.cliente !== undefined) payload.customer_name = updates.cliente;
  if (updates.equipamento !== undefined) {
    const equipmentId = await getOrCreateEquipmentId(
      updates.equipamento,
      updates.technicalType ?? "PONTE_ROLANTE"
    );
    payload.equipment_id = equipmentId;
  }
  if (updates.tecnico !== undefined) payload.technician_name = updates.tecnico;
  if (updates.technicalType !== undefined) payload.technical_type = updates.technicalType;
  if (updates.tipoServico !== undefined) payload.service_type = updates.tipoServico;
  if (updates.prioridade !== undefined) payload.priority = updates.prioridade;
  if (updates.dataAgendada !== undefined) payload.scheduled_for = updates.dataAgendada || null;
  if (updates.observacoes !== undefined || updates.relatorioDetalhado !== undefined) {
    const current = await supabase
      .from("work_orders")
      .select("notes")
      .eq("id", id)
      .eq("company_id", supabaseCompanyId)
      .maybeSingle();
    if (current.error) throw current.error;
    const parsed = parseNotes((current.data?.notes as string | null | undefined) ?? null);
    payload.notes = buildNotes(
      updates.observacoes ?? parsed.observacoes,
      updates.relatorioDetalhado ?? parsed.relatorioDetalhado
    );
  }
  if (updates.status !== undefined) payload.status = mapStatusToDb(updates.status);

  if (Object.keys(payload).length) {
    const { error } = await supabase
      .from("work_orders")
      .update(payload)
      .eq("id", id)
      .eq("company_id", supabaseCompanyId);

    if (error) throw error;
  }

  if (updates.checklist) {
    const { error: deleteChecklistError } = await supabase
      .from("work_order_checklist_items")
      .delete()
      .eq("work_order_id", id);
    if (deleteChecklistError) throw deleteChecklistError;

    if (updates.checklist.length) {
      const checklistRows = updates.checklist.map((entry) => ({
        work_order_id: id,
        template_item_id: null,
        label: entry.item,
        result: entry.status,
        notes: entry.note ?? null
      }));
      const { error: insertChecklistError } = await supabase
        .from("work_order_checklist_items")
        .insert(checklistRows);
      if (insertChecklistError) throw insertChecklistError;
    }
  }

  if (updates.fotos) {
    const { error: deletePhotosError } = await supabase
      .from("work_order_photos")
      .delete()
      .eq("work_order_id", id);
    if (deletePhotosError) throw deletePhotosError;

    if (updates.fotos.length) {
      const photoRows = updates.fotos.map((fileUrl) => ({
        work_order_id: id,
        photo_type: "servico",
        file_url: fileUrl
      }));
      const { error: insertPhotosError } = await supabase
        .from("work_order_photos")
        .insert(photoRows);
      if (insertPhotosError) throw insertPhotosError;
    }
  }

  if (updates.assinaturas) {
    const signatureRows = [
      {
        work_order_id: id,
        signer_type: "cliente",
        signer_name: updates.assinaturas.cliente || null,
        file_url: updates.assinaturas.cliente || "assinatura-cliente"
      },
      {
        work_order_id: id,
        signer_type: "tecnico",
        signer_name: updates.assinaturas.tecnico || null,
        file_url: updates.assinaturas.tecnico || "assinatura-tecnico"
      }
    ];
    const { error: upsertSignaturesError } = await supabase
      .from("work_order_signatures")
      .upsert(signatureRows, { onConflict: "work_order_id,signer_type" });
    if (upsertSignaturesError) throw upsertSignaturesError;
  }
}
