import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOSStore } from "../../store/osStore";

type SignaturePadProps = {
  value: string;
  label: string;
  onChange: (nextValue: string) => void;
};

function SignaturePad({ value, label, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#0f172a";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (!value.startsWith("data:image")) return;

    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  const getPosition = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const position = getPosition(event);
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const position = getPosition(event);
    context.lineTo(position.x, position.y);
    context.stroke();
  };

  const commitDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawingRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    context.closePath();
    commitDrawing();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{label}</h2>
      <canvas
        ref={canvasRef}
        width={1000}
        height={280}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-xl border border-slate-300 bg-white"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={clearSignature}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
        >
          Limpar assinatura
        </button>
      </div>
    </div>
  );
}

export function AssinaturaOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const updateOrder = useOSStore((state) => state.updateOrder);
  const os = useOSStore((state) => state.getOrderById(id));

  const [cliente, setCliente] = useState("");
  const [tecnico, setTecnico] = useState("");

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  useEffect(() => {
    if (!os) return;
    setCliente(os.assinaturas?.cliente ?? "");
    setTecnico(os.assinaturas?.tecnico ?? "");
  }, [os]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Assinaturas OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateOrder(os.id, {
      assinaturas: {
        cliente,
        tecnico
      }
    });

    alert("Assinaturas salvas com sucesso.");
    navigate(`/os/${os.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">OS #{os.id}</p>
        <h1 className="text-2xl font-bold text-slate-900">Assinaturas</h1>
        <p className="mt-1 text-sm text-slate-500">{os.titulo}</p>
      </div>

      <SignaturePad
        value={cliente}
        onChange={setCliente}
        label="Assinatura digital do cliente"
      />

      <SignaturePad
        value={tecnico}
        onChange={setTecnico}
        label="Assinatura digital do técnico"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(`/os/${os.id}`)}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-brand-700 px-4 py-3 font-medium text-white"
        >
          Salvar assinaturas
        </button>
      </div>
    </div>
  );
}
