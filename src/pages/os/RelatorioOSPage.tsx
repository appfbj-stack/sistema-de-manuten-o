import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate, useParams } from "react-router-dom";
import { useOSStore } from "../../store/osStore";

export function RelatorioOSPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const os = useOSStore((state) => state.getOrderById(id));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  return (
    <div className="space-y-4">
      <div ref={reportRef} className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Relatório OS #{os.id}</p>
          <h1 className="text-2xl font-bold text-slate-900">{os.titulo}</h1>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Informações do serviço</h2>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Cliente:</strong> {os.cliente}
            </p>
            <p>
              <strong>Equipamento:</strong> {os.equipamento}
            </p>
            <p>
              <strong>Técnico:</strong> {os.tecnico}
            </p>
            <p>
              <strong>Data:</strong> {os.dataAgendada}
            </p>
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
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Observações técnicas</h2>

          <p className="text-sm text-slate-600 leading-6">
            {os.observacoes || "Sem observações."}
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
            <p>
              <strong>Cliente:</strong> {os.assinaturas?.cliente || "Não coletada"}
            </p>
            <p>
              <strong>Técnico:</strong> {os.assinaturas?.tecnico || "Não coletada"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/os/${os.id}`)}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
        >
          Voltar
        </button>

        <button
          onClick={gerarPDF}
          disabled={isGeneratingPdf}
          className="flex-1 rounded-xl bg-brand-700 px-4 py-3 text-white"
        >
          {isGeneratingPdf ? "Gerando..." : "Gerar PDF"}
        </button>
      </div>
    </div>
  );
}
