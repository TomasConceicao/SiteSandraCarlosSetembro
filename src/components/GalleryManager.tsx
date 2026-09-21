import React, { useRef } from 'react';
import { Upload, ArrowUp, ArrowDown, Trash2, Star } from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
}

interface GalleryManagerProps {
  coverImage: string;
  onCoverChange: (url: string) => void;
  images: string[];
  onChange: (images: string[]) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  coverImage,
  onCoverChange,
  images,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar ficheiros de imagem (múltiplos suportados)
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      alert('Por favor selecione ficheiros de imagem válidos.');
      return;
    }

    // Comprime as imagens para web (max 1600px, 80% qualidade) evitando payloads gigantes
    const compressFile = (file: File): Promise<string> => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let { width, height } = img;
            const maxDim = 1600;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            } else {
              resolve(e.target?.result as string);
            }
          };
          img.onerror = () => resolve(e.target?.result as string);
          img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    };

    Promise.all(fileList.map(compressFile)).then((newUrls) => {
      const valid = newUrls.filter(Boolean);
      // Se ainda não houver foto de capa, a primeira torna-se capa
      if (!coverImage && valid.length > 0) {
        onCoverChange(valid[0]);
        onChange([...images, ...valid.slice(1)]);
      } else {
        onChange([...images, ...valid]);
      }
    });
  };

  // Mover foto para cima na ordem
  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    onChange(next);
  };

  // Mover foto para baixo na ordem
  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    onChange(next);
  };

  // Remover foto secundária
  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Promover foto da galeria a Foto de Capa (e a antiga capa vai para a galeria)
  const setAsCover = (index: number) => {
    const target = images[index];
    const newImages = images.filter((_, i) => i !== index);
    if (coverImage) {
      newImages.unshift(coverImage);
    }
    onCoverChange(target);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* 1. Fotografia de Capa / Principal */}
      <div className="p-4 bg-stone-50 border border-stone-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-[#b87d1d] fill-[#b87d1d]" />
            <span className="text-xs uppercase tracking-wider font-bold text-[#36210f]">
              Fotografia de Capa (Principal do Imóvel) *
            </span>
          </div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider">
            Posição #1 de Destaque
          </span>
        </div>

        {coverImage ? (
          <div className="relative group border border-stone-300 bg-stone-900/5 max-h-48 overflow-hidden">
            {/* Contexto: Capa principal do imóvel selecionada no gestor de galeria do painel de administração */}
            <img
              src={coverImage}
              alt="Fotografia de Capa do Imóvel - Sandra Carlos Consultoria Imobiliária"
              className="w-full h-44 object-cover object-center"
              loading="lazy"
              width="400"
              height="176"
            />
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <label className="px-3 py-1.5 bg-white hover:bg-[#d8be9e] text-stone-900 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors">
                Trocar Capa
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onCoverChange(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }
                  }}
                />
              </label>
            </div>
            <div className="px-3 py-1 bg-white/95 border-t border-stone-200 text-[10px] font-mono text-stone-600 truncate">
              {coverImage.startsWith('data:') ? 'Imagem carregada' : coverImage}
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-stone-300 hover:border-[#36210f] bg-white p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors block text-center">
            <Upload size={20} className="text-stone-400" />
            <span className="text-xs font-semibold text-[#36210f]">
              Carregar Foto de Capa
            </span>
            <span className="text-[10px] text-stone-500">
              Esta fotografia surge nas listagens e no topo do detalhe
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const reader = new FileReader();
                  reader.onload = (ev) => onCoverChange(ev.target?.result as string);
                  reader.readAsDataURL(f);
                }
              }}
            />
          </label>
        )}
      </div>

      {/* 2. Fotografias Secundárias com Controlo de Ordem */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700">
              Galeria de Fotografias Adicionais ({images.length})
            </label>
            <p className="text-[11px] text-stone-500">
              Carregue as fotos e utilize as setas ▲ ▼ para reordenar a sequência de apresentação.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
          >
            <Upload size={13} />
            <span>Adicionar Fotos</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesAdded(e.target.files)}
          />
        </div>

        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 p-6 text-center bg-[#faf8f5] hover:border-stone-400 cursor-pointer"
          >
            <Upload size={20} className="mx-auto text-stone-400 mb-1" />
            <p className="text-xs text-stone-700 font-semibold">
              Nenhuma fotografia adicional na galeria
            </p>
            <p className="text-[11px] text-stone-500">
              Clique aqui para selecionar uma ou várias fotos do seu computador
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-300 overflow-hidden flex flex-col shadow-xs"
              >
                {/* Visualizador da Imagem */}
                <div className="relative h-28 bg-stone-100 overflow-hidden">
                  {/* Contexto: Fotografia secundária da galeria no painel de administração */}
                  <img
                    src={url}
                    alt={`Fotografia adicional #${idx + 2} da galeria do imóvel`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    width="280"
                    height="112"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-stone-900/80 text-white text-[10px] font-bold tracking-wider">
                    #{idx + 2}
                  </div>
                </div>

                {/* Barra de Ações e Ordem */}
                <div className="p-2 bg-[#faf8f5] border-t border-stone-200 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      className="p-1 text-stone-700 hover:text-[#36210f] hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveDown(idx)}
                      className="p-1 text-stone-700 hover:text-[#36210f] hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      className="text-[10px] uppercase font-semibold text-[#b87d1d] hover:text-[#36210f] px-1.5 py-0.5 hover:bg-stone-200 cursor-pointer"
                      title="Definir como foto de capa principal"
                    >
                      Tornar Capa
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                      title="Remover fotografia"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
