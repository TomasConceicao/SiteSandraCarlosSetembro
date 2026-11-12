import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useData } from "../../src/context/DataContext";

export interface Testimonial {
  id: string;
  text?: string;
  image?: string;
  fallbackImage?: string;
  name: string;
  role?: string;
  rating?: number;
}

export const defaultTestimonialImages: Record<string, { image: string; fallbackImage: string }> = {
  "testimonial-1": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-1.webp",
    fallbackImage: "/testimonials/testimonial-1.jpg",
  },
  "testimonial-2": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-2.webp",
    fallbackImage: "/testimonials/testimonial-2.jpg",
  },
  "testimonial-3": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-3.webp",
    fallbackImage: "/testimonials/testimonial-3.jpg",
  },
  "testimonial-4": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-4.webp",
    fallbackImage: "/testimonials/testimonial-4.jpg",
  },
  "testimonial-5": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-5.webp",
    fallbackImage: "/testimonials/testimonial-5.jpg",
  },
  "testimonial-6": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-6.webp",
    fallbackImage: "/testimonials/testimonial-6.jpg",
  },
  "testimonial-7": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-7.webp",
    fallbackImage: "/testimonials/testimonial-7.jpg",
  },
  "testimonial-8": {
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-8.webp",
    fallbackImage: "/testimonials/testimonial-8.jpg",
  },
};

export const initialTestimonialsData: Testimonial[] = [
  {
    id: "testimonial-1",
    text: "I live abroad and was introduced to Sandra while on holiday in Portugal by my auditor. The experience from then on was always of excellent professionalism. From great advise to availibility, knowledgeable, understanding, going out of her way and always friendly. From renting our apartment to eventually selling it was unbelievably amazing. I will recommend her services to everyone I know where I live and in Portugal. Well done Sandra. Forever greatful for your assistance. Good luck for the future dealings and wish you the very best in your job and private life.",
    name: "Nita Alegre",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-1.webp",
    fallbackImage: "/testimonials/testimonial-1.jpg",
  },
  {
    id: "testimonial-2",
    text: "Tive o enorme prazer de representar a cliente compradora num processo em que a Sandra Carlos era a consultora responsável pelo imóvel, e não poderia deixar de enaltecer o seu extraordinário profissionalismo. Ao longo de todo o processo demonstrou uma disponibilidade, paciência e calma excepcionais, tornando toda a negociação mais tranquila e transparente. Para além de ser uma excelente profissional, é um ser humano incrível, sempre atenciosa, respeitadora e dedicada. Foi um verdadeiro gosto trabalhar contigo, Sandra. Desejo-te o maior sucesso, tanto a nível profissional como pessoal. Mereces todas as conquistas que a vida te reservar! Grata por tudo! 🙏",
    name: "Cátia Ribeiro",
    role: "Consultora Imobiliária",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-2.webp",
    fallbackImage: "/testimonials/testimonial-2.jpg",
  },
  {
    id: "testimonial-3",
    text: "Excelência no atendimento e acompanhamento impecável em todas as fases do processo. Recomendo vivamente a sua dedicação e transparência.",
    name: "André Alves",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-3.webp",
    fallbackImage: "/testimonials/testimonial-3.jpg",
  },
  {
    id: "testimonial-4",
    text: "Diálogo fácil, especial capacidade na resolução de todas as dificuldades, papelada e procedimentos legais. Sempre disponível, com elevado sentido de responsabilidade e competência. Só posso recomendar.",
    name: "Luis Araujo",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-4.webp",
    fallbackImage: "/testimonials/testimonial-4.jpg",
  },
  {
    id: "testimonial-5",
    text: "A Sandra é uma colega daquelas que se quer ter sempre por perto, fácil de lidar e ajuda em todos os momentos. Conseguimos fechar um negócio com 200kms de distância entre as duas.",
    name: "Paula Fonseca",
    role: "Consultora Imobiliária",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-5.webp",
    fallbackImage: "/testimonials/testimonial-5.jpg",
  },
  {
    id: "testimonial-6",
    text: "Acompanhamento rigoroso em todas as etapas da escritura. Grande profissionalismo e honestidade.",
    name: "Richard Costa",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-6.webp",
    fallbackImage: "/testimonials/testimonial-6.jpg",
  },
  {
    id: "testimonial-7",
    text: "Processo de compra muito seguro, sem pressões e com esclarecimento de todas as dúvidas contratuais.",
    name: "Rodrigo Marques",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-7.webp",
    fallbackImage: "/testimonials/testimonial-7.jpg",
  },
  {
    id: "testimonial-8",
    text: "Excelente consultoria, muito atenciosa e focada nas necessidades da nossa família.",
    name: "Matilde Silva",
    role: "Cliente",
    rating: 5,
    image: "/testimonials/testemunho-cliente-imobiliaria-pombal-8.webp",
    fallbackImage: "/testimonials/testimonial-8.jpg",
  }
];

export const testimonialsData = initialTestimonialsData;

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || "SC").toUpperCase();
};

const MAX_CHAR_LIMIT = 350;

interface TestimonialCardProps {
  item: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rating = item.rating ?? 5;

  const defaultAsset = defaultTestimonialImages[item.id];
  const initialImage = item.image || defaultAsset?.image || item.fallbackImage || defaultAsset?.fallbackImage;
  const initialFallback = item.fallbackImage || defaultAsset?.fallbackImage;

  const [imgSrc, setImgSrc] = useState<string | undefined>(initialImage);
  const [imgError, setImgError] = useState(false);

  const hasText = Boolean(item.text && item.text.trim() !== '');
  const isLong = Boolean(hasText && item.text && item.text.length > MAX_CHAR_LIMIT);

