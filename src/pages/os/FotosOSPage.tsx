import { useState } from "react";
import type { ChangeEvent } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOSStore } from "../../store/osStore";

type PhotoItem = {
  id: string;
  name: string;
  type: string;
  preview: string;
};

const photoTypes = [
  "Equipamento",
  "Painel elétrico",
  "Defeito encontrado",
  "Serviço executado",
  "Peça trocada",
  "Segurança"
];

export function FotosOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const os = useOSStore((state) => state.getOrderById(id));
  const updateOrder = useOSStore((state) => state.updateOrder);

  const [photos, setPhotos] = useState<PhotoItem[]>(
    (os?.fotos ?? []).map((foto, index) => ({
      id: `${index}-${foto}`,
      name: `foto-${index + 1}.jpg`,
      type: "Equipamento",
      preview: foto
    }))
  );
  const [selectedType, setSelectedType] = useState<string>(photoTypes[0]);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const handleAddPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoItem[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: selectedType,
      preview: URL.createObjectURL(file)
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    event.target.value = "";
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleSave = async () => {
    await updateOrder(os.id, {
      fotos: photos.map((photo) => photo.preview)
    });

    alert("Fotos salvas com sucesso.");
    navigate(`/os/${os.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">OS #{os.id}</p>
        <h1 className="text-2xl font-bold text-slate-900">Fotos da OS</h1>
        <p className="mt-1 text-sm text-slate-500">{os.titulo}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Adicionar fotos</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo da foto</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              {photoTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-4 py-8 text-center hover:border-brand-500">
            <div>
              <p className="font-medium text-slate-700">Selecionar ou tirar fotos</p>
              <p className="mt-1 text-sm text-slate-500">
                Clique aqui para anexar imagens da manutenção
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleAddPhotos}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Fotos anexadas</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {photos.length} foto(s)
          </span>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma foto adicionada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border border-slate-200 p-2">
                <img
                  src={photo.preview}
                  alt={photo.name}
                  className="h-32 w-full rounded-xl object-cover"
                />

                <div className="mt-2 space-y-1">
                  <p className="truncate text-sm font-medium text-slate-800">{photo.name}</p>
                  <p className="text-xs text-slate-500">{photo.type}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="mt-3 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          Salvar fotos
        </button>
      </div>
    </div>
  );
}
