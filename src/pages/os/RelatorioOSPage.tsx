import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate, useParams } from "react-router-dom";
import { getTechnicalTypeLabel } from "../../lib/technicalModules";
import { useCompanyProfileStore } from "../../store/companyProfileStore";
import { useOSStore } from "../../store/osStore";

export function RelatorioOSPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const os = useOSStore((state) => state.getOrderById(id));
  const companyProfile = useCompanyProfileStore((state) => state.profile);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Relatório OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const checklist = os.checklist ?? [];
  const itensOk = checklist.filter((item) => item.status === "ok");
  const itensAtencao = checklist.filter((item) => item.status === "atencao");
  const itensCriticos = checklist.filter((item) => item.status === "critico");
  const itensPendentes = checklist.filter((item) => item.status === "pendente");
  const itensDiagnostico = [...itensCriticos, ...itensAtencao, ...itensPendentes];
  const equipeExecutora = os.tecnico
    .split(/[\/,;|]/)
    .map((nome) => nome.trim())
    .filter(Boolean);
  const abertura = os.createdAt
    ? new Date(os.createdAt).toLocaleString("pt-BR", { hour12: false })
    : "Não informado";
  const emissao = new Date().toLocaleString("pt-BR", { hour12: false });
  const statusLiberacao =
    itensCriticos.length > 0
      ? "Não liberado para operação"
      : itensAtencao.length > 0
        ? "Liberado com recomendações"
        : "Liberado para operação";
  const relatorioDetalhado = os.relatorioDetalhado;
  const assinaturaClienteDigital = os.assinaturas?.cliente?.startsWith("data:image");
  const assinaturaTecnicoDigital = os.assinaturas?.tecnico?.startsWith("data:image");

  const gerarPDF = async () => {
    if (!reportRef.current || isGeneratingPdf) return;

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f1f5f9"
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pdfWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`relatorio-os-${os.id}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const compartilharComDono = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const linkRelatorio = window.location.href;
      const empresa = companyProfile.companyName?.trim() || "Equipe técnica";
      const mensagem = `Olá! Aqui está o relatório da OS #${os.id} (${os.titulo}).\n\nEmpresa executora: ${empresa}\nCliente: ${os.cliente}\nData agendada: ${os.dataAgendada}\n\nAcesse pelo link: ${linkRelatorio}`;

      if (navigator.share) {
        await navigator.share({
          title: `Relatório OS #${os.id}`,
          text: mensagem,
          url: linkRelatorio
        });
        return;
      }

      await navigator.clipboard.writeText(mensagem);
      alert("Mensagem copiada. Agora é só colar no WhatsApp e enviar para o dono.");
    } catch {
      alert("Não foi possível compartilhar agora. Tente novamente.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={reportRef} className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Relatório OS #{os.id}</p>
          <h1 className="text-2xl font-bold text-slate-900">{os.titulo}</h1>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Empresa executora</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome da empresa
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {companyProfile.companyName?.trim() || "Não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CNPJ</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {companyProfile.cnpj?.trim() || os.cnpj?.trim() || "Não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefone</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {companyProfile.phone?.trim() || "Não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">E-mail</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {companyProfile.email?.trim() || "Não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Endereço</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {companyProfile.address?.trim() || "Não informado"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Informações do serviço</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Título</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{os.titulo}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{os.cliente}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CNPJ</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {os.cnpj?.trim() ? os.cnpj : "Não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipamento</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{os.equipamento}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Técnico responsável
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{os.tecnico}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Módulo técnico
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {getTechnicalTypeLabel(os.technicalType)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data agendada</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{os.dataAgendada}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Resultado da inspeção</h2>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <p className="text-xs">Total</p>
              <p className="font-bold">{os.checklist?.length ?? 0}</p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 text-center">
              <p className="text-xs">OK</p>
              <p className="font-bold">
                {os.checklist?.filter((item) => item.status === "ok").length ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-amber-100 p-3 text-center">
              <p className="text-xs">Atenção</p>
              <p className="font-bold">
                {os.checklist?.filter((item) => item.status === "atencao").length ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-red-100 p-3 text-center">
              <p className="text-xs">Crítico</p>
              <p className="font-bold">
                {os.checklist?.filter((item) => item.status === "critico").length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Serviço executado</h2>

          <p className="text-sm text-slate-600 leading-6">
            {relatorioDetalhado?.servicoExecutado || os.observacoes || "Sem observações."}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Cronologia da atividade</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Abertura da OS:</strong> {abertura}
            </p>
            <p>
              <strong>Data programada:</strong> {os.dataAgendada}
            </p>
            <p>
              <strong>Emissão do relatório:</strong> {emissao}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Equipe executora</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {equipeExecutora.length ? (
              equipeExecutora.map((nome, index) => <p key={`${nome}-${index}`}>{nome}</p>)
            ) : (
              <p>Não informado</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Diagnóstico técnico</h2>
          <div className="space-y-3 text-sm">
            {itensDiagnostico.length ? (
              itensDiagnostico.map((item, index) => (
                <div key={`${item.item}-${index}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">{item.item}</p>
                  <p className="text-slate-600">Status: {item.status.toUpperCase()}</p>
                  <p className="text-slate-600">
                    Observação: {item.note?.trim() ? item.note : "Sem detalhe informado"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-600">
                {relatorioDetalhado?.diagnosticoTecnico || "Nenhuma não conformidade registrada."}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Ações executadas</h2>
          <div className="space-y-3 text-sm">
            {itensOk.length ? (
              itensOk.map((item, index) => (
                <div key={`${item.item}-${index}`} className="rounded-xl bg-emerald-50 p-3">
                  <p className="font-semibold text-slate-800">{item.item}</p>
                  <p className="text-slate-600">
                    Registro técnico: {item.note?.trim() ? item.note : "Executado sem observação adicional"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-600">
                {relatorioDetalhado?.acoesExecutadas || "Sem ações concluídas registradas."}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Pendências e recomendações</h2>
          <div className="space-y-3 text-sm">
            {[...itensPendentes, ...itensCriticos].length ? (
              [...itensPendentes, ...itensCriticos].map((item, index) => (
                <div key={`${item.item}-${index}`} className="rounded-xl bg-amber-50 p-3">
                  <p className="font-semibold text-slate-800">{item.item}</p>
                  <p className="text-slate-600">
                    Recomendação: {item.note?.trim() ? item.note : "Programar intervenção complementar"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-600">
                {relatorioDetalhado?.pendenciasRecomendacoes ||
                  "Sem pendências abertas após atendimento."}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Liberação final</h2>
          <p className="text-sm font-semibold text-slate-800">
            {relatorioDetalhado?.liberacaoFinal || statusLiberacao}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Fotos do serviço</h2>

          <div className="grid grid-cols-2 gap-3">
            {(os.fotos?.length ? os.fotos : ["/pwa-192x192.png", "/pwa-192x192.png"]).map(
              (foto, index) => (
                <img key={index} src={foto} className="rounded-xl object-cover" />
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Assinaturas</h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-2">
                <strong>Cliente:</strong>
              </p>
              {assinaturaClienteDigital ? (
                <img
                  src={os.assinaturas?.cliente}
                  alt="Assinatura do cliente"
                  className="h-20 rounded-xl border border-slate-200 bg-white p-2"
                />
              ) : (
                <p>{os.assinaturas?.cliente || "Não coletada"}</p>
              )}
            </div>
            <div>
              <p className="mb-2">
                <strong>Técnico:</strong>
              </p>
              {assinaturaTecnicoDigital ? (
                <img
                  src={os.assinaturas?.tecnico}
                  alt="Assinatura do técnico"
                  className="h-20 rounded-xl border border-slate-200 bg-white p-2"
                />
              ) : (
                <p>{os.assinaturas?.tecnico || "Não coletada"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
        <p className="text-sm font-semibold text-brand-900">Compartilhamento com o dono</p>
        <p className="mt-1 text-sm text-brand-800">
          Ao finalizar a OS, este relatório já inclui automaticamente os dados da empresa para envio
          ao cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => navigate(`/os/${os.id}`)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </button>

        <button
          onClick={() => void compartilharComDono()}
          disabled={isSharing}
          className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSharing ? "Compartilhando..." : "Compartilhar com dono"}
        </button>

        <button
          onClick={gerarPDF}
          disabled={isGeneratingPdf}
          className="rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGeneratingPdf ? "Gerando..." : "Gerar PDF"}
        </button>
      </div>
    </div>
  );
}
