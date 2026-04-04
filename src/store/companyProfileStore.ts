import { create } from "zustand";

const STORAGE_KEY = "nexus_company_profile_v1";

export type CompanyProfile = {
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
};

type CompanyProfileState = {
  profile: CompanyProfile;
  setProfile: (profile: CompanyProfile) => void;
};

const defaultProfile: CompanyProfile = {
  companyName: "",
  cnpj: "",
  phone: "",
  email: "",
  address: ""
};

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
      address: parsed.address ?? ""
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
  }
}));
