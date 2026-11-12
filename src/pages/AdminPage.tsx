import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import {
  Property,
  Testimonial,
  PageType,
  LocationPrecision,
  SiteSettings,
} from '../types';
import {
  isSupabaseConfigured,
  seedPropertiesToSupabase,
  seedReviewsToSupabase,
  listStorageImages,
  uploadImageToStorage,
  deleteStorageImage,
  StorageFileItem,
  STORAGE_BUCKET,
} from '../lib/supabase';
import { DEFAULT_SITE_PHOTOS, DEFAULT_SITE_SETTINGS } from '../data/siteSettings';
import { PUBLIC_FOLDER_PHOTOS } from '../utils/bannersManager';
import {
  Building2,
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Database,
  Eye,
  Star,
  Info,
  Copy,
  Check,
  Save,
  X,
  Image as ImageIcon,
  RotateCcw,
  FileText,
  ShieldCheck,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { GalleryManager } from '../components/GalleryManager';
import { PredefinedFeaturesForm } from '../components/PredefinedFeaturesForm';
import { ImageUpload } from '../components/ImageUpload';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
  onSelectProperty: (property: Property) => void;
}

type AdminTab = 'properties' | 'settings' | 'photos' | 'reviews' | 'supabase';
type StorageFolder = 'properties' | 'site' | 'reviews';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onSelectProperty }) => {
  const {
    properties,
    reviews,
    siteSettings,
    user,
    aal,
    isAuthenticated,
    isSupabaseReady,
    logout,
    saveProperty,
    removeProperty,
    saveReview,
    removeReview,
    saveSiteSettings,
    toggleFeaturedProperty,
    refresh,
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>('properties');

  // Estado do formulário de imóvel
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [predefinedValues, setPredefinedValues] = useState<Record<string, string>>({});
  const [mapLat, setMapLat] = useState('');
  const [mapLng, setMapLng] = useState('');
  const [mapPrecision, setMapPrecision] = useState<LocationPrecision>('exata');
  const [mapCircleRadius, setMapCircleRadius] = useState('380');
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Estado do formulário de testemunho
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<Partial<Testimonial>>({});
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Estado local editável de textos, configurações e fotos do site
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings>(siteSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Estado do gestor direto de ficheiros do Supabase Storage
  const [storageFolder, setStorageFolder] = useState<StorageFolder>('properties');
  const [storageFiles, setStorageFiles] = useState<StorageFileItem[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [isUploadingToBucket, setIsUploadingToBucket] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Confirmação inline para eliminações (evita window.confirm em iframe)
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'property' | 'review' | 'storage';
    id: string;
    label: string;
  } | null>(null);

  // Notificação flutuante
  const [actionNotice, setActionNotice] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setSettingsDraft(siteSettings);
  }, [siteSettings]);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4500);
  };

  const loadStorageBucketFiles = useCallback(async (folder: StorageFolder) => {
    setIsLoadingStorage(true);
    const res = await listStorageImages(folder);
    setStorageFiles(res.files);
    if (res.error) {
      showNotice(`Erro ao listar imagens do Storage: ${res.error}`, 'error');
    }
    setIsLoadingStorage(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'photos' && isAuthenticated && aal === 'aal2') {
      loadStorageBucketFiles(storageFolder);
    }
  }, [activeTab, storageFolder, isAuthenticated, aal, loadStorageBucketFiles]);

  // Proteção adicional ao nível do componente: só renderiza com sessão AAL2 válida
  if (!isAuthenticated || aal !== 'aal2') {
    return null;
  }

  const featuredIds = siteSettings.featuredIds || [];

  // ==========================================
  // HANDLERS DE IMÓVEIS
  // ==========================================

  const openNewPropertyModal = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      title: '',
      typology: '',
      price: '',
      area: '',
      location: 'Pombal, Portugal',
      year: new Date().getFullYear().toString(),
      energyCertificate: 'A',
      image: '',
      description: '',
      videoUrl: '',
      videoThumbnail: '',
      bedrooms: undefined,
      bathrooms: undefined,
      status: 'none',
      statusLabel: '',
    });
    setGalleryImages([]);
    setPredefinedValues({});
    setMapLat('39.9167');
    setMapLng('-8.6283');
    setMapPrecision('exata');
    setMapCircleRadius('380');
    setIsEditingProperty(true);
  };

  const openEditPropertyModal = (p: Property) => {
    setEditingPropertyId(p.id);
    setPropertyForm({ ...p });
    setGalleryImages(p.secondaryImages || []);

    const mapped: Record<string, string> = {};
    const allFeatures = [
      ...(p.interiorFeatures || []),
      ...(p.exteriorFeatures || []),
      ...(p.detailsFeatures || []),
      ...(p.financialDetails || []),
    ];
    allFeatures.forEach((f) => {
      if (f.label && f.value) {
        mapped[f.label] = f.value;
      }
    });

    if (p.bedrooms && !mapped['Total de Quartos']) mapped['Total de Quartos'] = String(p.bedrooms);
    if (p.bathrooms && !mapped['Casas de Banho']) mapped['Casas de Banho'] = String(p.bathrooms);
    if (p.area && !mapped['Área Útil']) mapped['Área Útil'] = p.area;
    if (p.year && !mapped['Ano de Construção']) mapped['Ano de Construção'] = p.year;
    if (p.price && !mapped['Preço Pretendido']) mapped['Preço Pretendido'] = p.price;
    if (p.energyCertificate && !mapped['Certificação Energética']) {
      mapped['Certificação Energética'] = p.energyCertificate;
    }

    setPredefinedValues(mapped);
    setMapLat(p.mapCoordinates?.lat !== undefined ? String(p.mapCoordinates.lat) : '');
    setMapLng(p.mapCoordinates?.lng !== undefined ? String(p.mapCoordinates.lng) : '');
    setMapPrecision(p.mapCoordinates?.precision || p.locationPrecision || 'exata');
    setMapCircleRadius(
      p.mapCoordinates?.circleRadius !== undefined
        ? String(p.mapCoordinates.circleRadius)
        : '380'
    );
    setIsEditingProperty(true);
  };

  const handleFeatureValueChange = (label: string, value: string) => {
    setPredefinedValues((prev) => ({ ...prev, [label]: value }));
  };

  const handleSavePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyForm.title?.trim() || !propertyForm.image?.trim()) {
      showNotice('O título e a fotografia principal são obrigatórios.', 'error');
      return;
    }

    const interiorLabels = [
      'Total de Quartos',
      'Suítes',
      'Casas de Banho',
      'Cozinha',
      'Climatização',
      'Sala de Estar',
      'Roupeiros Embutidos',
      'Caixilharia / Janelas',
    ];
    const exteriorLabels = [
      'Garagem / Estacionamento',
      'Piscina',
      'Jardim / Espaço Exterior',
      'Barbecue / Churrasqueira',
      'Varandas / Terraços',
      'Portões / Vedações',
    ];
    const detailsLabels = [
      'Área Útil',
      'Área Bruta de Construção',
      'Área Total do Lote',
      'Ano de Construção',
      'Estado de Conservação',
      'Exposição Solar',
      'Painéis Solares / Energia',
      'Certificação Energética',
    ];
    const financialLabels = [
      'Preço Pretendido',
      'Condição do Negócio',
      'Quota de Condomínio',
      'IMI Estimado Anual',
    ];

    const buildCategory = (labels: string[]) =>
      labels
        .filter((lbl) => Boolean(predefinedValues[lbl]?.trim()))
        .map((lbl) => ({ label: lbl, value: predefinedValues[lbl].trim() }));

    const interiorFeatures = buildCategory(interiorLabels);
    const exteriorFeatures = buildCategory(exteriorLabels);
    const detailsFeatures = buildCategory(detailsLabels);
    const financialDetails = buildCategory(financialLabels);

    const latNum = parseFloat(mapLat);
    const lngNum = parseFloat(mapLng);
    const radiusNum = parseFloat(mapCircleRadius);
    const mapCoordinates =
      !isNaN(latNum) && !isNaN(lngNum)
        ? {
            lat: latNum,
            lng: lngNum,
            precision: mapPrecision,
            circleRadius: !isNaN(radiusNum) && radiusNum > 0 ? radiusNum : 380,
          }
        : undefined;

    const parsedBedrooms = predefinedValues['Total de Quartos']
      ? parseInt(predefinedValues['Total de Quartos'].replace(/\D/g, ''), 10) || undefined
      : propertyForm.bedrooms;
    const parsedBathrooms = predefinedValues['Casas de Banho']
      ? parseInt(predefinedValues['Casas de Banho'].replace(/\D/g, ''), 10) || undefined
      : propertyForm.bathrooms;

    const propertyToSave: Property = {
      id: editingPropertyId || `prop_${Date.now()}`,
      title: propertyForm.title.trim(),
      typology: propertyForm.typology?.trim() || '',
      price: propertyForm.price?.trim() || predefinedValues['Preço Pretendido'] || '',
      area: propertyForm.area?.trim() || predefinedValues['Área Útil'] || '',
      location: propertyForm.location?.trim() || 'Pombal, Portugal',
      year: propertyForm.year?.trim() || predefinedValues['Ano de Construção'] || '',
      energyCertificate:
        propertyForm.energyCertificate?.trim() ||
        predefinedValues['Certificação Energética'] ||
        '',
      image: propertyForm.image.trim(),
      secondaryImages: galleryImages,
      description: propertyForm.description?.trim() || '',
      videoUrl: propertyForm.videoUrl?.trim() || '',
      videoThumbnail: propertyForm.videoThumbnail?.trim() || '',
      bedrooms: parsedBedrooms,
      bathrooms: parsedBathrooms,
      status: propertyForm.status || 'none',
      statusLabel: propertyForm.statusLabel?.trim() || '',
      interiorFeatures: interiorFeatures.length > 0 ? interiorFeatures : undefined,
      exteriorFeatures: exteriorFeatures.length > 0 ? exteriorFeatures : undefined,
      detailsFeatures: detailsFeatures.length > 0 ? detailsFeatures : undefined,
      financialDetails: financialDetails.length > 0 ? financialDetails : undefined,
      locationPrecision: mapPrecision,
      mapCoordinates,
    };

    setIsSavingProperty(true);
    const res = await saveProperty(propertyToSave);
    setIsSavingProperty(false);

    if (res.success) {
      showNotice(
        editingPropertyId
          ? 'Imóvel atualizado no Supabase com sucesso!'
          : 'Novo imóvel publicado no Supabase com sucesso!'
      );
      setIsEditingProperty(false);
    } else {
      showNotice(
        `Erro ao guardar o imóvel: ${res.error || 'Verifique as políticas RLS AAL2 no Supabase.'}`,
        'error'
      );
    }
  };

  // ==========================================
  // HANDLERS DE TESTEMUNHOS
  // ==========================================

  const openNewReviewModal = () => {
    setEditingReviewId(null);
    setReviewForm({
      name: '',
      role: 'Cliente',
      text: '',
      image: '',
    });
    setIsEditingReview(true);
  };

  const openEditReviewModal = (r: Testimonial) => {
    setEditingReviewId(r.id);
    setReviewForm({ ...r });
    setIsEditingReview(true);
  };

  const handleSaveReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name?.trim() || !reviewForm.text?.trim()) {
      showNotice('O nome e o testemunho são obrigatórios.', 'error');
      return;
    }

    const reviewToSave: Testimonial = {
      id: editingReviewId || `rev_${Date.now()}`,
      name: reviewForm.name.trim(),
      role: reviewForm.role?.trim() || 'Cliente',
      text: reviewForm.text.trim(),
      image: reviewForm.image?.trim() || undefined,
    };

    setIsSavingReview(true);
    const res = await saveReview(reviewToSave);
    setIsSavingReview(false);

    if (res.success) {
      showNotice(
        editingReviewId
          ? 'Testemunho atualizado no Supabase!'
          : 'Novo testemunho adicionado ao Supabase!'
      );
      setIsEditingReview(false);
    } else {
      showNotice(
        `Erro ao guardar o testemunho: ${res.error || 'Verifique as políticas RLS AAL2.'}`,
        'error'
      );
    }
  };

  // ==========================================
  // CONFIRMAÇÃO DE ELIMINAÇÃO
  // ==========================================

  const executePendingDelete = async () => {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    setPendingDelete(null);

    if (type === 'property') {
      const res = await removeProperty(id);
      if (res.success) {
        showNotice('Imóvel eliminado do Supabase!');
      } else {
        showNotice(`Erro ao eliminar imóvel: ${res.error || 'Sem permissão.'}`, 'error');
      }
    } else if (type === 'review') {
      const res = await removeReview(id);
      if (res.success) {
        showNotice('Testemunho eliminado do Supabase!');
      } else {
        showNotice(`Erro ao eliminar testemunho: ${res.error || 'Sem permissão.'}`, 'error');
      }
    } else if (type === 'storage') {
      const res = await deleteStorageImage(id);
      if (res.success) {
        showNotice('Imagem removida do Supabase Storage!');
        loadStorageBucketFiles(storageFolder);
      } else {
        showNotice(`Erro ao apagar imagem: ${res.error || 'Sem permissão.'}`, 'error');
      }
    }
  };

  // ==========================================
  // TEXTOS, CONFIGURAÇÕES & FOTOS NO SUPABASE
  // ==========================================

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    const res = await saveSiteSettings(settingsDraft);
    setIsSavingSettings(false);
    if (res.success) {
      showNotice('Textos, configurações e fotos guardados no Supabase!');
    } else {
      showNotice(
        `Erro ao guardar configurações: ${res.error || 'Verifique as políticas RLS AAL2.'}`,
        'error'
      );
    }
  };

  const handleResetTextsAndConfig = async () => {
    const resetDraft: SiteSettings = {
      ...settingsDraft,
      texts: DEFAULT_SITE_SETTINGS.texts,
      config: DEFAULT_SITE_SETTINGS.config,
    };
    setSettingsDraft(resetDraft);
    setIsSavingSettings(true);
    const res = await saveSiteSettings(resetDraft);
    setIsSavingSettings(false);
    if (res.success) {
      showNotice('Textos e configurações repostos para os valores originais.');
    } else {
      showNotice(res.error || 'Erro ao repor configurações.', 'error');
    }
  };

  const handleResetSitePhotos = async () => {
    const resetDraft: SiteSettings = {
      ...settingsDraft,
      photos: DEFAULT_SITE_PHOTOS,
    };
    setSettingsDraft(resetDraft);
    setIsSavingSettings(true);
    const res = await saveSiteSettings(resetDraft);
    setIsSavingSettings(false);
    if (res.success) {
      showNotice('Fotos principais repostas para os ficheiros originais em /public.');
    } else {
      showNotice(res.error || 'Erro ao repor fotos.', 'error');
    }
  };

  const handleDirectBucketUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingToBucket(true);
    let uploadedCount = 0;
    let lastError: string | undefined;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const res = await uploadImageToStorage(file, storageFolder);
      if (res.success) uploadedCount++;
      else lastError = res.error;
    }

    setIsUploadingToBucket(false);
    if (uploadedCount > 0) {
      showNotice(`${uploadedCount} imagem(ns) carregada(s) no Supabase Storage!`);
      loadStorageBucketFiles(storageFolder);
    } else if (lastError) {
      showNotice(`Erro no upload: ${lastError}`, 'error');
    }
  };

  const handleSeedToSupabase = async () => {
    setIsSeeding(true);
    const resProp = await seedPropertiesToSupabase();
    const resRev = await seedReviewsToSupabase();
    const resSet = await saveSiteSettings(siteSettings);
    setIsSeeding(false);

    if (resProp.error || resRev.error || !resSet.success) {
      const err = resProp.error || resRev.error || resSet.error;
      showNotice(`Erro ao sincronizar: ${err || 'Verifique o SQL e permissões AAL2.'}`, 'error');
    } else {
      showNotice(
        `Sincronizados ${resProp.count} imóveis, ${resRev.count} testemunhos e configurações do site!`
      );
    }
    refresh();
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-28">
      {/* Top Header Bar */}
      <header className="bg-[#36210f] text-white px-6 sm:px-10 py-4 border-b border-[#5c3403]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d8be9e] text-[#36210f] flex items-center justify-center font-serif font-bold text-sm">
              SC
            </div>
            <div>
              <h1 className="font-sans text-base sm:text-lg font-bold uppercase tracking-[0.14em] text-white">
                Painel Administrativo
              </h1>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#d8be9e]">
                {user?.email} &middot; Sessão 2FA (AAL2)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-white/10 hover:bg-white/20 text-[#d8be9e] hover:text-white transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>Ver Site</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                onNavigate('login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-red-900/60 hover:bg-red-800 text-red-100 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 shadow-lg flex items-center gap-2.5 text-xs font-sans font-semibold tracking-wide text-white ${
              actionNotice.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'
            }`}
          >
            {actionNotice.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{actionNotice.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Eliminação */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-[#d8be9e] shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <h3 className="font-sans text-base font-bold uppercase tracking-wider text-[#36210f]">
                Confirmar Eliminação
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Tem a certeza que pretende eliminar permanentemente{' '}
                <strong>{pendingDelete.label}</strong>? Esta ação será executada diretamente no Supabase.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executePendingDelete}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-8">
        {/* Banner de Estado */}
        <div className="mb-8 p-4 bg-white border border-[#d8be9e]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
            <div>
              <div className="font-sans text-xs uppercase tracking-wider font-bold text-stone-900">
                {isSupabaseReady
                  ? 'Ligado ao Supabase (Acesso AAL2 Verificado)'
                  : 'Supabase não configurado nas variáveis de ambiente'}
              </div>
              <div className="text-xs text-stone-500">
                O site público apenas lê dados. Alterações nesta área exigem autenticação TOTP AAL2.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tabular-nums px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700">
              {properties.length} Imóveis &middot; {reviews.length} Testemunhos
            </span>
            <button
              type="button"
              onClick={refresh}
              className="text-xs uppercase tracking-wider font-semibold text-[#36210f] hover:text-[#b87d1d] underline cursor-pointer"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-300/80 mb-8 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'properties'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building2 size={15} />
            <span>Imóveis ({properties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={15} />
            <span>Textos & Configurações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'photos'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon size={15} />
            <span>Imagens (Storage)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'reviews'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquareQuote size={15} />
            <span>Testemunhos ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'supabase'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database size={15} />
            <span>Base de Dados</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: GESTÃO DE IMÓVEIS
           ============================================================ */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                  Catálogo de Imóveis
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Crie, edite ou apague imóveis. A estrela destaca o imóvel na página inicial.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewPropertyModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              >
                <Plus size={16} />
                <span>Adicionar Imóvel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const isFeatured = featuredIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-stone-200 overflow-hidden flex flex-col hover:border-[#d8be9e] transition-all"
                  >
                    <div className="relative h-48 bg-stone-100 overflow-hidden">
                      <img
                        src={p.image}
                        alt={`Sandra Carlos Consultoria Imobiliária - ${p.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={380}
                        height={192}
                      />
                      {p.status && p.status !== 'none' && (
                        <div className="absolute top-3 left-3 bg-[#36210f]/90 text-white text-[10px] font-sans uppercase tracking-[0.2em] px-2.5 py-1 font-semibold">
                          {p.statusLabel || p.status.toUpperCase()}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          const res = await toggleFeaturedProperty(p.id);
                          if (res.success) {
                            showNotice(
                              isFeatured
                                ? 'Imóvel removido dos destaques da Home.'
                                : 'Imóvel adicionado aos destaques da Home!'
                            );
                          } else if (res.error) {
                            showNotice(res.error, 'error');
                          }
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors cursor-pointer ${
                          isFeatured
                            ? 'bg-[#b87d1d] text-white'
                            : 'bg-black/45 hover:bg-black/70 text-white/85'
                        }`}
                        title={isFeatured ? 'Destacado na Home' : 'Destacar na Home'}
                      >
                        <Star size={14} className={isFeatured ? 'fill-white' : ''} />
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-stone-500 uppercase tracking-wider mb-1">
                          <span>{p.typology || 'Imóvel'}</span>
                          <span>{p.location}</span>
                        </div>
                        <h3 className="font-sans font-semibold text-sm text-stone-900 line-clamp-1 mb-2">
                          {p.title}
                        </h3>
                        <div className="font-sans font-bold text-base text-[#36210f] mb-3 tabular-nums">
                          {p.price ? (
                            p.price
                          ) : (
                            <span className="text-xs font-normal text-stone-500">
                              Preço sob consulta
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                          <span>{p.area || '—'}</span>
                          <span>&middot;</span>
                          <span>{p.bedrooms ? `${p.bedrooms} Quartos` : '—'}</span>
                          <span>&middot;</span>
                          <span>{p.secondaryImages?.length || 0} Fotos extras</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProperty(p);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-[#36210f] font-semibold cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Pré-visualizar</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPropertyModal(p)}
                            className="p-1.5 text-stone-600 hover:text-[#36210f] hover:bg-stone-100 cursor-pointer"
                            title="Editar Imóvel"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                type: 'property',
                                id: p.id,
                                label: p.title,
                              })
                            }
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                            title="Eliminar Imóvel"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: TEXTOS E CONFIGURAÇÕES DO SITE
           ============================================================ */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                    Textos e Configurações do Site
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Edite os textos editoriais das páginas e os dados institucionais de contacto guardados no Supabase.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetTextsAndConfig}
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-stone-300"
                  >
                    <RotateCcw size={13} />
                    <span>Repor Originais</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Save size={14} />
                    <span>{isSavingSettings ? 'A guardar...' : 'Guardar Alterações'}</span>
                  </button>
                </div>
              </div>

              {/* Bloco A: Configurações Gerais e Contactos */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-2 mb-4">
                  1. Configurações Gerais & Contactos Oficiais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Nome da Marca
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.brandName}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, brandName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Nome da Consultora
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.consultantName}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, consultantName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Licença AMI
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.amiLicense}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, amiLicense: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Telefone (Visualização)
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.phoneDisplay}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, phoneDisplay: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      WhatsApp (apenas dígitos, ex: 351965881547)
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.whatsappNumber}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: {
                            ...settingsDraft.config,
                            whatsappNumber: e.target.value.replace(/\D/g, ''),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      E-mail Oficial
                    </label>
                    <input
                      type="email"
                      value={settingsDraft.config.email}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      URL do Instagram
                    </label>
                    <input
                      type="url"
                      value={settingsDraft.config.instagramUrl}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, instagramUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Nota Legal Rodapé
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.footerLegalNote}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, footerLegalNote: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Texto de Copyright
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.config.copyrightText}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          config: { ...settingsDraft.config, copyrightText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco B: Textos da Página Inicial */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-2 mb-4">
                  2. Textos da Página Inicial (Home)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Eyebrow de Abertura
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.homeEyebrow}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeEyebrow: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Indicador de Scroll no Hero
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.heroScrollLabel}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, heroScrollLabel: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Título Principal H1
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.homeH1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeH1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Subtítulo da Apresentação
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.homeSubtitle}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeSubtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Parágrafo 1 (Home)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsDraft.texts.homeParagraph1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeParagraph1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Parágrafo 2 (Home)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsDraft.texts.homeParagraph2}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeParagraph2: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Parágrafo 3 (Home)
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.homeParagraph3}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, homeParagraph3: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Citação Editorial
                    </label>
                    <textarea
                      rows={2}
                      value={settingsDraft.texts.quoteText}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, quoteText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco C: Textos das Páginas Imóveis e Sobre Mim */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-2 mb-4">
                  3. Textos das Páginas Imóveis & Sobre Mim
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Título H1 — Página Imóveis
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.housesH1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, housesH1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Introdução — Página Imóveis
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.housesIntro1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, housesIntro1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Título H1 — Página Sobre Mim
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.texts.aboutH1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, aboutH1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      História & Trajetória (Parágrafo 1)
                    </label>
                    <textarea
                      rows={3}
                      value={settingsDraft.texts.aboutLeftP1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, aboutLeftP1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                      Diferenciação & Compromisso (Parágrafo 1)
                    </label>
                    <textarea
                      rows={3}
                      value={settingsDraft.texts.aboutRightP1}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          texts: { ...settingsDraft.texts, aboutRightP1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================
            TAB 3: IMAGENS DO SITE & SUPABASE STORAGE
           ============================================================ */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            {/* Fotos Principais do Site */}
            <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                    Fotos Principais do Site
                  </h2>
                  <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                    Carregue e substitua diretamente as fotografias principais no Supabase Storage (bucket{' '}
                    <code className="font-mono bg-stone-100 px-1">{STORAGE_BUCKET}</code>) e guarde a alteração.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSitePhotos}
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-stone-300"
                  >
                    <RotateCcw size={13} />
                    <span>Repor Originais</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{isSavingSettings ? 'A guardar...' : 'Guardar Fotos'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* 1. Capa da Home */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#36210f]">
                      1. Capa da Home
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">2048 × 1365</span>
                  </div>
                  <ImageUpload
                    folder="site"
                    value={settingsDraft.photos.homeHero}
                    onChange={(newVal) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        photos: { ...settingsDraft.photos, homeHero: newVal },
                      })
                    }
                    aspectHint="Panorâmica de abertura"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'home' || p.tag === 'imoveis').map(
                      (opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setSettingsDraft({
                              ...settingsDraft,
                              photos: { ...settingsDraft.photos, homeHero: opt.value },
                            })
                          }
                          className={`px-2 py-1 text-[10px] uppercase font-semibold border cursor-pointer ${
                            settingsDraft.photos.homeHero === opt.value
                              ? 'bg-[#36210f] text-white border-[#36210f]'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label.split(' (')[0]}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 2. Capa de Imóveis */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#36210f]">
                      2. Capa de Imóveis
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">2200 × 1400</span>
                  </div>
                  <ImageUpload
                    folder="site"
                    value={settingsDraft.photos.housesHero}
                    onChange={(newVal) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        photos: { ...settingsDraft.photos, housesHero: newVal },
                      })
                    }
                    aspectHint="Arquitetura / Interior"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'imoveis' || p.tag === 'home').map(
                      (opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setSettingsDraft({
                              ...settingsDraft,
                              photos: { ...settingsDraft.photos, housesHero: opt.value },
                            })
                          }
                          className={`px-2 py-1 text-[10px] uppercase font-semibold border cursor-pointer ${
                            settingsDraft.photos.housesHero === opt.value
                              ? 'bg-[#36210f] text-white border-[#36210f]'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label.split(' (')[0]}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 3. Foto Sandra Carlos */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#36210f]">
                      3. Foto Sandra Carlos
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">832 × 1248</span>
                  </div>
                  <ImageUpload
                    folder="site"
                    value={settingsDraft.photos.sandraPortrait}
                    onChange={(newVal) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        photos: { ...settingsDraft.photos, sandraPortrait: newVal },
                      })
                    }
                    aspectHint="Retrato vertical"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'sandra').map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setSettingsDraft({
                            ...settingsDraft,
                            photos: { ...settingsDraft.photos, sandraPortrait: opt.value },
                          })
                        }
                        className={`px-2 py-1 text-[10px] uppercase font-semibold border cursor-pointer ${
                          settingsDraft.photos.sandraPortrait === opt.value
                            ? 'bg-[#36210f] text-white border-[#36210f]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {opt.label.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Explorador Direto do Bucket Supabase Storage */}
            <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
                <div>
                  <h3 className="font-sans text-lg font-bold uppercase tracking-[0.14em] text-stone-900 flex items-center gap-2">
                    <FolderOpen size={18} className="text-[#b87d1d]" />
                    <span>Biblioteca Supabase Storage ({STORAGE_BUCKET})</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Carregue, copie URLs ou remova ficheiros armazenados diretamente no bucket público.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(['properties', 'site', 'reviews'] as StorageFolder[]).map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setStorageFolder(folder)}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border cursor-pointer ${
                        storageFolder === folder
                          ? 'bg-[#36210f] text-white border-[#36210f]'
                          : 'bg-[#faf8f5] text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {folder}
                    </button>
                  ))}

                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b87d1d] hover:bg-[#36210f] text-white text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors">
                    <Upload size={13} />
                    <span>{isUploadingToBucket ? 'A enviar...' : 'Carregar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingToBucket}
                      className="hidden"
                      onChange={(e) => handleDirectBucketUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {isLoadingStorage ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  A carregar ficheiros do Supabase Storage...
                </div>
              ) : storageFiles.length === 0 ? (
                <div className="py-12 text-center bg-[#faf8f5] border border-dashed border-stone-300 mt-6">
                  <p className="text-xs font-semibold text-stone-700">
                    Nenhuma imagem encontrada na pasta "{storageFolder}/"
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Utilize o botão "Carregar" para enviar imagens para o Supabase Storage.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {storageFiles.map((file) => (
                    <div
                      key={file.path}
                      className="border border-stone-200 bg-[#faf8f5] overflow-hidden flex flex-col"
                    >
                      <div className="h-32 bg-stone-200 overflow-hidden">
                        <img
                          src={file.publicUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5 flex flex-col gap-2">
                        <span className="text-[11px] font-mono text-stone-700 truncate">
                          {file.name}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => copyUrlToClipboard(file.publicUrl)}
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-white border border-stone-300 hover:border-[#36210f] text-stone-800 cursor-pointer"
                          >
                            {copiedUrl === file.publicUrl ? (
                              <>
                                <Check size={11} className="text-emerald-700" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copiar URL</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete({
                                type: 'storage',
                                id: file.path,
                                label: file.name,
                              })
                            }
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                            title="Apagar do Storage"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: GESTÃO DE TESTEMUNHOS
           ============================================================ */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                  Testemunhos de Clientes
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Crie, edite ou apague testemunhos apresentados na página inicial.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewReviewModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                <span>Adicionar Testemunho</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-stone-200 p-5 flex flex-col justify-between hover:border-[#d8be9e] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {r.image ? (
                          <img
                            src={r.image}
                            alt={`Testemunho de ${r.name}`}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#d8be9e] text-[#36210f] flex items-center justify-center font-bold text-xs">
                            {r.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-sans font-semibold text-xs text-stone-900">
                            {r.name}
                          </h4>
                          <p className="text-[11px] text-stone-500">{r.role || 'Cliente'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditReviewModal(r)}
                          className="p-1.5 text-stone-600 hover:text-[#36210f] cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              type: 'review',
                              id: r.id,
                              label: `testemunho de ${r.name}`,
                            })
                          }
                          className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-700 text-xs italic leading-relaxed">"{r.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 5: BASE DE DADOS & SINCRONIZAÇÃO
           ============================================================ */}
        {activeTab === 'supabase' && (
          <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                  Ligação Supabase & Segurança RLS
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  As credenciais são lidas exclusivamente das variáveis de ambiente{' '}
                  <code className="font-mono bg-stone-100 px-1">VITE_SUPABASE_URL</code> e{' '}
                  <code className="font-mono bg-stone-100 px-1">VITE_SUPABASE_ANON_KEY</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeedToSupabase}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
              >
                <Database size={14} />
                <span>{isSeeding ? 'A sincronizar...' : 'Sincronizar Dados Iniciais'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#faf8f5] border border-stone-200">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                  Nível de Sessão Ativo
                </span>
                <span className="font-mono font-bold text-emerald-800 uppercase">{aal} (2FA TOTP)</span>
              </div>
              <div className="p-4 bg-[#faf8f5] border border-stone-200">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                  Utilizador Autenticado
                </span>
                <span className="font-mono text-stone-900 break-all">{user?.email}</span>
              </div>
              <div className="p-4 bg-[#faf8f5] border border-stone-200">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                  Bucket Supabase Storage
                </span>
                <span className="font-mono text-stone-900">{STORAGE_BUCKET} (Público em leitura)</span>
              </div>
            </div>

            <div className="p-4 bg-[#faf8f5] border border-stone-200 text-xs text-stone-700 space-y-2">
              <p className="font-semibold text-[#36210f]">
                Ficheiro SQL de configuração: <code className="font-mono">supabase-schema.sql</code>
              </p>
              <p className="leading-relaxed">
                O script completo na raiz do projeto cria as tabelas <code className="font-mono">admin_users</code>,{' '}
                <code className="font-mono">properties</code>, <code className="font-mono">reviews</code> e{' '}
                <code className="font-mono">site_settings</code>, ativa RLS em todas, configura o bucket{' '}
                <code className="font-mono">site-images</code> e restringe todas as operações de escrita à função{' '}
                <code className="font-mono">public.is_admin_aal2()</code>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          MODAL CRIAR / EDITAR IMÓVEL
         ============================================================ */}
      <AnimatePresence>
        {isEditingProperty && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-[#d8be9e] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto"
            >
              <div className="px-6 py-4 bg-[#36210f] text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-sans text-base font-bold uppercase tracking-wider">
                    {editingPropertyId ? 'Editar Imóvel' : 'Novo Imóvel'}
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider text-[#d8be9e]">
                    Sandra Carlos Consultoria Imobiliária
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProperty(false)}
                  className="p-1.5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-sans flex items-center gap-2 shrink-0">
                <Info size={16} className="text-amber-700 shrink-0" />
                <span>
                  Campos deixados em branco ficam automaticamente ocultos na ficha pública do imóvel.
                </span>
              </div>

              <form onSubmit={handleSavePropertySubmit} className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    1. Informação Principal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Título do Imóvel *
                      </label>
                      <input
                        type="text"
                        required
                        value={propertyForm.title || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                        placeholder="Ex: Vivenda Contemporânea com Piscina"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Tipologia
                      </label>
                      <input
                        type="text"
                        value={propertyForm.typology || ''}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, typology: e.target.value })
                        }
                        placeholder="Ex: T4 Isolada"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Preço
                      </label>
                      <input
                        type="text"
                        value={propertyForm.price || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                        placeholder="Ex: 485.000 €"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Área
                      </label>
                      <input
                        type="text"
                        value={propertyForm.area || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, area: e.target.value })}
                        placeholder="Ex: 320 m²"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Localização
                      </label>
                      <input
                        type="text"
                        value={propertyForm.location || ''}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, location: e.target.value })
                        }
                        placeholder="Ex: Pombal, Portugal"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Ano de Construção
                      </label>
                      <input
                        type="text"
                        value={propertyForm.year || ''}
                        onChange={(e) => setPropertyForm({ ...propertyForm, year: e.target.value })}
                        placeholder="Ex: 2023"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Certificado Energético
                      </label>
                      <input
                        type="text"
                        value={propertyForm.energyCertificate || ''}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, energyCertificate: e.target.value })
                        }
                        placeholder="Ex: A+"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Selo de Estado
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={propertyForm.status || 'none'}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              status: e.target.value as Property['status'],
                            })
                          }
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                        >
                          <option value="none">Nenhum</option>
                          <option value="new">NOVIDADE</option>
                          <option value="reserved">RESERVADO</option>
                          <option value="sold">VENDIDO</option>
                        </select>
                        <input
                          type="text"
                          value={propertyForm.statusLabel || ''}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, statusLabel: e.target.value })
                          }
                          placeholder="Texto personalizado"
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    2. Fotografias (Supabase Storage)
                  </h4>
                  <GalleryManager
                    coverImage={propertyForm.image || ''}
                    onCoverChange={(url) => setPropertyForm({ ...propertyForm, image: url })}
                    images={galleryImages}
                    onChange={(imgs) => setGalleryImages(imgs)}
                  />
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    3. Descrição do Imóvel
                  </h4>
                  <textarea
                    rows={5}
                    value={propertyForm.description || ''}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, description: e.target.value })
                    }
                    placeholder="Descrição arquitetónica e envolvente..."
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                  />
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    4. Vídeo Tour & Mapa Interativo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        URL do Vídeo (YouTube Embed / Vimeo)
                      </label>
                      <input
                        type="url"
                        value={propertyForm.videoUrl || ''}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, videoUrl: e.target.value })
                        }
                        placeholder="https://www.youtube-nocookie.com/embed/..."
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Miniatura de Vídeo (Opcional)
                      </label>
                      <input
                        type="url"
                        value={propertyForm.videoThumbnail || ''}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, videoThumbnail: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={mapLat}
                        onChange={(e) => setMapLat(e.target.value)}
                        placeholder="Ex: 39.9167"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={mapLng}
                        onChange={(e) => setMapLng(e.target.value)}
                        placeholder="Ex: -8.6283"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Precisão do Mapa
                      </label>
                      <select
                        value={mapPrecision}
                        onChange={(e) => setMapPrecision(e.target.value as LocationPrecision)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      >
                        <option value="exata">Localização Exata</option>
                        <option value="certa">Zona Aproximada (Círculo)</option>
                      </select>
                    </div>

                    {mapPrecision === 'certa' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                          Raio do Círculo (metros)
                        </label>
                        <input
                          type="number"
                          min={100}
                          max={3000}
                          step={50}
                          value={mapCircleRadius}
                          onChange={(e) => setMapCircleRadius(e.target.value)}
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    5. Características e Comodidades
                  </h4>
                  <PredefinedFeaturesForm
                    values={predefinedValues}
                    onChange={handleFeatureValueChange}
                  />
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingProperty(false)}
                    className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProperty}
                    className="px-6 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save size={15} />
                    <span>{isSavingProperty ? 'A guardar...' : 'Guardar Imóvel'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          MODAL CRIAR / EDITAR TESTEMUNHO
         ============================================================ */}
      <AnimatePresence>
        {isEditingReview && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-[#d8be9e] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-[#36210f] text-white flex items-center justify-between shrink-0">
                <h3 className="font-sans text-base font-bold uppercase tracking-wider">
                  {editingReviewId ? 'Editar Testemunho' : 'Novo Testemunho'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingReview(false)}
                  className="p-1 hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveReviewSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name || ''}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Ex: Dra. Teresa Valente"
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                    Função / Descritivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.role || ''}
                    onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                    placeholder="Ex: Cliente em Pombal"
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                  />
                </div>

                <div>
                  <ImageUpload
                    folder="reviews"
                    label="Fotografia / Avatar do Cliente (Supabase Storage)"
                    value={reviewForm.image || ''}
                    onChange={(val) => setReviewForm({ ...reviewForm, image: val })}
                    aspectHint="Retrato quadrado"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                    Testemunho *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={reviewForm.text || ''}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    placeholder="Escreva o testemunho do cliente..."
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                  />
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(false)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReview}
                    className="px-5 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save size={15} />
                    <span>{isSavingReview ? 'A guardar...' : 'Guardar Testemunho'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
