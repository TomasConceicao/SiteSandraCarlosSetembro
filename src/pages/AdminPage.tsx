import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Property, Testimonial, PageType, LocationPrecision } from '../types';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  seedPropertiesToSupabase,
  seedReviewsToSupabase,
} from '../lib/supabase';
import {
  Building2,
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Eye,
  Star,
  ExternalLink,
  Info,
  Copy,
  Check,
  Save,
  X,
  Lock,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import {
  getFeaturedPropertyIds,
  toggleFeaturedProperty,
} from '../utils/featuredManager';
import { GalleryManager } from '../components/GalleryManager';
import { PredefinedFeaturesForm } from '../components/PredefinedFeaturesForm';
import { ImageUpload } from '../components/ImageUpload';
import {
  getSitePhotos,
  saveSitePhotos,
  SitePhotos,
  DEFAULT_SITE_PHOTOS,
  PUBLIC_FOLDER_PHOTOS,
} from '../utils/bannersManager';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
  onSelectProperty: (property: Property) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onSelectProperty }) => {
  const {
    properties,
    reviews,
    isAuthenticated,
    isSupabaseReady,
    login,
    logout,
    saveProperty,
    removeProperty,
    saveReview,
    removeReview,
    refresh,
  } = useData();

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Tab navigation: 'properties' | 'reviews' | 'photos' | 'supabase'
  const [activeTab, setActiveTab] = useState<'properties' | 'reviews' | 'photos' | 'supabase'>('properties');

  // Property modal / form state
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [predefinedValues, setPredefinedValues] = useState<Record<string, string>>({});
  const [mapLat, setMapLat] = useState('');
  const [mapLng, setMapLng] = useState('');
  const [mapPrecision, setMapPrecision] = useState<LocationPrecision>('exata');
  const [mapCircleRadius, setMapCircleRadius] = useState('380');

  // Review modal / form state
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<Partial<Testimonial>>({});

  // Site Photos state (Home Hero, Casas Hero, Foto Sandra Carlos)
  const [sitePhotos, setSitePhotos] = useState<SitePhotos>(() => getSitePhotos());

  // Action status notification
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Featured IDs tracking
  const [featuredIds, setFeaturedIds] = useState<string[]>(() => getFeaturedPropertyIds());

  useEffect(() => {
    setSitePhotos(getSitePhotos());
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    const result = await login(email, password);
    setIsSubmittingAuth(false);

    if (!result.success) {
      setAuthError(result.error || 'Credenciais inválidas.');
    }
  };

  // Helper to open Property Form
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

    // Converter features existentes em mapa chave-valor para os campos fixos
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

    // Se bedrooms/bathrooms/área/ano existirem no objeto principal, garantir que aparecem nos campos fixos se vazios
    if (p.bedrooms && !mapped['Total de Quartos']) {
      mapped['Total de Quartos'] = String(p.bedrooms);
    }
    if (p.bathrooms && !mapped['Casas de Banho']) {
      mapped['Casas de Banho'] = String(p.bathrooms);
    }
    if (p.area && !mapped['Área Útil']) {
      mapped['Área Útil'] = p.area;
    }
    if (p.year && !mapped['Ano de Construção']) {
      mapped['Ano de Construção'] = p.year;
    }
    if (p.price && !mapped['Preço Pretendido']) {
      mapped['Preço Pretendido'] = p.price;
    }
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
    setPredefinedValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSavePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyForm.title?.trim() || !propertyForm.image?.trim()) {
      showNotice('O título e a fotografia principal são obrigatórios.', 'error');
      return;
    }

    // Organizar as características preenchidas por categorias
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
      'Área Total do Terreno',
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

    const buildCategory = (labels: string[]) => {
      return labels
        .filter((lbl) => Boolean(predefinedValues[lbl]?.trim()))
        .map((lbl) => ({ label: lbl, value: predefinedValues[lbl].trim() }));
    };

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

    // Sincronizar bedrooms / bathrooms / etc. dos campos fixos se não estiverem preenchidos diretamente
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
      energyCertificate: propertyForm.energyCertificate?.trim() || predefinedValues['Certificação Energética'] || '',
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

    const res = await saveProperty(propertyToSave);
    if (res.success) {
      showNotice(
        editingPropertyId
          ? 'Imóvel atualizado com sucesso!'
          : 'Novo imóvel adicionado com sucesso!'
      );
      setIsEditingProperty(false);
    } else {
      showNotice(`Erro ao guardar o imóvel: ${res.error || 'Verifique as permissões no Supabase'}`, 'error');
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o imóvel "${title}"?`)) {
      const ok = await removeProperty(id);
      if (ok) {
        showNotice('Imóvel eliminado com sucesso!');
      } else {
        showNotice('Erro ao eliminar imóvel.', 'error');
      }
    }
  };

  // Helper for Review Form
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

    const res = await saveReview(reviewToSave);
    if (res.success) {
      showNotice(
        editingReviewId
          ? 'Testemunho atualizado com sucesso!'
          : 'Novo testemunho adicionado com sucesso!'
      );
      setIsEditingReview(false);
    } else {
      showNotice(`Erro ao guardar o testemunho: ${res.error || 'Verifique as permissões no Supabase'}`, 'error');
    }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a review de "${name}"?`)) {
      const ok = await removeReview(id);
      if (ok) {
        showNotice('Testemunho eliminado com sucesso!');
      } else {
        showNotice('Erro ao eliminar testemunho.', 'error');
      }
    }
  };

  // Site Photos Save & Reset
  const handleSaveSitePhotos = () => {
    saveSitePhotos(sitePhotos);
    showNotice('Fotos do site atualizadas com sucesso em todas as páginas!');
  };

  const handleResetSitePhotos = () => {
    setSitePhotos(DEFAULT_SITE_PHOTOS);
    saveSitePhotos(DEFAULT_SITE_PHOTOS);
    showNotice('Fotos do site repostas para os ficheiros originais da pasta /public.');
  };

  const handleSeedToSupabase = async () => {
    setIsSeeding(true);
    const resProp = await seedPropertiesToSupabase();
    const resRev = await seedReviewsToSupabase();
    setIsSeeding(false);
    if (resProp.error || resRev.error) {
      const err = resProp.error || resRev.error;
      showNotice(`Aviso: ${err || 'Execute o código SQL atualizado no SQL Editor do Supabase.'}`, 'error');
    } else {
      showNotice(`Sincronizados ${resProp.count} imóveis e ${resRev.count} testemunhos com a nuvem!`);
    }
    refresh();
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const sqlCode = `-- TABELA DE IMÓVEIS
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  status TEXT DEFAULT 'disponivel',
  status_label TEXT,
  location TEXT NOT NULL,
  address TEXT,
  location_precision TEXT DEFAULT 'exata',
  typology TEXT,
  area TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  half_baths INTEGER,
  description TEXT,
  extended_description JSONB,
  image TEXT NOT NULL,
  secondary_images JSONB,
  architectural_highlights JSONB,
  year TEXT,
  energy_certificate TEXT,
  price TEXT,
  video_url TEXT,
  video_thumbnail TEXT,
  map_coordinates JSONB,
  interior_features JSONB,
  exterior_features JSONB,
  details_features JSONB,
  financial_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA DE TESTEMUNHOS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  image TEXT,
  fallback_image TEXT,
  rating INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- CONCEDER PERMISSÕES ÀS ROLES 'anon' E 'authenticated'
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.properties TO anon, authenticated;
GRANT ALL ON TABLE public.reviews TO anon, authenticated;

-- POLÍTICAS DE ACESSO LIVRES (RLS)
DROP POLICY IF EXISTS "Public read properties" ON public.properties;
CREATE POLICY "Public read properties" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert properties" ON public.properties;
CREATE POLICY "Public insert properties" ON public.properties FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update properties" ON public.properties;
CREATE POLICY "Public update properties" ON public.properties FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete properties" ON public.properties;
CREATE POLICY "Public delete properties" ON public.properties FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert reviews" ON public.reviews;
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update reviews" ON public.reviews;
CREATE POLICY "Public update reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete reviews" ON public.reviews;
CREATE POLICY "Public delete reviews" ON public.reviews FOR DELETE USING (true);`;

  // Se não autenticado, mostra o ecrã de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-stone-900">
        <div className="w-full max-w-md bg-white border border-[#d8be9e] shadow-xl p-8 sm:p-10 relative">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#36210f] text-[#d8be9e] flex items-center justify-center font-bold text-xl mx-auto mb-4 rounded-sm">
              SC
            </div>
            <h1 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-[#36210f]">
              Área Reservada
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mt-1">
              Sandra Carlos Consultoria Imobiliária
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                E-mail de Administrador
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sandracarlos.pt"
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-[#36210f]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                Palavra-passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-[#36210f]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingAuth ? 'A verificar...' : 'Iniciar Sessão'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-600 hover:text-[#36210f] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Voltar ao Site Público
            </button>

            {!isSupabaseReady && (
              <div className="mt-4 p-2.5 bg-amber-50/70 border border-amber-200/80 text-[11px] text-stone-600 text-left">
                <strong>Acesso Local de Demonstração:</strong>
                <div className="mt-0.5 font-mono text-[10px] text-stone-700">
                  admin@sandracarlos.pt / admin123
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard de Administração
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-28">
      {/* Top Header Bar */}
      <header className="bg-[#36210f] text-white px-6 sm:px-10 py-4 border-b border-[#5c3403]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d8be9e] text-[#36210f] flex items-center justify-center font-bold text-sm rounded-sm">
              SC
            </div>
            <div>
              <h1 className="font-sans text-base sm:text-lg font-bold uppercase tracking-[0.14em] text-white">
                Painel Administrativo
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#d8be9e]">
                Gestão Dinâmica de Imóveis, Fotografias, Testemunhos e Topo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-white/10 hover:bg-white/20 text-[#d8be9e] hover:text-white transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>Ver Site</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sair</span>
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
            className={`fixed top-4 right-4 z-50 px-4 py-3 shadow-lg flex items-center gap-2.5 text-xs font-sans font-semibold uppercase tracking-wider text-white ${
              actionNotice.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'
            }`}
          >
            {actionNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionNotice.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-8">
        {/* Supabase Status Banner */}
        <div className="mb-8 p-4 bg-white border border-[#d8be9e]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isSupabaseReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <div className="font-sans text-xs uppercase tracking-wider font-bold text-stone-900">
                {isSupabaseReady ? 'Conectado ao Supabase (Cloud)' : 'Modo de Armazenamento Local (Sincronizado)'}
              </div>
              <div className="text-xs text-stone-500">
                {isSupabaseReady
                  ? 'Todas as alterações são guardadas diretamente na base de dados Supabase na nuvem.'
                  : 'Para ativar o Supabase gratuito no Vercel, consulte o separador "Supabase & Setup".'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-1 bg-stone-100 border border-stone-200 text-stone-700">
              {properties.length} Imóveis • {reviews.length} Reviews
            </span>
            <button
              onClick={refresh}
              className="text-xs uppercase tracking-wider font-semibold text-[#36210f] hover:text-[#b87d1d] underline cursor-pointer"
            >
              Recarregar
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-300/80 mb-8 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building2 size={16} />
            Imóveis ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquareQuote size={16} />
            Testemunhos ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon size={16} />
            Fotos do Site
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-4 font-sans text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-[#36210f] text-[#36210f]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database size={16} />
            Supabase & Setup
          </button>
        </div>

        {/* TAB 1: PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                  Catálogo de Imóveis
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Adicione, edite ou remova imóveis. A regra estrita de campos em branco aplica-se a cada item.
                </p>
              </div>

              <button
                onClick={openNewPropertyModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                Adicionar Novo Imóvel
              </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const isFeatured = featuredIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-stone-200 overflow-hidden flex flex-col hover:border-[#d8be9e] transition-all shadow-xs"
                  >
                    <div className="relative h-48 bg-stone-100 overflow-hidden">
                      {/* Contexto: Miniatura da fotografia da propriedade no painel administrativo */}
                      <img
                        src={p.image}
                        alt={`Sandra Carlos Consultoria Imobiliária - ${p.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width="380"
                        height="192"
                      />
                      {p.status && p.status !== 'none' && (
                        <div className="absolute top-3 left-3 bg-[#36210f]/90 text-white text-[10px] font-sans uppercase tracking-[0.2em] px-2.5 py-1 font-semibold">
                          {p.statusLabel || p.status.toUpperCase()}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = toggleFeaturedProperty(p.id);
                          setFeaturedIds([...updated]);
                          showNotice(
                            isFeatured
                              ? 'Imóvel removido dos destaques da Home.'
                              : 'Imóvel adicionado aos destaques da Home!'
                          );
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors cursor-pointer ${
                          isFeatured
                            ? 'bg-[#b87d1d] text-white'
                            : 'bg-black/40 hover:bg-black/60 text-white/80'
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
                        <div className="font-sans font-bold text-base text-[#36210f] mb-3">
                          {p.price ? p.price : <span className="text-xs font-normal text-stone-500">Preço sob consulta</span>}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                          <span>{p.area || '—'}</span>
                          <span>•</span>
                          <span>{p.bedrooms ? `${p.bedrooms} Quartos` : '—'}</span>
                          <span>•</span>
                          <span>{p.secondaryImages?.length || 0} Fotos extras</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onSelectProperty(p);
                            onNavigate('casas');
                          }}
                          className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-[#36210f] font-semibold cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Pré-visualizar</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditPropertyModal(p)}
                            className="p-1.5 text-stone-600 hover:text-[#36210f] hover:bg-stone-100 rounded-sm cursor-pointer"
                            title="Editar Imóvel"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(p.id, p.title)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-sm cursor-pointer"
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

        {/* TAB 2: REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                  Testemunhos de Clientes
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Faça a gestão dos comentários e avaliações de clientes exibidos na página inicial.
                </p>
              </div>

              <button
                onClick={openNewReviewModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                Adicionar Testemunho
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
                          /* Contexto: Fotografia do cliente associada ao testemunho no painel de administração */
                          <img
                            src={r.image}
                            alt={`Testemunho de ${r.name} - Sandra Carlos Consultoria Imobiliária`}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            width="40"
                            height="40"
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
                          onClick={() => openEditReviewModal(r)}
                          className="p-1.5 text-stone-600 hover:text-[#36210f] cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id, r.name)}
                          className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-700 text-xs italic leading-relaxed">
                      "{r.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FOTOS DO SITE (HOME, CASAS E SANDRA CARLOS) */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                    Fotos Principais do Site
                  </h2>
                  <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                    Faça a gestão centralizada das imagens fixas do site: <strong>Capa da Home</strong>, <strong>Capa dos Imóveis</strong> e <strong>Foto de Perfil da Sandra Carlos</strong>. Pode carregar novas fotos diretamente do seu computador (otimizadas automaticamente) ou escolher ficheiros existentes na pasta <code>/public</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSitePhotos}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-stone-300"
                  >
                    <RotateCcw size={13} />
                    <span>Repor Originais</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSitePhotos}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Guardar Alterações</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8">
                {/* 1. Capa da Página Inicial (Home) */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f]">
                        1. Capa da Home
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-mono">
                        2048 × 1365 px
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600">
                      Fotografia de grande impacto visual no topo da página inicial.
                    </p>

                    <ImageUpload
                      value={sitePhotos.homeHero}
                      onChange={(newVal) => setSitePhotos({ ...sitePhotos, homeHero: newVal })}
                      aspectHint="Panorâmica de abertura"
                      placeholder="/hero.jpg ou URL da imagem"
                    />

                    {/* Sugestões de ficheiros /public */}
                    <div className="pt-2">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                        Ficheiros disponíveis:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'home' || p.tag === 'casas').map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSitePhotos({ ...sitePhotos, homeHero: opt.value })}
                            className={`px-2 py-1 text-[10px] uppercase font-semibold border transition-colors cursor-pointer ${
                              sitePhotos.homeHero === opt.value
                                ? 'bg-[#36210f] text-white border-[#36210f]'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Banner da Página de Imóveis (Casas) */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f]">
                        2. Capa de Imóveis
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-mono">
                        2200 × 1400 px
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600">
                      Fotografia de arquitetura contemporânea no topo do catálogo de imóveis.
                    </p>

                    <ImageUpload
                      value={sitePhotos.housesHero}
                      onChange={(newVal) => setSitePhotos({ ...sitePhotos, housesHero: newVal })}
                      aspectHint="Arquitetura / Interior"
                      placeholder="/pagina_imoveis_2.png ou URL"
                    />

                    {/* Sugestões de ficheiros /public */}
                    <div className="pt-2">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                        Ficheiros disponíveis:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'casas' || p.tag === 'home').map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSitePhotos({ ...sitePhotos, housesHero: opt.value })}
                            className={`px-2 py-1 text-[10px] uppercase font-semibold border transition-colors cursor-pointer ${
                              sitePhotos.housesHero === opt.value
                                ? 'bg-[#36210f] text-white border-[#36210f]'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Retrato Profissional Sandra Carlos */}
                <div className="space-y-3 p-5 bg-[#faf8f5] border border-stone-200 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f]">
                        3. Foto Sandra Carlos
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-mono">
                        832 × 1248 px
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600">
                      Fotografia exibida no bloco de apresentação da Home e na página <strong>Sobre Mim</strong>.
                    </p>

                    <ImageUpload
                      value={sitePhotos.sandraPortrait}
                      onChange={(newVal) => setSitePhotos({ ...sitePhotos, sandraPortrait: newVal })}
                      aspectHint="Retrato vertical (3:4 ou 2:3)"
                      placeholder="/sandra.jpg ou carregue do PC"
                    />

                    {/* Sugestões de ficheiros /public */}
                    <div className="pt-2">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                        Ficheiros disponíveis:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PUBLIC_FOLDER_PHOTOS.filter((p) => p.tag === 'sandra').map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSitePhotos({ ...sitePhotos, sandraPortrait: opt.value })}
                            className={`px-2 py-1 text-[10px] uppercase font-semibold border transition-colors cursor-pointer ${
                              sitePhotos.sandraPortrait === opt.value
                                ? 'bg-[#36210f] text-white border-[#36210f]'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPABASE & VERCEL INSTRUCTIONS */}
        {activeTab === 'supabase' && (
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-white border border-[#d8be9e]/60 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider mb-2 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Supabase Configurado e Ligado
                  </div>
                  <h2 className="font-sans text-xl font-bold uppercase tracking-[0.14em] text-stone-900">
                    Conexão ao Supabase Ativa
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Projeto ligado com sucesso. Os imóveis e testemunhos criados ou editados no painel são guardados na nuvem.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://supabase.com/dashboard/project/nlcwrorinmlcevvesyoa/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-stone-300"
                  >
                    <ExternalLink size={13} />
                    <span>Abrir SQL Editor</span>
                  </a>

                  <button
                    onClick={handleSeedToSupabase}
                    disabled={isSeeding}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSeeding ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>A sincronizar...</span>
                      </>
                    ) : (
                      <>
                        <Database size={13} />
                        <span>Sincronizar Catálogo Inicial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Current Credentials Preview */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#faf8f5] border border-stone-200">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                    Project URL
                  </span>
                  <span className="font-mono text-xs text-stone-900 select-all break-all">
                    {supabaseUrl}
                  </span>
                </div>
                <div className="p-3 bg-[#faf8f5] border border-stone-200">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1">
                    Publishable Key
                  </span>
                  <span className="font-mono text-xs text-stone-900 select-all break-all">
                    {supabaseAnonKey}
                  </span>
                </div>
              </div>

              {/* Step 1: SQL Setup */}
              <div className="mt-8 p-4 sm:p-5 bg-[#faf8f5] border border-stone-200">
                <div className="font-semibold text-sm text-[#36210f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span>Passo 1: Criar/Verificar Tabelas no SQL Editor do Supabase</span>
                  <button
                    onClick={copySqlToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#36210f] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#b87d1d] transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                    {copiedSql ? 'Copiado para a área de transferência!' : 'Copiar Código SQL'}
                  </button>
                </div>
                <p className="text-xs text-stone-600 mb-3">
                  Caso ainda não tenha executado o script no seu projeto Supabase, aceda ao <strong>SQL Editor</strong>, cole o código abaixo e clique em <strong>Run</strong>:
                </p>
                <pre className="bg-stone-900 text-stone-100 p-4 text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
                  {sqlCode}
                </pre>
              </div>

              {/* Step 2: Deployment Variables */}
              <div className="mt-6 p-4 sm:p-5 bg-[#faf8f5] border border-stone-200">
                <div className="font-semibold text-sm text-[#36210f] mb-2">
                  Passo 2: Variáveis no Vercel (Produção)
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  Ao publicar o site no <strong>Vercel</strong>, adicione estas 2 variáveis em <strong>Project Settings &rarr; Environment Variables</strong>:
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 bg-white border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[#36210f]">VITE_SUPABASE_URL</span>
                    <span className="text-stone-700 select-all font-mono text-[11px]">{supabaseUrl}</span>
                  </div>
                  <div className="p-3 bg-white border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[#36210f]">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-stone-700 select-all font-mono text-[11px]">{supabaseAnonKey}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PROPERTY EDIT/CREATE MODAL */}
      <AnimatePresence>
        {isEditingProperty && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#d8be9e] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto"
            >
              {/* Modal Header */}
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
                  onClick={() => setIsEditingProperty(false)}
                  className="p-1.5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Strict Rule Notice */}
              <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-sans flex items-center gap-2 shrink-0">
                <Info size={16} className="text-amber-700 shrink-0" />
                <span>
                  <strong>Regra de Ouro Ativa:</strong> Qualquer caixa ou campo que deixe vazio não será apresentado na página pública do site (preço, quartos, vídeo, mapa, características, etc.).
                </span>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSavePropertySubmit} className="p-6 overflow-y-auto space-y-6">
                {/* 1. Informação Principal */}
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
                        onChange={(e) => setPropertyForm({ ...propertyForm, typology: e.target.value })}
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
                        placeholder="Ex: 485.000 € (deixe em branco se for sob consulta/oculto)"
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
                        onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
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
                            setPropertyForm({ ...propertyForm, status: e.target.value as any })
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
                          placeholder="Texto personalizado (opcional)"
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Fotografias (Upload Direto + Reordenação) */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    2. Fotografias e Galeria (Upload Direto & Reordenação de Imagens)
                  </h4>
                  <GalleryManager
                    coverImage={propertyForm.image || ''}
                    onCoverChange={(url) => setPropertyForm({ ...propertyForm, image: url })}
                    images={galleryImages}
                    onChange={(imgs) => setGalleryImages(imgs)}
                  />
                </div>

                {/* 3. Descrição */}
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

                {/* 4. Vídeo do Imóvel & Mapa */}
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
                        placeholder="Ex: https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ (deixe em branco para ocultar secção de vídeo)"
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
                        placeholder="https://exemplo.com/thumb-video.jpg"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Coordenadas: Latitude
                      </label>
                      <input
                        type="text"
                        value={mapLat}
                        onChange={(e) => setMapLat(e.target.value)}
                        placeholder="Ex: 39.9167 (deixe em branco para ocultar mapa)"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Coordenadas: Longitude
                      </label>
                      <input
                        type="text"
                        value={mapLng}
                        onChange={(e) => setMapLng(e.target.value)}
                        placeholder="Ex: -8.6283 (deixe em branco para ocultar mapa)"
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                        Modo de Visualização do Mapa
                      </label>
                      <select
                        value={mapPrecision}
                        onChange={(e) => setMapPrecision(e.target.value as LocationPrecision)}
                        className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                      >
                        <option value="exata">Localização Exata (Pino no ponto preciso)</option>
                        <option value="certa">Localização Certa / Aproximada (Círculo de privacidade)</option>
                      </select>
                    </div>

                    {mapPrecision === 'certa' ? (
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1">
                          Raio do Círculo de Privacidade (metros)
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="3000"
                          step="50"
                          value={mapCircleRadius}
                          onChange={(e) => setMapCircleRadius(e.target.value)}
                          placeholder="Ex: 380"
                          className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-[11px] text-stone-500 pt-5">
                        <span>O pino será exibido com precisão milimétrica nas coordenadas indicadas.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Características e Comodidades (Campos Fixos Pré-definidos) */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#36210f] border-b border-stone-200 pb-1.5 mb-3">
                    5. Características e Comodidades (Campos Fixos Padronizados)
                  </h4>
                  <PredefinedFeaturesForm
                    values={predefinedValues}
                    onChange={handleFeatureValueChange}
                  />
                </div>

                {/* Form Buttons */}
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
                    className="px-6 py-2.5 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <Save size={15} />
                    Guardar Imóvel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW EDIT/CREATE MODAL COM UPLOAD DIRETO DE FOTO */}
      <AnimatePresence>
        {isEditingReview && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#d8be9e] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-[#36210f] text-white flex items-center justify-between shrink-0">
                <h3 className="font-sans text-base font-bold uppercase tracking-wider">
                  {editingReviewId ? 'Editar Testemunho' : 'Novo Testemunho'}
                </h3>
                <button
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
                    placeholder="Ex: Compradora em Pombal (deixe em branco se não quiser exibir)"
                    className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                  />
                </div>

                {/* Upload Direto da Fotografia do Cliente */}
                <div>
                  <ImageUpload
                    label="Fotografia / Avatar do Cliente (opcional)"
                    value={reviewForm.image || ''}
                    onChange={(val) => setReviewForm({ ...reviewForm, image: val })}
                    aspectHint="Retrato quadrado recomendado"
                    placeholder="https://... ou carregue o ficheiro"
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
                    placeholder="Escreva as palavras de recomendação do cliente..."
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
                    className="px-5 py-2 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Save size={15} />
                    Guardar Testemunho
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
