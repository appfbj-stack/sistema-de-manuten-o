import { ClipboardList, Home, Settings, Users, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/os", label: "OS", icon: ClipboardList },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/equipamentos", label: "Equip.", icon: Wrench },
  { to: "/configuracoes", label: "Mais", icon: Settings }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                  : "text-slate-500 hover:bg-slate-100"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