  const getTruncatedText = (text: string) => {
    if (text.length <= MAX_CHAR_LIMIT) return text;
    const sliced = text.slice(0, MAX_CHAR_LIMIT);
    const lastSpace = sliced.lastIndexOf(" ");
    return lastSpace > 280 ? sliced.slice(0, lastSpace) : sliced;
  };

  const displayText = isLong && !isExpanded && item.text
    ? `${getTruncatedText(item.text)}...`
    : item.text;

  return (
    <div className="relative p-5 sm:p-6 border border-stone-200/90 rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white/95 backdrop-blur-sm flex flex-col justify-between max-w-xs transition-all duration-300 hover:shadow-md hover:border-stone-300 hover:-translate-y-0.5">
      {/* Review text - apenas aparece se preenchido */}
      {hasText ? (
        <div className="mb-4">
          <p className="font-sans text-stone-800 text-sm leading-relaxed font-normal inline">
            "{displayText}"
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="ml-1.5 inline-flex items-center gap-0.5 font-sans text-xs font-semibold text-[#784a0d] hover:text-[#36210f] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none underline underline-offset-2"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? "Ler menos" : "Ler mais"}</span>
              {isExpanded ? (
                <ChevronUp size={12} className="inline shrink-0" />
              ) : (
                <ChevronDown size={12} className="inline shrink-0" />
              )}
            </button>
          )}
        </div>
      ) : null}

      <div className={`flex items-center gap-3 ${hasText ? "pt-3 border-t border-stone-100" : ""}`}>
        {/* Fotografia do cliente ou Avatar Tipográfico com Monograma Editorial caso não exista foto */}
        {imgSrc && !imgError ? (
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#b87d1d]/30 shadow-xs bg-[#f6f2ec]">
            <img
              src={imgSrc}
              alt={`Fotografia de ${item.name} - Testemunho Sandra Carlos Consultoria Imobiliária`}
              className="w-full h-full object-cover object-center filter contrast-[1.03]"
              loading="lazy"
              width={44}
              height={44}
              onError={() => {
                if (imgSrc !== initialFallback && initialFallback) {
                  setImgSrc(initialFallback);
                } else {
                  setImgError(true);
                }
              }}
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="w-11 h-11 rounded-full bg-[#36210f] text-[#d8be9e] flex items-center justify-center font-sans font-bold text-xs tracking-wider border border-[#8a5d14]/40 shrink-0 shadow-xs select-none"
          >
            {getInitials(item.name)}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-sans font-semibold text-stone-900 text-xs tracking-wider uppercase">
              {item.name}
            </span>
            <div className="flex items-center gap-0.5 shrink-0" aria-label={`Classificação: ${rating} de 5 estrelas`}>
              {[...Array(rating)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="fill-[#8a5d14] text-[#8a5d14]"
                />
              ))}
            </div>
          </div>
          {/* Cargo/Role com contraste superior WCAG AA */}
          {item.role && item.role.trim() !== '' && (
            <span className="font-sans text-[11px] text-[#784a0d] uppercase tracking-wider font-semibold mt-0.5">
              {item.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const TestimonialsColumn = ({
  testimonials,
  className = "",
  duration = 10,
}: {
  testimonials: Testimonial[];
  className?: string;
  duration?: number | string;
}) => {
  const parsedDuration = typeof duration === "string" ? parseInt(duration.replace(/\D/g, ""), 10) || 10 : duration;

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: parsedDuration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...testimonials, ...testimonials].map((item, index) => (
          <TestimonialCard
            key={`${item.id}-${index}`}
            item={item}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const Testimonials: React.FC = () => {
  const { reviews, siteSettings } = useData();
  const list = reviews && reviews.length > 0 ? reviews : initialTestimonialsData;

  if (list.length === 0) return null;

  // Distribuição equilibrada em 3 colunas
  const col1: Testimonial[] = [];
  const col2: Testimonial[] = [];
  const col3: Testimonial[] = [];

  list.forEach((item, index) => {
    if (index % 3 === 0) col1.push(item);
    else if (index % 3 === 1) col2.push(item);
    else col3.push(item);
  });

  return (
    <section id="testimonials-section" className="bg-[#faf8f5] text-stone-900 my-0 relative overflow-hidden py-20 sm:py-28 border-t border-stone-200/60">
      <div className="container z-10 mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[620px] mx-auto text-center"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#784a0d] font-semibold font-sans mb-3 block">
            {siteSettings.texts.testimonialsEyebrow}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-[0.18em] text-stone-900 font-sans uppercase">
            {siteSettings.texts.testimonialsTitle}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-3 font-sans font-normal tracking-wide">
            {siteSettings.texts.testimonialsSubtitle}
          </p>
          <div className="mt-3 py-1.5 px-3 bg-stone-100/80 border border-stone-200/80 inline-block">
            <p className="text-[11px] text-stone-600 font-sans font-light italic">
              Avaliações e testemunhos recolhidos junto de clientes e parceiros acompanhados em processos de mediação imobiliária.
            </p>
          </div>
        </motion.div>

        {/* Columns Grid */}
        <div className="flex justify-center gap-6 mt-12 sm:mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[580px] overflow-hidden">
          <TestimonialsColumn
            duration={24}
            testimonials={col1.length > 0 ? col1 : list}
          />
          <TestimonialsColumn
            className="hidden md:block"
            duration={28}
            testimonials={col2.length > 0 ? col2 : list}
          />
          <TestimonialsColumn
            className="hidden lg:block"
            duration={26}
            testimonials={col3.length > 0 ? col3 : list}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
