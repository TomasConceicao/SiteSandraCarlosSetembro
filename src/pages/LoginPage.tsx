import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { PageType } from '../types';
import { useData } from '../context/DataContext';
import {
  enrollTotpFactor,
  signInWithEmailPassword,
  verifyTotpCode,
} from '../lib/supabase';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const {
    isSupabaseReady,
    authLoading,
    authStatus,
    isAuthenticated,
    refreshAuthStatus,
    logout,
  } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [selectedFactorId, setSelectedFactorId] = useState<string>('');
  const [enrollData, setEnrollData] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Se já estiver autenticado com nível AAL2, encaminha diretamente para /admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      onNavigate('admin');
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  // Quando há sessão AAL1 sem fator verificado, inicia automaticamente a inscrição TOTP (QR Code)
  useEffect(() => {
    if (
      authLoading ||
      !authStatus.hasSession ||
      authStatus.isAal2
    ) {
      return;
    }

    if (authStatus.verifiedFactors.length > 0) {
      setSelectedFactorId((prev) => prev || authStatus.verifiedFactors[0].id);
      setEnrollData(null);
      return;
    }

    if (!enrollData && !isEnrolling) {
      let active = true;
      setIsEnrolling(true);
      setErrorMsg(null);
      enrollTotpFactor().then((res) => {
        if (!active) return;
        setIsEnrolling(false);
        if (res.success && res.factorId && res.qrCode && res.secret) {
          setEnrollData({
            factorId: res.factorId,
            qrCode: res.qrCode,
            secret: res.secret,
          });
        } else {
          setErrorMsg(
            res.error || 'Não foi possível gerar o código QR de autenticação 2FA.'
          );
        }
      });
      return () => {
        active = false;
      };
    }
  }, [
    authLoading,
    authStatus.hasSession,
    authStatus.isAal2,
    authStatus.verifiedFactors,
    enrollData,
    isEnrolling,
  ]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await signInWithEmailPassword(email, password);
    if (!res.success) {
      setIsSubmitting(false);
      setErrorMsg(res.error || 'Não foi possível iniciar sessão.');
      return;
    }

    const updatedStatus = await refreshAuthStatus();
    setIsSubmitting(false);
    setTotpCode('');

    if (updatedStatus.isAal2) {
      onNavigate('admin');
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetFactorId = enrollData?.factorId || selectedFactorId;
    if (!targetFactorId) {
      setErrorMsg('Fator 2FA não encontrado. Recarregue a página ou tente novamente.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyTotpCode(targetFactorId, totpCode);
    if (!res.success) {
      setIsSubmitting(false);
      setErrorMsg(res.error || 'Código 2FA inválido.');
      return;
    }

    const updatedStatus = await refreshAuthStatus();
    setIsSubmitting(false);
    if (updatedStatus.isAal2) {
      onNavigate('admin');
    } else {
      setErrorMsg('A sessão não atingiu o nível de verificação AAL2.');
    }
  };

  const handleRegenerateQr = async () => {
    setErrorMsg(null);
    setEnrollData(null);
    setTotpCode('');
    setIsEnrolling(true);
    const res = await enrollTotpFactor();
    setIsEnrolling(false);
    if (res.success && res.factorId && res.qrCode && res.secret) {
      setEnrollData({
        factorId: res.factorId,
        qrCode: res.qrCode,
        secret: res.secret,
      });
    } else {
      setErrorMsg(res.error || 'Erro ao gerar novo QR code.');
    }
  };

  const handleCopySecret = () => {
    if (!enrollData?.secret) return;
    navigator.clipboard.writeText(enrollData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  const handleSwitchAccount = async () => {
    setErrorMsg(null);
    setTotpCode('');
    setEnrollData(null);
    setSelectedFactorId('');
    await logout();
  };

  const resolvedQrSrc = enrollData?.qrCode
    ? enrollData.qrCode.startsWith('data:')
      ? enrollData.qrCode
      : `data:image/svg+xml;utf-8,${encodeURIComponent(enrollData.qrCode)}`
    : '';

  const isStep2 = authStatus.hasSession && !authStatus.isAal2;
  const isFirstTimeEnroll = isStep2 && authStatus.verifiedFactors.length === 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-stone-900">
      <div className="w-full max-w-md bg-white border border-[#d8be9e] shadow-xl p-8 sm:p-10">
        {/* Cabeçalho da Área Reservada */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-[#36210f] text-[#d8be9e] flex items-center justify-center font-serif font-semibold text-xl mx-auto mb-4">
            SC
          </div>
          <h1 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-[#36210f]">
            {isStep2 ? 'Verificação 2FA Obrigatória' : 'Área Reservada'}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-1">
            Sandra Carlos Consultoria Imobiliária
          </p>
        </div>

        {/* Alerta caso as variáveis de ambiente Supabase não estejam configuradas */}
        {!isSupabaseReady && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
            <div className="font-semibold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-amber-700" />
              <span>Supabase não configurado</span>
            </div>
            <p className="leading-relaxed">
              Defina <code className="font-mono bg-amber-100 px-1">VITE_SUPABASE_URL</code> e{' '}
              <code className="font-mono bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> no ficheiro{' '}
              <code className="font-mono bg-amber-100 px-1">.env</code> para ativar a autenticação.
            </p>
          </div>
        )}

        {/* Mensagem de erro */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#36210f] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              A verificar sessão de segurança...
            </p>
          </div>
        ) : !isStep2 ? (
          /* PASSO 1: LOGIN COM EMAIL E PASSWORD */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5"
              >
                Email de Administrador
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@dominio.pt"
                disabled={!isSupabaseReady || isSubmitting}
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-[#36210f] disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5"
              >
                Palavra-passe
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={!isSupabaseReady || isSubmitting}
                className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-[#36210f] disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={!isSupabaseReady || isSubmitting}
              className="w-full py-3 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock size={14} />
              <span>{isSubmitting ? 'A autenticar...' : 'Continuar para 2FA'}</span>
            </button>
          </form>
        ) : (
          /* PASSO 2: 2FA OBRIGATÓRIO COM APP AUTENTICADORA (TOTP) */
          <div className="space-y-5">
            <div className="p-3 bg-[#faf8f5] border border-stone-200 text-xs text-stone-700 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">
                  Sessão iniciada como
                </span>
                <span className="font-semibold text-stone-900">{authStatus.user?.email}</span>
              </div>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-stone-600 hover:text-red-700 cursor-pointer shrink-0"
              >
                <LogOut size={13} />
                <span>Sair</span>
              </button>
            </div>

            {isFirstTimeEnroll ? (
              /* PRIMEIRO ACESSO: REGISTO OBRIGATÓRIO COM QR CODE */
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 text-xs text-stone-800 space-y-1">
                  <div className="font-semibold text-[#36210f] flex items-center gap-1.5">
                    <Smartphone size={15} className="text-[#b87d1d]" />
                    <span>Configuração Obrigatória de 2FA (Primeira Vez)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-700">
                    Leia o código QR com a sua app autenticadora (Google Authenticator, Microsoft Authenticator, Authy ou 1Password) e introduza o código de 6 dígitos gerado.
                  </p>
                </div>

                {isEnrolling ? (
                  <div className="py-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#36210f] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-stone-500">A gerar código QR seguro...</span>
                  </div>
                ) : enrollData ? (
                  <div className="space-y-3">
                    <div className="bg-white border border-stone-200 p-4 flex flex-col items-center">
                      {resolvedQrSrc && (
                        <img
                          src={resolvedQrSrc}
                          alt="Código QR para autenticação de dois fatores (TOTP)"
                          className="w-44 h-44 object-contain"
                          width={176}
                          height={176}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleRegenerateQr}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-[#36210f] cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        <span>Gerar novo QR code</span>
                      </button>
                    </div>

                    <div className="p-2.5 bg-[#faf8f5] border border-stone-200">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                        Chave manual (caso não consiga ler o QR):
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <code className="font-mono text-[11px] text-stone-900 break-all select-all">
                          {enrollData.secret}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-1.5 text-stone-600 hover:text-[#36210f] border border-stone-300 bg-white cursor-pointer shrink-0"
                          title="Copiar chave secreta"
                        >
                          {copiedSecret ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* LOGINS SEGUINTES: PEDIDO DO CÓDIGO DE 6 DÍGITOS */
              <div className="space-y-3">
                <div className="p-3.5 bg-[#faf8f5] border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
                  <ShieldCheck size={17} className="text-[#b87d1d] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Abra a sua app autenticadora e introduza o código temporário de 6 dígitos para desbloquear a sessão de administrador (nível AAL2).
                  </p>
                </div>

                {authStatus.verifiedFactors.length > 1 && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-600 mb-1">
                      Dispositivo Autenticador
                    </label>
                    <select
                      value={selectedFactorId}
                      onChange={(e) => setSelectedFactorId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#36210f]"
                    >
                      {authStatus.verifiedFactors.map((factor) => (
                        <option key={factor.id} value={factor.id}>
                          {factor.friendlyName || 'App Autenticadora'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Formulário do código TOTP de 6 dígitos */}
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div>
                <label
                  htmlFor="totp-code"
                  className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5"
                >
                  Código de 6 dígitos (TOTP)
                </label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-stone-300 text-center font-mono text-xl tracking-[0.4em] text-stone-900 focus:outline-none focus:border-[#36210f] tabular-nums"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || totpCode.length !== 6 || (isFirstTimeEnroll && !enrollData)}
                className="w-full py-3 bg-[#36210f] hover:bg-[#b87d1d] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={14} />
                <span>
                  {isSubmitting
                    ? 'A validar código...'
                    : isFirstTimeEnroll
                    ? 'Ativar 2FA e Entrar no Painel'
                    : 'Verificar e Aceder a /admin'}
                </span>
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-600 hover:text-[#36210f] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Site Público</span>
          </button>
        </div>
      </div>
    </div>
  );
};
