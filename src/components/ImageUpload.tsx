import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  aspectHint?: string;
}

/**
 * Redimensiona e comprime uma imagem no cliente (Canvas) para WebP/JPEG de alta qualidade,
 * garantindo carregamento ultrarrápido e sem exceder a quota do navegador.
 */
function compressImage(file: File, maxDim = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
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
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Gera JPEG de boa qualidade
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Componente que permite:
 * 1. Fazer UPLOAD direto de ficheiro de imagem com compressão automática
 * 2. Inserir ou editar URL / caminho em /public
 * 3. Pré-visualizar instantaneamente a fotografia
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = 'https://... ou clique para carregar',
  aspectHint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      const optimizedDataUrl = await compressImage(file, 1920, 0.85);
      onChange(optimizedDataUrl);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      // Fallback para leitura direta
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) onChange(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
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

      {/* Preview se já existir imagem */}
      {value ? (
        <div className="relative group border border-stone-300 bg-stone-100 overflow-hidden rounded-xs">
          {/* Contexto: Imagem carregada em pré-visualização no componente de upload */}
          <img
            src={value}
            alt="Pré-visualização do ficheiro de imagem selecionado"
            className="w-full h-40 object-cover object-center block"
            loading="lazy"
            width="320"
            height="160"
          />
          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white text-stone-900 text-[11px] font-semibold uppercase tracking-wider hover:bg-[#d8be9e] transition-colors cursor-pointer"
            >
              {isProcessing ? 'A carregar...' : 'Trocar Foto'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              title="Remover imagem"
            >
              <X size={15} />
            </button>
          </div>
          <div className="px-2 py-1 bg-white/90 border-t border-stone-200 text-[10px] text-stone-600 truncate font-mono flex items-center justify-between">
            <span className="truncate">
              {value.startsWith('data:') ? 'Imagem carregada (Upload direto)' : value}
            </span>
            {value.startsWith('/public') || value.startsWith('/') && !value.startsWith('data:') && (
              <span className="text-[9px] bg-stone-200 px-1 py-0.2 uppercase font-semibold text-stone-700 shrink-0 ml-1">
                Ficheiro /public
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Zona de Carregamento / Upload */
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
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-600">
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            </div>
            <span className="text-xs font-semibold text-[#36210f]">
              {isProcessing ? 'A otimizar e carregar fotografia...' : 'Clique para carregar fotografia'}
            </span>
            <span className="text-[10px] text-stone-500">
              ou arraste o ficheiro para aqui (JPG, PNG, WebP)
            </span>
          </div>
        </div>
      )}

      {/* Input oculto de ficheiro */}
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

      {/* Alternar opcionalmente para modo URL */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          className="hover:text-[#36210f] underline flex items-center gap-1 cursor-pointer"
        >
          {mode === 'upload' ? (
            <>
              <LinkIcon size={12} />
              <span>Ou inserir caminho do ficheiro (ex: /pagina_imoveis_2.png)</span>
            </>
          ) : (
            <>
              <ImageIcon size={12} />
              <span>Voltar ao upload direto</span>
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
