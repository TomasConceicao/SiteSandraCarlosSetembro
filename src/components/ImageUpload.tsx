import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { replaceImageInStorage, uploadImageToStorage } from '../lib/supabase';

interface ImageUploadProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  aspectHint?: string;
  folder?: 'properties' | 'site' | 'reviews';
}

/**
 * Componente de carregamento e substituição direta de imagens no Supabase Storage.
 * Também permite indicar um URL externo ou caminho estático da pasta /public.
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = 'https://... ou /imagem.webp',
  aspectHint,
  folder = 'site' as const,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um ficheiro de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      const res = value
        ? await replaceImageInStorage(value, file, folder)
        : await uploadImageToStorage(file, folder);

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setUploadError(
          res.error || 'Não foi possível carregar a imagem para o Supabase Storage.'
        );
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Erro ao carregar a imagem para o Storage.'
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-1.5" id={id}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700">
            {label}
          </label>
          {aspectHint && (
            <span className="text-[10px] text-stone-500 font-sans tracking-tight">
              {aspectHint}
            </span>
          )}
        </div>
      )}

      {uploadError && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-1.5">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {value ? (
        <div className="relative group border border-stone-300 bg-stone-100 overflow-hidden">
          <img
            src={value}
            alt="Pré-visualização da imagem selecionada"
            className="w-full h-40 object-cover object-center block"
            loading="lazy"
            width={320}
            height={160}
          />
          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white text-stone-900 text-[11px] font-semibold uppercase tracking-wider hover:bg-[#d8be9e] transition-colors cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? 'A enviar...' : 'Trocar no Storage'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              title="Limpar imagem"
            >
              <X size={15} />
            </button>
          </div>
          <div className="px-2 py-1 bg-white/95 border-t border-stone-200 text-[10px] text-stone-600 truncate font-mono flex items-center justify-between">
            <span className="truncate">{value}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-[#36210f] bg-stone-100'
              : 'border-stone-300 bg-[#faf8f5] hover:border-stone-400'
          }`}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-600">
              {isProcessing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
            </div>
            <span className="text-xs font-semibold text-[#36210f]">
              {isProcessing
                ? 'A otimizar e carregar para Supabase Storage...'
                : 'Clique para enviar para Supabase Storage'}
            </span>
            <span className="text-[10px] text-stone-500">
              ou arraste o ficheiro para aqui (JPG, PNG, WebP)
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          className="hover:text-[#36210f] underline flex items-center gap-1 cursor-pointer"
        >
          {mode === 'upload' ? (
            <>
              <LinkIcon size={12} />
              <span>Ou inserir URL / caminho /public</span>
            </>
          ) : (
            <>
              <ImageIcon size={12} />
              <span>Voltar ao upload Supabase Storage</span>
            </>
          )}
        </button>
      </div>

      {mode === 'url' && (
        <div className="pt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-[#36210f]"
          />
        </div>
      )}
    </div>
  );
};
