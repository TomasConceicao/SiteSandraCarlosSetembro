import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, LocationPrecision } from '../types';
import { Layers, Navigation, Plus, Minus, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

// Carto Basemaps API key
const CARTO_KEY = 'cb1_3qpx_1_70337228c618cf45f0458d0c';

interface PropertyMapProps {
  property: Property;
  initialPrecision?: LocationPrecision;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ property, initialPrecision }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer references
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const zoneMarkerRef = useRef<L.Marker | null>(null);

  // Precision mode definido no admin para este imóvel: 'exata' (pin no local) ou 'certa' (círculo com raio de zona para salvaguarda de privacidade)
  const precision: LocationPrecision =
    initialPrecision ||
    property.mapCoordinates?.precision ||
    property.locationPrecision ||
    'exata';

  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const [currentZoom, setCurrentZoom] = useState<number>(property.mapCoordinates?.zoom || 15);

  const lat = property.mapCoordinates?.lat || 39.9168;
  const lng = property.mapCoordinates?.lng || -8.6285;
  const circleRadius = property.mapCoordinates?.circleRadius || 380; // Raio em metros

  // 1. Inicializar Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: currentZoom,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Tile layers com a chave CARTO fornecida pelo utilizador
    const CARTO_KEY = 'cb1_3qpx_1_70337228c618cf45f0458d0c';
    const streetTile = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
        maxZoom: 19,
      }
    );

    const activeTile = mapLayer === 'satellite' ? satelliteTile : streetTile;
    activeTile.addTo(map);
    tileLayerRef.current = activeTile;

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const handleResize = () => {
      map.invalidateSize();
    };
    const timer1 = setTimeout(handleResize, 150);
    const timer2 = setTimeout(handleResize, 500);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng]);

  // 2. Renderizar / Alternar entre Localização 'exata' e 'certa' (círculo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpar elementos anteriores
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (zoneMarkerRef.current) {
      map.removeLayer(zoneMarkerRef.current);
      zoneMarkerRef.current = null;
    }

    if (precision === 'exata') {
      // OPÇÃO 1: LOCALIZAÇÃO EXATA (Pino de luxo apontado no local preciso)
      const customIcon = L.divIcon({
        className: 'custom-leaflet-luxury-pin',
        html: `
          <div style="width: 36px; height: 42px; position: relative;">
            <div style="position: absolute; top: -4px; left: -4px; width: 44px; height: 44px; border-radius: 9999px; background-color: rgba(214, 146, 11, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
            <div style="width: 36px; height: 36px; border-radius: 9999px; background-color: #422502; border: 2.5px solid #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; color: #D6920B; position: relative; z-index: 10;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#D6920B" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" fill="#422502" />
              </svg>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #422502; position: absolute; top: 34px; left: 12px; z-index: 9;"></div>
            <div style="position: absolute; top: 46px; left: 50%; transform: translateX(-50%); padding: 3px 8px; background-color: rgba(66, 37, 2, 0.95); color: #ffffff; border: 1px solid rgba(214, 146, 11, 0.6); font-family: sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border-radius: 2px; pointer-events: none;">
              ${property.title}
            </div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      const popupContent = document.createElement('div');
      popupContent.className = 'font-sans text-stone-900 p-1 min-w-[210px] max-w-[270px]';
      popupContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #D6920B; font-weight: 700;">Localização Exata</span>
          <h4 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #422502; margin: 0; line-height: 1.25;">${property.title}</h4>
          <p style="font-size: 11px; color: #57534e; margin: 0; line-height: 1.35;">${property.address || property.location}</p>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e7e5e4; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 700; color: #D6920B;">${property.price || 'Sob Consulta'}</span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #ffffff; text-decoration: none; padding: 4px 8px; background-color: #422502; border-radius: 2px;">
              <span>Traçar Rota</span> &rarr;
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { autoPan: false });
    } else {
      // OPÇÃO 2: LOCALIZAÇÃO CERTA / APROXIMADA (Círculo de zona envolvente)
      // Desenha um círculo com raio em metros para não se saber a localização exata
      const circle = L.circle([lat, lng], {
        radius: circleRadius,
        color: '#D6920B',
        weight: 2,
        opacity: 0.85,
        dashArray: '6, 8',
        fillColor: '#b38b59',
        fillOpacity: 0.22,
      }).addTo(map);
      circleRef.current = circle;

      // Marcador central discreto de zona envolvente
      const zoneCenterIcon = L.divIcon({
        className: 'custom-leaflet-zone-center',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: pointer;">
            <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #422502; border: 2px solid #D6920B; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.35); color: #D6920B;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <circle cx="12" cy="12" r="3" fill="#D6920B"></circle>
              </svg>
            </div>
            <div style="margin-top: 6px; padding: 3px 8px; background-color: rgba(66, 37, 2, 0.95); color: #ffffff; border: 1px solid rgba(214, 146, 11, 0.6); font-family: sans-serif; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border-radius: 2px;">
              ZONA: ${property.location.split(',')[0]}
            </div>
          </div>
        `,
        iconSize: [160, 56],
        iconAnchor: [80, 16],
        popupAnchor: [0, -20],
      });

      const zoneMarker = L.marker([lat, lng], { icon: zoneCenterIcon }).addTo(map);
      zoneMarkerRef.current = zoneMarker;

      const zonePopupContent = document.createElement('div');
      zonePopupContent.className = 'font-sans text-stone-900 p-1 min-w-[220px] max-w-[280px]';
      zonePopupContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #D6920B;">
            <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">Zona de Referência</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #422502; margin: 0; line-height: 1.25;">${property.title}</h4>
          <p style="font-size: 11px; color: #57534e; margin: 0; line-height: 1.35;">
            Localização aproximada para salvaguardar a privacidade e reserva do imóvel. A morada exata é disponibilizada mediante visita.
          </p>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e7e5e4; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: 700; color: #8c6a38; text-transform: uppercase;">Raio de aprox.: ~${circleRadius}m</span>
            <span style="font-size: 10px; font-weight: 700; color: #422502; background: #faf8f5; border: 1px solid #d8be9e; padding: 2px 6px; border-radius: 2px;">${property.location.split(',')[0]}</span>
          </div>
        </div>
      `;

      zoneMarker.bindPopup(zonePopupContent, { autoPan: false });
      circle.bindPopup(zonePopupContent, { autoPan: false });
    }
  }, [precision, lat, lng, circleRadius, property.title, property.address, property.location, property.price]);

  // 3. Alternar camada Rua / Satélite
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const streetTile = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
        maxZoom: 19,
      }
    );

    const activeTile = mapLayer === 'satellite' ? satelliteTile : streetTile;
    activeTile.addTo(map);
    tileLayerRef.current = activeTile;
  }, [mapLayer]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();
    map.closePopup();
    map.flyTo([lat, lng], property.mapCoordinates?.zoom || 15, {
      animate: true,
      duration: 0.8,
    });
  };

  // Google Maps link
  const googleMapsUrl =
    precision === 'exata'
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          property.address || `${property.title}, ${property.location}, Portugal`
        )}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${property.location}, Pombal, Portugal`
        )}`;

  return (
    <section
      className="w-full bg-[#FDF7F6] pt-14 sm:pt-18 pb-0 border-t border-[#d8be9e]/50 select-none relative z-0 isolate"
      aria-label="Localização e Mapa do Imóvel"
    >
      {/* Header container aligned with page layout */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-[#D6920B] font-semibold block mb-1">
              ENQUADRAMENTO GEOGRÁFICO
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold uppercase tracking-[0.14em] text-[#422502]">
              Localização & Envolvente
            </h2>
            <p className="font-sans text-xs sm:text-sm text-stone-600 mt-1.5 flex items-center gap-1.5 flex-wrap">
              <MapPin size={14} className="text-[#D6920B] shrink-0" />
              {precision === 'exata' ? (
                <span>{property.address || property.location}</span>
              ) : (
                <span>
                  {property.location}{' '}
                  <span className="text-[#b87d1d] font-semibold text-[11px] tracking-wide ml-1">
                    (Zona Envolvente Aproximada &bull; Proteção de Privacidade)
                  </span>
                </span>
              )}
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Street / Satellite Toggle */}
            <button
              onClick={() => setMapLayer(mapLayer === 'satellite' ? 'street' : 'satellite')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 border text-xs uppercase tracking-wider font-medium shadow-xs transition-all cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-[#422502] text-white border-[#422502]'
                  : 'bg-white border-[#d8be9e] text-stone-800 hover:text-[#422502] hover:border-[#422502]'
              }`}
              aria-label="Alternar visualização entre Rua e Satélite"
            >
              <Layers size={13} />
              <span>{mapLayer === 'satellite' ? 'Ver Mapa Rua' : 'Ver Satélite'}</span>
            </button>

            {/* Recenter button */}
            <button
              onClick={handleResetCenter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#d8be9e] text-stone-800 hover:text-[#422502] hover:border-[#422502] text-xs uppercase tracking-wider font-medium shadow-xs transition-colors cursor-pointer"
              aria-label="Recentrar no imóvel"
              title="Recentrar mapa"
            >
              <Navigation size={12} />
              <span className="hidden sm:inline">Recentrar</span>
            </button>

            {/* External Google Maps Route button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#422502] text-white hover:bg-[#5c3403] text-xs uppercase tracking-wider font-medium shadow-xs transition-colors cursor-pointer"
              aria-label="Abrir rota no Google Maps"
            >
              <span>Abrir Rota</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Map Display Frame - Stretched full-bleed touching borders */}
      <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[600px] border-t border-b border-[#d8be9e]/60 shadow-inner bg-stone-200 overflow-hidden">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Custom Zoom Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col bg-white/95 backdrop-blur-xs border border-[#d8be9e] shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-[#422502] hover:bg-stone-100 border-b border-[#d8be9e]/50 text-lg font-bold cursor-pointer transition-colors"
            aria-label="Aumentar zoom do mapa"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-[#422502] hover:bg-stone-100 text-lg font-bold cursor-pointer transition-colors"
            aria-label="Diminuir zoom do mapa"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Coordinates / Map attribution badge */}
        <div className="absolute bottom-6 left-6 z-20 bg-stone-900/85 backdrop-blur-sm text-stone-300 text-[10px] sm:text-[11px] uppercase tracking-wider px-3 py-1.5 font-mono border border-stone-700/60 shadow-lg pointer-events-none flex items-center gap-2">
          {precision === 'certa' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#D6920B] animate-pulse inline-block" />
              <span>Zona Aproximada de {property.location.split(',')[0]} (Raio ~{circleRadius}m)</span>
            </>
          ) : (
            <>
              <span>{property.location}, Portugal &bull; Lat: {lat.toFixed(4)} &bull; Lng: {lng.toFixed(4)}</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
