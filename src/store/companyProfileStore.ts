import { create } from "zustand";

const STORAGE_KEY = "nexus_company_profile_v1";

export type CompanyProfile = {
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  technicians: TechnicianAccess[];
};

export type TechnicianRole = "tecnico" | "supervisor";

export type TechnicianAccess = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TechnicianRole;
  accessEnabled: boolean;
};

type CompanyProfileState = {
  profile: CompanyProfile;
  setProfile: (profile: CompanyProfile) => void;
  addTechnician: (technician: Omit<TechnicianAccess, "id">) => void;
  removeTechnician: (id: string) => void;
  setTechnicianAccess: (id: string, accessEnabled: boolean) => void;
};

const defaultProfile: CompanyProfile = {
  companyName: "",
  cnpj: "",
  phone: "",
  email: "",
  address: "",
  technicians: []
};

function normalizeTechnicians(technicians: unknown): TechnicianAccess[] {
  if (!Array.isArray(technicians)) return [];
  return technicians
    .map((item, index) => {
      const parsed = item as Partial<TechnicianAccess>;
      const email = parsed.email?.toString().trim() ?? "";
      const name = parsed.name?.toString().trim() ?? "";
      if (!name || !email) return null;
      return {
        id: parsed.id?.toString() || `tech_${Date.now()}_${index}`,
        name,
        email,
        phone: parsed.phone?.toString() ?? "",
        role: parsed.role === "supervisor" ? "supervisor" : "tecnico",
        accessEnabled: parsed.accessEnabled !== false
      } satisfies TechnicianAccess;
    })
    .filter((item): item is TechnicianAccess => Boolean(item));
}

function readStoredProfile(): CompanyProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw) as Partial<CompanyProfile>;
    return {
      companyName: parsed.companyName ?? "",
      cnpj: parsed.cnpj ?? "",
      phone: parsed.phone ?? "",
      email: parsed.email ?? "",
      address: parsed.address ?? "",
      technicians: normalizeTechnicians((parsed as { technicians?: unknown }).technicians)
    };
  } catch {
    return defaultProfile;
  }
}

function writeStoredProfile(profile: CompanyProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export const useCompanyProfileStore = create<CompanyProfileState>((set) => ({
  profile: readStoredProfile(),
  setProfile: (profile) => {
    writeStoredProfile(profile);
    set({ profile });
  },
  addTechnician: (technician) =>
    set((state) => {
      const nextProfile = {
        ...state.profile,
        technicians: [
          ...state.profile.technicians,
          { ...technician, id: `tech_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }
        ]
      };
      writeStoredProfile(nextProfile);
      return { profile: nextProfile };
    }),
  removeTechnician: (id) =>
    set((state) => {
      const nextProfile = {
        ...state.profile,
        technicians: state.profile.technicians.filter((item) => item.id !== id)
      };
      writeStoredProfile(nextProfile);
      return { profile: nextProfile };
    }),
  setTechnicianAccess: (id, accessEnabled) =>
    set((state) => {
      const nextProfile = {
        ...state.profile,
        technicians: state.profile.technicians.map((item) =>
          item.id === id ? { ...item, accessEnabled } : item
        )
      };
      writeStoredProfile(nextProfile);
      return { profile: nextProfile };
    })
}));
