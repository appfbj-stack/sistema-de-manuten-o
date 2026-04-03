import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useOSStore } from "../../store/osStore";

export function OrdensPage() {
  const navigate = useNavigate();
  const ordens = useOSStore((state) => state.orders);
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <button
          onClick={() => navigate("/os/nova")}
          className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-medium text-white"
        >
          Nova OS
        </button>
      </div>

      {ordens.map((os) => (
        <button
          key={os.id}
          onClick={() => navigate(`/os/${os.id}`)}
          className="block w-full text-left"
        >
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{os.titulo}</h3>
                <p className="text-sm text-slate-500">{os.cliente}</p>
              </div>
              <StatusBadge status={os.status} />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
