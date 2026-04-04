import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCompanyProfileStore } from "../../store/companyProfileStore";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(4, "Digite sua senha")
});

type FormData = z.infer<typeof schema>;

type BillingAccessResponse = {
  accessStatus: "active" | "inactive";
};

const apiUrl = import.meta.env.VITE_API_URL?.trim();

async function loadBillingAccess(companyId: string) {
  if (!apiUrl) {
    return { accessStatus: "active" as const };
  }

  const response = await fetch(`${apiUrl}/billing/access/${encodeURIComponent(companyId)}`);
  if (!response.ok) {
    throw new Error("Falha ao consultar status de pagamento");
  }

  const data = (await response.json()) as BillingAccessResponse;
  return data;
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const companyProfile = useCompanyProfileStore((state) => state.profile);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    const email = data.email.trim().toLowerCase();
    const ownerEmail = companyProfile.email.trim().toLowerCase();
    const companyId =
      import.meta.env.VITE_SUPABASE_COMPANY_ID?.trim() || companyProfile.cnpj.trim() || "empresa-001";
    const technician = companyProfile.technicians.find(
      (item) => item.email.trim().toLowerCase() === email
    );

    try {
      const billing = await loadBillingAccess(companyId);
      if (billing.accessStatus === "inactive") {
        alert("Período de teste finalizado. Assinatura pendente para liberar o acesso.");
        return;
      }
    } catch {
      alert("Não foi possível validar pagamento agora. Tente novamente em alguns instantes.");
      return;
    }

    if (ownerEmail && email === ownerEmail) {
      login({
        name: companyProfile.companyName?.trim() || "Dono da empresa",
        email,
        role: "owner"
      });
      navigate("/app");
      return;
    }

    if (technician) {
      if (!technician.accessEnabled) {
        alert("Acesso deste técnico está bloqueado pelo dono da empresa.");
        return;
      }
      login({
        name: technician.name,
        email,
        role: "technician"
      });
      navigate("/app");
      return;
    }

    if (!ownerEmail && !companyProfile.technicians.length) {
      login({
        name: "Administrador",
        email,
        role: "owner"
      });
      navigate("/app");
      return;
    }

    alert("E-mail sem acesso liberado. Peça ao dono para cadastrar seu acesso em Configurações.");
  };

  const ownerEmail = companyProfile.email?.trim();
  const activeTechnicians = companyProfile.technicians.filter((item) => item.accessEnabled).length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Nexus OS</h1>
        <p className="mt-1 text-sm text-slate-500">Gestão de serviços técnicos</p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Acessos liberados
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Dono: {ownerEmail || "não configurado"} · Técnicos ativos: {activeTechnicians}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              {...register("email")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="seuemail@empresa.com"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder=""
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-700 px-4 py-3 font-medium text-white"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
