type Status = "aberta" | "andamento" | "concluida";

const styles: Record<Status, string> = {
  aberta: "bg-amber-100 text-amber-800",
  andamento: "bg-blue-100 text-blue-800",
  concluida: "bg-emerald-100 text-emerald-800"
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
