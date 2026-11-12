import { Property } from '../types';

export const properties: Property[] = [
  {
    id: 'moradia-pombal-centro',
    title: 'Moradia Contemporânea com Jardim',
    subtitle: 'Exclusividade, Conforto e Arquitetura Contemporânea no Centro de Pombal',
    status: 'novidade',
    location: 'Pombal Centro, Pombal',
    address: 'Avenida Heróis do Ultramar, Pombal Centro, 3100-450 Pombal',
    typology: 'Moradia Unifamiliar T4',
    area: '360 m²',
    bedrooms: 4,
    bathrooms: 4,
    halfBaths: 1,
    year: '2023',
    price: '€ 485.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', // ou espaço para vídeo
    mapCoordinates: {
      lat: 39.9168,
      lng: -8.6285,
      zoom: 16,
      precision: 'exata', // Opção 1: 'exata' (com pino no local exato)
    },
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Excelente moradia de linhas contemporâneas localizada em zona nobre de Pombal. Destaca-se pelas amplas áreas sociais, acabamentos de qualidade superior e luminosidade natural em todas as divisões.',
    extendedDescription: [
      'Inserida numa das zonas residenciais mais prestigiadas e calmas de Pombal, esta propriedade combina arquitetura vanguardista com materiais nobres e sustentáveis.',
      'O rés-do-chão acolhe um generoso salão banhado de luz natural graças a envidraçados de grandes dimensões com ligação direta ao jardim e ao deck exterior. A cozinha, desenvolvida em conceito open-space com ilha central de convívio, encontra-se totalmente equipada com tecnologia de topo.',
      'No piso superior situam-se quatro amplos quartos, incluindo a suíte master com closet personalizado e casa de banho com revestimento em pedra natural. O espaço exterior foi pensado ao detalhe para lazer em família com total privacidade.'
    ],
    architecturalHighlights: [
      'Ampla sala de estar e jantar com ligação direta ao jardim privativo',
      'Cozinha moderna totalmente equipada com ilha de apoio',
      'Suíte principal com closet e varanda panorâmica',
      'Painéis solares e excelente eficiência energética'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '4 (1 Suíte Master)' },
      { label: 'Casas de Banho Completas', value: '3' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Soalho em Carvalho Natural e Pedra Moleanos' },
      { label: 'Eletrodomésticos', value: 'Placa de Indução, Forno Pirolítico, Frigorífico Americano, Micro-ondas, Máquina de Lavar Louça, Cave de Vinhos' },
      { label: 'Outras Características Interiores', value: 'Roupeiros Embutidos Lacados, Estores Elétricos Térmicos, Closet Walk-in, Aspiração Central, Despensa e Lavandaria' }
    ],
    exteriorFeatures: [
      { label: 'Pisos / Andares', value: '2 Pisos' },
      { label: 'Garagem / Estacionamento', value: 'Garagem Fechada p/ 2 Viaturas + Pátio p/ 2' },
      { label: 'Piscina', value: 'Privativa com Deck de Madeira e Pré-instalação de Aquecimento' },
      { label: 'Espaço Exterior / Jardim', value: 'Jardim Relvado com Rega Automática Inteligente' },
      { label: 'Cobertura / Telhado', value: 'Plana com Impermeabilização Dupla e Isolamento Térmico' },
      { label: 'Características do Lote', value: 'Murado, Portão Automático, Zona de Barbecue' },
      { label: 'Climatização & Aquecimento', value: 'Bomba de Calor e Piso Radiante Hidráulico' },
      { label: 'Ar Condicionado', value: 'Sistema Central por Condutas Inverter' },
      { label: 'Outras Características Exteriores', value: 'Painéis Solares Térmicos e Fotovoltaicos, Iluminação LED Exterior' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Pombal Centro' },
      { label: 'Estilo Arquitetónico', value: 'Contemporâneo Minimalista' },
      { label: 'Vistas', value: 'Vista Urbana Desafogada sobre o Castelo de Pombal' },
      { label: 'Orientação Solar', value: 'Nascente / Sul / Poente' },
      { label: 'Ano de Construção', value: '2023' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 485.000' },
      { label: 'Certificação Energética', value: 'A+ (Excelente Desempenho)' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' },
      { label: 'Condomínio', value: 'Não Aplicável (Propriedade Independente)' }
    ]
  },
  {
    id: 'apartamento-centro-pombal',
    title: 'Apartamento T3 Renovado',
    subtitle: 'Elegância e Centralidade com Vistas Urbanas no Coração de Pombal',
    status: 'reservado',
    location: 'Pombal Centro, Pombal',
    address: 'Rua do Cais, Pombal Centro, 3100-440 Pombal',
    typology: 'Apartamento T3',
    area: '180 m²',
    bedrooms: 3,
    bathrooms: 2,
    halfBaths: 1,
    year: '2024',
    price: '€ 285.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    mapCoordinates: {
      lat: 39.9145,
      lng: -8.6262,
      zoom: 15,
      precision: 'certa', // Opção 2: 'certa' (círculo com raio aproximado em volta para não se saber ao certo onde fica)
      circleRadius: 350,
    },
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Apartamento espaçoso com remodelação cuidada no coração de Pombal, próximo de todos os serviços, comércio e escolas. Espaços generosos, materiais de qualidade e varandas com ótima exposição solar.',
    extendedDescription: [
      'Totalmente intervencionado em 2024 com materiais de primeira linha, este apartamento de charme oferece o equilíbrio ideal entre tranquilidade e a comodidade de viver a passos do comércio tradicional, serviços e escolas.',
      'Possui uma sala de estar ampla com varanda voltada a poente, cozinha moderna equipada, suíte com closet privativo e duas generosas casas de banho com louças suspensas.',
      'Inclui lugar de garagem fechado (box) na cave do edifício e arrecadação individual.'
    ],
    architecturalHighlights: [
      'Localização central com acesso pedonal a comércio e serviços',
      'Cozinha em conceito aberto integrada com a zona de refeições',
      'Garagem fechada para duas viaturas e espaço de arrumos',
      'Climatização completa e caixilharia de corte térmico com vidros duplos'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '3 (1 Suíte)' },
      { label: 'Casas de Banho Completas', value: '2' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Vinílico Flutuante de Alta Resistência e Mosaico Retificado' },
      { label: 'Eletrodomésticos', value: 'Placa, Forno, Exaustor Encastrado, Micro-ondas, Frigorífico Combinado' },
      { label: 'Outras Características Interiores', value: 'Teto Falso com Iluminação LED Indireta, Caixilharia PVC com Vidro Duplo' }
    ],
    exteriorFeatures: [
      { label: 'Pisos / Andar', value: '3º Andar com Elevador' },
      { label: 'Garagem / Estacionamento', value: 'Box Fechada no Edifício para 1 Viatura + Moto' },
      { label: 'Varandas / Terraços', value: '2 Varandas Panorâmicas com Guarda-corpos em Vidro' },
      { label: 'Climatização', value: 'Ar Condicionado Multi-Split Inverter em todas as divisões' },
      { label: 'Segurança', value: 'Porta Blindada Dierre, Video-porteiro a Cores' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Pombal Centro' },
      { label: 'Estilo Arquitetónico', value: 'Renovado Contemporâneo' },
      { label: 'Vistas', value: 'Vistas Panorâmicas sobre a Cidade' },
      { label: 'Orientação Solar', value: 'Sul / Poente' },
      { label: 'Ano de Renovação', value: '2024' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 285.000' },
      { label: 'Certificação Energética', value: 'B (Muito Eficiente)' },
      { label: 'Quota de Condomínio', value: '38 € / Mês' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' }
    ]
  },
  {
    id: 'moradia-touriscal-pombal',
    title: 'Moradia Familiar com Piscina',
    subtitle: 'Refúgio de Serenidade com Piscina Privativa e Extenso Lote Ajardinado',
    status: 'disponivel',
    location: 'Louriçal, Pombal',
    address: 'Rua das Flores, Vila do Louriçal, 3105-180 Pombal',
    typology: 'Moradia T4 Isolada',
    area: '420 m²',
    bedrooms: 4,
    bathrooms: 4,
    halfBaths: 1,
    year: '2023',
    price: '€ 540.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    mapCoordinates: {
      lat: 40.0033,
      lng: -8.7344,
      zoom: 15,
      precision: 'exata',
    },
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Moradia isolada inserida num lote generoso na vila do Louriçal. Um refúgio perfeito para famílias que privilegiam a tranquilidade, o convívio ao ar livre e a proximidade a Pombal e às praias da região.',
    extendedDescription: [
      'Implantada num lote privativo de mais de 1.200 m², esta moradia familiar destaca-se pela sua arquitetura acolhedora e zonas sociais viradas para o jardim privativo e para a magnífica piscina aquecida.',
      'O salão principal dispõe de lareira com recuperador de calor, tetos altos em madeira tratada e acesso direto a um alpendre com churrasqueira tradicional.',
      'A apenas 15 minutos do centro de Pombal e a curta distância das praias do litoral oeste, oferece uma qualidade de vida ímpar para quem valoriza espaço e privacidade.'
    ],
    architecturalHighlights: [
      'Piscina exterior com zona de solário e telheiro com churrasqueira',
      'Lote ajardinado com rega automática e furo artesiano',
      'Salão de convívio e sala de jogos com lareira rústica',
      'Estacionamento coberto para várias viaturas e portão automático'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '4 (2 Suítes)' },
      { label: 'Casas de Banho Completas', value: '3' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Madeira Maciça nos Quartos e Grés Rústico nas Áreas Sociais' },
      { label: 'Eletrodomésticos', value: 'Cozinha Completa de Fabrico Alemão com Forno a Vapor e Frigorífico Duplo' },
      { label: 'Outras Características Interiores', value: 'Sala de Jogos, Garrafeira Climatizada, Lareira com Recuperador, Closet' }
    ],
    exteriorFeatures: [
      { label: 'Pisos / Andares', value: '2 Pisos' },
      { label: 'Garagem / Estacionamento', value: 'Garagem Fechada p/ 3 Carros + Estacionamento Exterior' },
      { label: 'Piscina', value: 'Piscina de Água Salgada com Tratamento Automático e Cobertura Térmica' },
      { label: 'Lote Privativo', value: '1.250 m² com Furo Artesiano e Pomar com Árvores de Fruto' },
      { label: 'Anexos Exteriores', value: 'Telheiro com Forno a Lenha e Churrasqueira, Balneários de Apoio' },
      { label: 'Climatização', value: 'Aquecimento Central a Pellets e Ar Condicionado' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Louriçal, Pombal' },
      { label: 'Estilo Arquitetónico', value: 'Tradicional Modernizado' },
      { label: 'Vistas', value: 'Campos Verdes e Vistas Desafogadas' },
      { label: 'Orientação Solar', value: 'Nascente / Sul / Poente' },
      { label: 'Ano de Construção', value: '2023' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 540.000' },
      { label: 'Certificação Energética', value: 'A (Elevada Eficiência)' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' },
      { label: 'Condomínio', value: 'Não Aplicável' }
    ]
  },
  {
    id: 'quinta-redinha-pombal',
    title: 'Quinta Senhorial de Cantaria',
    subtitle: 'Propriedade Histórica de Prestígio com Cantaria e Vistas Sobre o Vale de Sicó',
    status: 'vendido',
    location: 'Redinha, Pombal',
    address: 'Estrada da Serra, Freguesia da Redinha, 3105-320 Pombal',
    typology: 'Quinta Residencial T4',
    area: '480 m²',
    bedrooms: 4,
    bathrooms: 3,
    halfBaths: 1,
    year: '2022',
    price: '€ 420.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    mapCoordinates: {
      lat: 39.9886,
      lng: -8.5833,
      zoom: 15,
      precision: 'certa', // Círculo aproximado
      circleRadius: 480,
    },
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Propriedade senhorial de charme na histórica freguesia da Redinha, com vistas desafogadas sobre o vale e a serra de Sicó. Alia a traça tradicional portuguesa ao conforto atual, com olival e pomar privativo.',
    extendedDescription: [
      'Uma quinta singular com caráter nobre e paredes centenárias em pedra calcária de cantaria, totalmente reabilitada com extremo bom gosto para satisfazer os mais exigentes padrões contemporâneos.',
      'A envolvente exterior de 3.500 m² integra olival centenário, vinha em socalcos e um poço tradicional com nascente natural. Os espaços interiores conservam vigamentos em madeira exposta, lareiras nobres e pé direito imponente.',
      'Possui ainda anexo independente com adega histórica e espaço para eventos ou alojamento adicional de hóspedes.'
    ],
    architecturalHighlights: [
      'Paredes em cantaria tradicional e detalhes em madeira nobre',
      'Envolvente com mais de 3.500 m² murados com olival centenário e pomar',
      'Adega tradicional e anexo rústico para receber amigos e família',
      'Privacidade total a poucos minutos do centro de Pombal'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '4 (1 Suíte Master com Varanda de Pedra)' },
      { label: 'Casas de Banho Completas', value: '3' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Tijoleira Rústica Tradicional e Carvalho Francês' },
      { label: 'Eletrodomésticos', value: 'Fogão Tradicional a Gás com Forno Duplo, Exaustor em Cobre, Lava-louça em Pedra' },
      { label: 'Outras Características Interiores', value: 'Adega com Prensas Tradicionais, Forno a Lenha Interior, Escritório com Biblioteca' }
    ],
    exteriorFeatures: [
      { label: 'Área do Lote', value: '3.650 m² Murados e Vedados' },
      { label: 'Garagem / Estacionamento', value: 'Alpendre p/ 4 Viaturas + Pátio Amplo em Calçada Portuguesa' },
      { label: 'Água e Rega', value: 'Poço com Bomba Submersível, Tanque em Pedra Tradicional' },
      { label: 'Vegetação', value: 'Olival Produtivo, Sobreiros, Árvores de Fruto e Vinha' },
      { label: 'Aquecimento', value: 'Caldeira Central a Biomassa e Recuperador de Calor Dupla Face' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Redinha, Pombal' },
      { label: 'Estilo Arquitetónico', value: 'Quinta Senhorial Portuguesa / Rústico Nobre' },
      { label: 'Vistas', value: 'Panorâmica 360º sobre a Serra de Sicó e o Vale' },
      { label: 'Orientação Solar', value: 'Nascente / Sul' },
      { label: 'Ano de Renovação', value: '2022' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 420.000' },
      { label: 'Certificação Energética', value: 'B- (Conforto Garantido)' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' },
      { label: 'Condomínio', value: 'Não Aplicável' }
    ]
  },
  {
    id: 'moradia-meirinhas-pombal',
    title: 'Moradia Térrea T3',
    subtitle: 'Funcionalidade Pura, Acessibilidade e Sustentabilidade em Meirinhas',
    status: 'novidade',
    location: 'Meirinhas, Pombal',
    address: 'Rua Principal, Meirinhas, 3105-250 Pombal',
    typology: 'Moradia Térrea T3',
    area: '240 m²',
    bedrooms: 3,
    bathrooms: 2,
    halfBaths: 1,
    year: '2024',
    price: '€ 335.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    mapCoordinates: {
      lat: 39.8458,
      lng: -8.6922,
      zoom: 15,
    },
    image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Confortável moradia térrea em Meirinhas, desenhada para proporcionar máxima acessibilidade e funcionalidade no dia a dia. Envolvente residencial serena com rápido acesso ao IC2 e à cidade de Pombal.',
    extendedDescription: [
      'Construção totalmente nova de piso térreo sem escadas ou desníveis, concebida a pensar no conforto intemporal da família.',
      'O coração da casa é uma zona social ampla com cozinha em ilha e sala integradas, fluindo naturalmente para um terraço coberto virado a sul com churrasqueira.',
      'Excelente isolamento térmico e acústico (capoto exterior e lã de rocha), climatização por bomba de calor e pré-instalação para carregamento de veículos elétricos.'
    ],
    architecturalHighlights: [
      'Construção integralmente térrea sem barreiras arquitetónicas',
      'Alpendre coberto virado a sul com barbecue integrado',
      'Garagem espaçosa e lavandaria independente',
      'Bomba de calor e pré-instalação de ar condicionado'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '3 (1 Suíte com Closet)' },
      { label: 'Casas de Banho Completas', value: '2' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Flutuante AC5 Hidrófugo e Cerâmica Retificada' },
      { label: 'Eletrodomésticos', value: 'Equipamento Completo Balay com Placa de Extração Integrada' },
      { label: 'Outras Características Interiores', value: 'Portas Interiores até ao Teto, Estores Térmicos Motorizados, Iluminação LED' }
    ],
    exteriorFeatures: [
      { label: 'Pisos / Andares', value: 'Térrea (Piso Único)' },
      { label: 'Garagem / Estacionamento', value: 'Garagem Fechada p/ 2 Carros com Tomada VE' },
      { label: 'Jardim / Lote', value: 'Lote de 750 m² com Espaço para Instalação de Piscina' },
      { label: 'Terraço', value: 'Alpendre Coberto de 35 m² com Churrasqueira e Bancada de Apoio' },
      { label: 'Climatização & Águas', value: 'Bomba de Calor para AQS e Ar Condicionado Completo' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Meirinhas, Pombal' },
      { label: 'Estilo Arquitetónico', value: 'Térrea Contemporânea' },
      { label: 'Vistas', value: 'Envolvente Residencial Tranquila' },
      { label: 'Orientação Solar', value: 'Sul / Poente' },
      { label: 'Ano de Construção', value: '2024' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 335.000' },
      { label: 'Certificação Energética', value: 'A+ (Máxima Eficiência)' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' },
      { label: 'Condomínio', value: 'Não Aplicável' }
    ]
  },
  {
    id: 'moradia-pelariga-pombal',
    title: 'Moradia com Vista Desafogada',
    subtitle: 'Conforto Familiar, Lareira Nobre e Vistas Campestres na Pelariga',
    status: 'disponivel',
    location: 'Pelariga, Pombal',
    address: 'Caminho do Alto, Freguesia da Pelariga, 3105-390 Pombal',
    typology: 'Moradia V3+1',
    area: '290 m²',
    bedrooms: 3,
    bathrooms: 2,
    halfBaths: 1,
    year: '2023',
    price: '€ 310.000',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    mapCoordinates: {
      lat: 39.9575,
      lng: -8.6019,
      zoom: 15,
    },
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&fm=webp&w=1600&q=85',
    secondaryImages: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&fm=webp&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&fm=webp&w=1600&q=85'
    ],
    description: 'Moradia acolhedora situada na Pelariga, com vista desafogada sobre a paisagem campestre. Uma excelente oportunidade para famílias que procuram qualidade de vida, tranquilidade e facilidade de acessos.',
    extendedDescription: [
      'Localizada numa encosta soalheira da freguesia da Pelariga, esta moradia beneficia de uma vista desafogada privilegiada e de uma exposição solar invejável nascente-poente.',
      'A sala de estar conta com lareira tradicional com recuperador de calor, ligando-se a um terraço panorâmico perfeito para refeições ao ar livre nos dias amenos.',
      'Dispõe ainda de uma divisão multiusos (escritório ou 4º quarto), cozinha regional com despensa e cave ampla com espaço para oficina ou garrafeira.'
    ],
    architecturalHighlights: [
      'Terraço panorâmico com ampla vista para a natureza envolvente',
      'Lareira com recuperador de calor na sala de estar',
      'Cozinha com móveis em madeira e despensa espaçosa',
      'Excelente exposição solar nascente-poente ao longo de todo o ano'
    ],
    interiorFeatures: [
      { label: 'Total de Quartos', value: '3+1 (1 Suíte + Escritório)' },
      { label: 'Casas de Banho Completas', value: '2' },
      { label: 'Lavabos Sociais', value: '1' },
      { label: 'Pavimento', value: 'Madeira Tratada e Tijoleira Cerâmica' },
      { label: 'Eletrodomésticos', value: 'Placa, Forno Elétrico, Exaustor Campânula, Esquentador Inteligente' },
      { label: 'Outras Características Interiores', value: 'Lareira com Recuperador, Sótão com Bom Pé Direito, Caixilharia com Vidro Duplo' }
    ],
    exteriorFeatures: [
      { label: 'Pisos / Andares', value: '2 Pisos + Cave' },
      { label: 'Garagem / Estacionamento', value: 'Garagem Fechada p/ 2 Carros + Zona de Bricolage' },
      { label: 'Terraço Panorâmico', value: 'Terraço Amplo de 28 m² com Vista Desafogada' },
      { label: 'Jardim / Quintal', value: 'Quintal com Pequena Horta e Árvores de Fruto' },
      { label: 'Climatização', value: 'Recuperador de Calor com Saídas de Ar Quente para os Quartos' }
    ],
    detailsFeatures: [
      { label: 'Localização / Freguesia', value: 'Pelariga, Pombal' },
      { label: 'Estilo Arquitetónico', value: 'Tradicional Contemporânea' },
      { label: 'Vistas', value: 'Vista Panorâmica sobre os Vales e Campos da Pelariga' },
      { label: 'Orientação Solar', value: 'Nascente / Poente' },
      { label: 'Ano de Construção', value: '2023' }
    ],
    financialDetails: [
      { label: 'Preço de Venda', value: '€ 310.000' },
      { label: 'Certificação Energética', value: 'C (Com Excelente Potencial)' },
      { label: 'IMI Anual Estimado', value: 'Sob Consulta' },
      { label: 'Condomínio', value: 'Não Aplicável' }
    ]
  }
];
