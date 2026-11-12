import React, { useRef, useState } from 'react';
import {
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  deleteStorageImage,
  extractStoragePathFromPublicUrl,
  replaceImageInStorage,
  uploadImageToStorage,
} from '../lib/supabase';

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
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCoverFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um ficheiro de imagem válido.');
      return;
    }

    setUploadError(null);
    setIsUploadingCover(true);
    const res = coverImage
      ? await replaceImageInStorage(coverImage, file, 'properties')
      : await uploadImageToStorage(file, 'properties');
    setIsUploadingCover(false);

    if (res.success && res.url) {
      onCoverChange(res.url);
    } else {
      setUploadError(res.error || 'Erro ao carregar fotografia de capa.');
    }
  };

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      setUploadError('Por favor selecione ficheiros de imagem válidos.');
      return;
    }

    setUploadError(null);
    setIsUploadingGallery(true);

    const uploadedUrls: string[] = [];
    for (const file of fileList) {
      const res = await uploadImageToStorage(file, 'properties');
      if (res.success && res.url) {
        uploadedUrls.push(res.url);
      } else if (res.error) {
        setUploadError(res.error);
      }
    }

    setIsUploadingGallery(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (uploadedUrls.length > 0) {
      if (!coverImage) {
        onCoverChange(uploadedUrls[0]);
        onChange([...images, ...uploadedUrls.slice(1)]);
      } else {
        onChange([...images, ...uploadedUrls]);
      }
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    onChange(next);
  };

  const removeImage = async (index: number) => {
    const targetUrl = images[index];
    onChange(images.filter((_, i) => i !== index));
    const storagePath = extractStoragePathFromPublicUrl(targetUrl);
    if (storagePath) {
      await deleteStorageImage(storagePath);
    }
  };

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
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 1. Fotografia de Capa / Principal */}
      <div className="p-4 bg-stone-50 border border-stone-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-[#b87d1d] fill-[#b87d1d]" />
            <span className="text-xs uppercase tracking-wider font-bold text-[#36210f]">
              Fotografia de Capa (Supabase Storage) *
            </span>
          </div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider">
            Posição #1 de Destaque
          </span>
        </div>

        {coverImage ? (
          <div className="relative group border border-stone-300 bg-stone-900/5 max-h-48 overflow-hidden">
            <img
              src={coverImage}
              alt="Fotografia de Capa do Imóvel - Sandra Carlos Consultoria Imobiliária"
              className="w-full h-44 object-cover object-center"
              loading="lazy"
              width={400}
              height={176}
            />
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <label className="px-3 py-1.5 bg-white hover:bg-[#d8be9e] text-stone-900 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors">
                {isUploadingCover ? 'A carregar...' : 'Trocar Capa'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingCover}
                  className="hidden"
                  onChange={(e) => handleCoverFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="px-3 py-1 bg-white/95 border-t border-stone-200 text-[10px] font-mono text-stone-600 truncate">
              {coverImage}
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-stone-300 hover:border-[#36210f] bg-white p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors block text-center">
            {isUploadingCover ? (
              <Loader2 size={20} className="text-[#36210f] animate-spin" />
            ) : (
              <Upload size={20} className="text-stone-400" />
            )}
            <span className="text-xs font-semibold text-[#36210f]">
              {isUploadingCover
                ? 'A enviar capa para o Supabase Storage...'
                : 'Carregar Foto de Capa'}
            </span>
            <span className="text-[10px] text-stone-500">
              Guardada automaticamente no bucket site-images
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingCover}
              className="hidden"
              onChange={(e) => handleCoverFile(e.target.files?.[0])}
            />
          </label>
        )}

        <div className="mt-2">
          <input
            type="text"
            value={coverImage}
            onChange={(e) => onCoverChange(e.target.value)}
            placeholder="Ou cole o URL público da imagem"
            className="w-full px-3 py-1.5 bg-white border border-stone-300 text-[11px] font-mono text-stone-800 focus:outline-none focus:border-[#36210f]"
          />
        </div>
      </div>

      {/* 2. Fotografias Secundárias com Controlo de Ordem */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700">
              Galeria de Fotografias Adicionais ({images.length})
            </label>
            <p className="text-[11px] text-stone-500">
              Carregue fotos para o Supabase Storage e reordene com as setas.
            </p>
          </div>

          <button
            type="button"
            disabled={isUploadingGallery}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {isUploadingGallery ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            <span>{isUploadingGallery ? 'A enviar...' : 'Adicionar Fotos'}</span>
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
            onClick={() => !isUploadingGallery && fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 p-6 text-center bg-[#faf8f5] hover:border-stone-400 cursor-pointer"
          >
            <Upload size={20} className="mx-auto text-stone-400 mb-1" />
            <p className="text-xs text-stone-700 font-semibold">
              Nenhuma fotografia adicional na galeria
            </p>
            <p className="text-[11px] text-stone-500">
              Clique aqui para enviar uma ou várias fotos para o Supabase Storage
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="bg-white border border-stone-300 overflow-hidden flex flex-col shadow-xs"
              >
                <div className="relative h-28 bg-stone-100 overflow-hidden">
                  <img
                    src={url}
                    alt={`Fotografia adicional #${idx + 2} da galeria do imóvel`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    width={280}
                    height={112}
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-stone-900/80 text-white text-[10px] font-bold tracking-wider">
                    #{idx + 2}
                  </div>
                </div>

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
