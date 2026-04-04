import { ArrowRight, CheckCircle2, ShieldCheck, Sun, Wind, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Ordens de serviço com checklist inteligente",
  "Fotos, assinatura e relatório PDF no mesmo fluxo",
  "Funciona offline para técnico em campo",
  "Controle de equipe e acessos por empresa"
];

const segments = [
  {
    title: "Elétrica Industrial",
    description: "Inspeções, corretivas e preventivas com histórico técnico por equipamento.",
    icon: Zap
  },
  {
    title: "Energia Solar",
    description: "Checklist de usinas e geração de relatório para manutenção e performance.",
    icon: Sun
  },
  {
    title: "HVAC",
    description: "Atendimentos em climatização com evidências em foto e assinatura digital.",
    icon: Wind
  },
  {
    title: "Ponte Rolante",
    description: "Acompanhamento técnico de segurança e conformidade nas intervenções.",
    icon: ShieldCheck
  }
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="landing-glow landing-glow-primary" />
      <div className="landing-glow landing-glow-secondary" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-10 md:px-10">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-slate-100">NEXUS OS</span>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Entrar
          </Link>
        </header>

        <section className="mt-12 grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex w-fit rounded-full border border-brand-500/40 bg-brand-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-brand-50">
              Gestão de manutenção em campo
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              Venda mais serviços com uma operação técnica rápida, organizada e profissional
            </h1>
            <p className="max-w-xl text-base text-slate-200 md:text-lg">
              O Nexus OS ajuda equipes de manutenção industrial nas áreas elétrica, solar, HVAC e
              ponte rolante a executarem atendimentos na rua com controle total, mesmo sem internet.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Quero testar agora
                <ArrowRight size={18} />
              </Link>
              <a
                href="#modulos"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="landing-float rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-200">Fluxo completo para técnico externo</p>
            <div className="mt-4 grid gap-3">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3"
                >
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-400" />
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="mt-16">
          <h2 className="text-2xl font-extrabold md:text-3xl">Módulos especializados por área</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            Estrutura pronta para empresas que precisam padronizar o serviço técnico e crescer com
            qualidade no atendimento.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {segments.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.1]"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-brand-500/20 p-3 text-brand-100">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-brand-400/30 bg-gradient-to-r from-brand-900/60 to-slate-900/50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">
            Pronto para vender mais manutenção?
          </p>
          <h3 className="mt-2 text-2xl font-black md:text-3xl">
            Libere seu time técnico para focar em execução e resultado
          </h3>
          <p className="mt-3 max-w-2xl text-slate-200">
            Teste agora e veja como o Nexus OS organiza ordens, acelera relatórios e melhora a
            percepção de valor do seu serviço.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Testar o app
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
