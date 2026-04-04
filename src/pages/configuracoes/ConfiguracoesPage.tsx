import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useCompanyProfileStore,
  type CompanyProfile,
  type TechnicianRole
} from "../../store/companyProfileStore";

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function ConfiguracoesPage() {
  const profile = useCompanyProfileStore((state) => state.profile);
  const setProfile = useCompanyProfileStore((state) => state.setProfile);
  const addTechnician = useCompanyProfileStore((state) => state.addTechnician);
  const removeTechnician = useCompanyProfileStore((state) => state.removeTechnician);
  const setTechnicianAccess = useCompanyProfileStore((state) => state.setTechnicianAccess);
  const [form, setForm] = useState<CompanyProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [teamSaved, setTeamSaved] = useState(false);
  const [technicianForm, setTechnicianForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "tecnico" as TechnicianRole
  });

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const updateField = (field: "companyName" | "cnpj" | "phone" | "email" | "address", value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    setProfile(form);
    setSaved(true);
  };

  const handleAddTechnician = () => {
    const name = technicianForm.name.trim();
    const email = technicianForm.email.trim().toLowerCase();
    if (!name || !email) {
      alert("Informe nome e e-mail do técnico.");
      return;
    }
    addTechnician({
      name,
      email,
      phone: technicianForm.phone.trim(),
      role: technicianForm.role,
      accessEnabled: true
    });
    setTechnicianForm({ name: "", email: "", phone: "", role: "tecnico" });
    setTeamSaved(true);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand-100">Configurações</p>
        <h1 className="mt-1 text-2xl font-bold">Dados da sua empresa</h1>
        <p className="mt-2 text-sm text-brand-100">
          Preencha uma vez e use automaticamente em todos os relatórios e PDFs das OS.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-1 text-base font-semibold text-slate-800">Perfil da empresa executora</h2>
        <p className="mb-4 text-sm text-slate-500">
          Esses dados aparecem automaticamente no relatório/PDF quando o técnico preencher a OS.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Nome da empresa</label>
            <input
              value={form.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="Ex: Borges Manutenção Industrial"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">CNPJ</label>
            <input
              value={form.cnpj}
              onChange={(event) => updateField("cnpj", formatCnpj(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefone</label>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", formatPhone(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="contato@empresa.com.br"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Endereço</label>
            <input
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Salvar dados da empresa
          </button>
          {saved ? <p className="text-sm text-emerald-600">Dados salvos com sucesso.</p> : null}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-1 text-base font-semibold text-slate-800">Acesso de técnicos</h2>
        <p className="mb-4 text-sm text-slate-500">
          Cadastre os técnicos da empresa e libere o acesso deles ao sistema de forma simples.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              value={technicianForm.name}
              onChange={(event) =>
                setTechnicianForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="Ex: Técnico Carlos"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail de acesso</label>
            <input
              value={technicianForm.email}
              onChange={(event) =>
                setTechnicianForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="tecnico@empresa.com.br"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefone</label>
            <input
              value={technicianForm.phone}
              onChange={(event) =>
                setTechnicianForm((current) => ({
                  ...current,
                  phone: formatPhone(event.target.value)
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Perfil</label>
            <select
              value={technicianForm.role}
              onChange={(event) =>
                setTechnicianForm((current) => ({
                  ...current,
                  role: event.target.value as TechnicianRole
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            >
              <option value="tecnico">Técnico de campo</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAddTechnician}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Cadastrar técnico
          </button>
          {teamSaved ? <p className="text-sm text-emerald-600">Técnico cadastrado com sucesso.</p> : null}
        </div>

        <div className="mt-4 space-y-2">
          {profile.technicians.length ? (
            profile.technicians.map((technician) => (
              <div
                key={technician.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{technician.name}</p>
                  <p className="text-xs text-slate-500">
                    {technician.email} · {technician.phone || "Sem telefone"} ·{" "}
                    {technician.role === "supervisor" ? "Supervisor" : "Técnico"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTechnicianAccess(technician.id, !technician.accessEnabled)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      technician.accessEnabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {technician.accessEnabled ? "Acesso liberado" : "Acesso bloqueado"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTechnician(technician.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Nenhum técnico cadastrado ainda.</p>
          )}
        </div>
      </div>

      <Link
        to="/equipe"
        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50"
      >
        <span>Equipe</span>
        <span className="text-slate-400">Abrir</span>
      </Link>
    </div>
  );
}
