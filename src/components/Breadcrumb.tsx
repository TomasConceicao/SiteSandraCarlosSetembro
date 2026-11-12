import React from 'react';
import { PageType } from '../types';

export interface BreadcrumbItem {
  name: string;
  page?: PageType;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (page: PageType) => void;
  className?: string;
  variant?: 'light' | 'dark';
}

const getPageHref = (page?: PageType, customHref?: string): string => {
  if (customHref) return customHref;
  switch (page) {
    case 'home':
      return '/';
    case 'imoveis':
      return '/imoveis';
    case 'sobre':
      return '/sobre';
    case 'contacto':
      return '/contatos';
    case 'privacidade':
      return '/politica-de-privacidade';
    case 'termos':
      return '/termos-e-condicoes';
    default:
      return '/';
  }
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = '',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <nav
      aria-label="Caminho de navegação (Breadcrumbs)"
      className={`max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-3 sm:py-4 text-[11px] uppercase tracking-[0.2em] font-sans ${
        isDark ? 'text-stone-300' : 'text-stone-500'
      } ${className}`}
    >
      <ol
        className="flex items-center flex-wrap gap-1.5 sm:gap-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Item 1: Início */}
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          className="flex items-center"
        >
          <a
            href="/"
            itemProp="item"
            onClick={(e) => {
              if (onNavigate && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`transition-colors cursor-pointer no-underline ${
              isDark ? 'text-stone-300 hover:text-white' : 'text-stone-500 hover:text-[#b87d1d]'
            }`}
          >
            <span itemProp="name">Início</span>
          </a>
          <meta itemProp="position" content="1" />
        </li>

        {/* Dynamic Items */}
        {items.map((item, index) => {
          const position = index + 2;
          const isLast = index === items.length - 1;
          const href = getPageHref(item.page, item.href);

          return (
            <li
              key={`${item.name}-${index}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center"
            >
              <span
                className={`mx-1.5 sm:mx-2 font-light select-none ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}
                aria-hidden="true"
              >
                /
              </span>
              {isLast ? (
                <span
                  itemProp="name"
                  className={`font-semibold truncate max-w-[200px] sm:max-w-md ${
                    isDark ? 'text-white' : 'text-stone-900'
                  }`}
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={href}
                  itemProp="item"
                  onClick={(e) => {
                    if (onNavigate && item.page && !e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onNavigate(item.page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`transition-colors cursor-pointer no-underline ${
                    isDark ? 'text-stone-300 hover:text-white' : 'text-stone-500 hover:text-[#b87d1d]'
                  }`}
                >
                  <span itemProp="name">{item.name}</span>
                </a>
              )}
              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

