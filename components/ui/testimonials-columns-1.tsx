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

export const initialTestimonialsData: Testimonial[] = [
  {
    id: "testimonial-1",
    text: "I live abroad and was introduced to Sandra while on holiday in Portugal by my auditor. The experience from then on was always of excellent professionalism. From great advise to availibility, knowledgeable, understanding, going out of her way and always friendly. From renting our apartment to eventually selling it was unbelievably amazing. I will recommend her services to everyone I know where I live and in Portugal. Well done Sandra. Forever greatful for your assistance. Good luck for the future dealings and wish you the very best in your job and private life.",
    image: "/testimonials/testimonial-1.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    name: "Nita Alegre",
    role: "Cliente",
    rating: 5,
  },
  {
    id: "testimonial-2",
    text: "Tive o enorme prazer de representar a cliente compradora num processo em que a Sandra Carlos era a consultora responsável pelo imóvel, e não poderia deixar de enaltecer o seu extraordinário profissionalismo. Ao longo de todo o processo demonstrou uma disponibilidade, paciência e calma excepcionais, tornando toda a negociação mais tranquila e transparente. Para além de ser uma excelente profissional, é um ser humano incrível, sempre atenciosa, respeitadora e dedicada. Foi um verdadeiro gosto trabalhar contigo, Sandra. Desejo-te o maior sucesso, tanto a nível profissional como pessoal. Mereces todas as conquistas que a vida te reservar! Grata por tudo! 🙏",
    image: "/testimonials/testimonial-2.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    name: "Cátia Ribeiro",
    role: "Consultora Imobiliária",
    rating: 5,
  },
  {
    id: "testimonial-3",
    text: "Excelência no atendimento e acompanhamento impecável em todas as fases do processo. Recomendo",
    image: "/testimonials/testimonial-3.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    name: "André Alves",
    role: "Cliente",
    rating: 5,
  },
  {
    id: "testimonial-4",
    text: "Diálogo fácil, especial capacidade na resolução de todas as dificuldades, papelada, procedimentos. Sempre disponível, com elevado sentido de responsabilidade e competência. Só posso recomendar.",
    image: "/testimonials/testimonial-4.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    name: "Luis Araujo",
    role: "Cliente",
    rating: 5,
  },
  {
    id: "testimonial-5",
    text: "A Sandra é uma colega daquelas que se quer ter sempre por perto, fácil de lidar e ajuda em todos os momentos. Conseguimos fechar um negócio com 200kms de distância entre as duas.",
    image: "/testimonials/testimonial-5.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    name: "Paula Fonseca",
    role: "Consultora Imobiliária",
    rating: 5,
  },
  {
    id: "testimonial-6",
    text: "",
    image: "/testimonials/testimonial-6.jpg?v=2",
    fallbackImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    name: "Richard Costa",
    role: "Cliente",
    rating: 5,
  },
  {
    id: "testimonial-7",
    text: "",
    image: "/testimonials/testimonial-7.jpg?v=2",
    fallbackImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    name: "Rodrigo Marques",
    role: "Cliente",
    rating: 5,
  },
  {
    id: "testimonial-8",
    text: "",
    image: "/testimonials/testimonial-8.jpg?v=2",
    fallbackImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    name: "Matilde",
    role: "Cliente",
    rating: 5,
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
  const [imgSrc, setImgSrc] = useState<string>(item.image || '');
  const [imgFailed, setImgFailed] = useState(!item.image);
  const [isExpanded, setIsExpanded] = useState(false);
  const rating = item.rating ?? 5;

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
    <div className="relative p-5 sm:p-6 border border-stone-200/90 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white/95 backdrop-blur-sm flex flex-col justify-between max-w-xs transition-all duration-300 hover:shadow-md hover:border-stone-300 hover:-translate-y-0.5">
      {/* Review text - Regra de Ouro: apenas aparece se preenchido */}
      {hasText ? (
        <div className="mb-4">
          <p className="font-sans text-stone-700 text-sm leading-relaxed font-normal inline">
            "{displayText}"
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="ml-1.5 inline-flex items-center gap-0.5 font-sans text-xs font-semibold text-[#b87d1d] hover:text-[#8a5b0e] transition-colors cursor-pointer focus:outline-none underline underline-offset-2"
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
        <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-stone-200 shrink-0">
          {!imgFailed && imgSrc ? (
            <img
              src={imgSrc}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => {
                if (item.fallbackImage && imgSrc !== item.fallbackImage) {
                  setImgSrc(item.fallbackImage);
                } else {
                  setImgFailed(true);
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#36210f] text-[#d8be9e] flex items-center justify-center font-sans font-semibold text-xs tracking-wider">
              {getInitials(item.name)}
            </div>
          )}
        </div>

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
                  className="fill-[#b87d1d] text-[#b87d1d]"
                />
              ))}
            </div>
          </div>
          {/* Cargo/Role - Regra de Ouro: apenas aparece se preenchido */}
          {item.role && item.role.trim() !== '' && (
            <span className="font-sans text-[11px] text-[#b87d1d] uppercase tracking-wider font-medium mt-0.5">
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
  const { reviews } = useData();
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
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#b87d1d] font-semibold font-sans mb-3 block">
            CONFIANÇA & RESULTADOS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-[0.18em] text-stone-900 font-sans uppercase">
            TESTEMUNHOS
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-3 font-sans font-normal tracking-wide">
            O que dizem as famílias e parceiros que confiaram no meu acompanhamento em Pombal
          </p>
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
