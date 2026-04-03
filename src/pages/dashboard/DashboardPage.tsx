import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/authStore";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Bem-vindo</p>
        <h1 className="text-2xl font-bold">{user?.name ?? "Usuário"}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="OS do dia">
          <p className="text-3xl font-bold">12</p>
        </Card>
        <Card title="Em andamento">
          <p className="text-3xl font-bold">4</p>
        </Card>
        <Card title="Concluídas">
          <p className="text-3xl font-bold">8</p>
        </Card>
        <Card title="Alertas">
          <p className="text-3xl font-bold text-red-600">3</p>
        </Card>
      </div>

      <Card title="Resumo financeiro">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Receber hoje</span>
            <strong>R$ 1.850,00</strong>
          </div>
          <div className="flex justify-between">
            <span>Pendente</span>
            <strong>R$ 3.420,00</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}
