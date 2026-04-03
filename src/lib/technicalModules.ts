export const TECHNICAL_TYPE_VALUES = [
  "HVAC",
  "SOLAR",
  "ELETRICA",
  "PONTE_ROLANTE"
] as const;

export const TECHNICAL_TYPE_OPTIONS = [
  { value: "HVAC", label: "HVAC" },
  { value: "SOLAR", label: "Solar" },
  { value: "ELETRICA", label: "Elétrica" },
  { value: "PONTE_ROLANTE", label: "Ponte rolante" }
] as const;

export type TechnicalType = (typeof TECHNICAL_TYPE_VALUES)[number];

const technicalTypeLabelMap: Record<TechnicalType, string> = {
  HVAC: "HVAC",
  SOLAR: "Solar",
  ELETRICA: "Elétrica",
  PONTE_ROLANTE: "Ponte rolante"
};

export const CHECKLIST_TEMPLATES_BY_TECHNICAL_TYPE: Record<TechnicalType, string[]> = {
  HVAC: ["Pressão", "Temperatura", "Filtros", "Corrente"],
  SOLAR: ["Módulos", "Inversor", "Geração"],
  ELETRICA: ["Disjuntor", "Tensão", "Aterramento"],
  PONTE_ROLANTE: ["Cabo de aço", "Freio", "Gancho", "NR-12"]
};

export function getTechnicalTypeLabel(type?: string) {
  if (!type) return technicalTypeLabelMap.PONTE_ROLANTE;
  return technicalTypeLabelMap[type as TechnicalType] ?? technicalTypeLabelMap.PONTE_ROLANTE;
}

export function getChecklistTemplateByTechnicalType(type?: string) {
  if (!type) return CHECKLIST_TEMPLATES_BY_TECHNICAL_TYPE.PONTE_ROLANTE;
  return (
    CHECKLIST_TEMPLATES_BY_TECHNICAL_TYPE[type as TechnicalType] ??
    CHECKLIST_TEMPLATES_BY_TECHNICAL_TYPE.PONTE_ROLANTE
  );
}
