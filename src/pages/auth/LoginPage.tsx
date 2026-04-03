import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(4, "Digite sua senha")
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

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
    login(data.email);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Nexus OS</h1>
        <p className="mt-1 text-sm text-slate-500">Gestão de serviços técnicos</p>

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
