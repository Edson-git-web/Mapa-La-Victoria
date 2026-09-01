/**
 * ============================================================================
 * SISTEMA DE INFORMACIÓN GEOGRÁFICA (GIS) - DISTRITO DE LA VICTORIA (LIMA, PERÚ)
 * Visualizador y Divisor Territorial en 2 Bloques con Soporte Google Maps
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CONFIGURACIÓN Y CONSTANTES GEOGRÁFICAS ---
  const LA_VICTORIA_CENTER = [-12.0685, -77.0195];
  const DEFAULT_ZOOM = 14;

  // Polígono Perimétrico General de La Victoria (Lima, Perú)
  const PERIMETER_LA_VICTORIA = [
    [-12.0548, -77.0342], // Grau / Paseo de la República
    [-12.0542, -77.0185], // Grau / Huánuco
    [-12.0551, -77.0085], // Grau / San Cosme límite
    [-12.0610, -77.0048], // Cerro San Cosme / Circunvalación
    [-12.0712, -77.0065], // Nicolás Arriola / Aviación límite
    [-12.0835, -77.0082], // Arriola / San Luis
    [-12.0875, -77.0175], // Javier Prado / Guardia Civil
    [-12.0882, -77.0288], // Javier Prado / Vía Expresa
    [-12.0785, -77.0298], // Canadá / Paseo de la República
    [-12.0682, -77.0318], // Iquitos / México oeste
    [-12.0585, -77.0335]  // 28 de Julio / Vía Expresa
  ];

  // Definición de Modelos de División Territorial
  const DIVISION_MODELS = {
    mexico: {
      id: 'mexico',
      name: 'Av. México',
      title: 'Eje Divisorio: Av. México',
      description: 'División Norte (Comercial) / Sur (Residencial e Industrial)',
      avenueCoords: [
        [-12.0706, -77.0315], // Av. México con Vía Expresa / Iquitos
        [-12.0698, -77.0268], // Av. México con Manco Cápac
        [-12.0688, -77.0212], // Av. México con Abtao
        [-12.0679, -77.0158], // Av. México con Huánuco / Parinacochas
        [-12.0668, -77.0118], // Av. México con Aviación (Gamarra Sur)
        [-12.0652, -77.0062]  // Av. México con Nicolás Arriola / San Cosme
      ],
      blockA: {
        id: 'block_norte',
        name: 'Bloque 1: Sector Norte',
        description: 'Eje Comercial y Núcleo Textil (Gamarra, Plaza Manco Cápac, 28 de Julio, Grau).',
        area: '3.85 km²',
        population: '~102,400',
        businesses: '~28,500',
        poisCount: 8,
        tags: ['Gamarra', 'Plaza Manco Cápac', 'Luna Pizarro', 'San Cosme'],
        color: '#06b6d4',
        fillColor: '#06b6d4',
        polygon: [
          [-12.0548, -77.0342],
          [-12.0542, -77.0185],
          [-12.0551, -77.0085],
          [-12.0610, -77.0048],
          [-12.0652, -77.0062], // Corte Av. México
          [-12.0668, -77.0118],
          [-12.0679, -77.0158],
          [-12.0688, -77.0212],
          [-12.0698, -77.0268],
          [-12.0706, -77.0315], // Fin corte
          [-12.0585, -77.0335]
        ]
      },
      blockB: {
        id: 'block_sur',
        name: 'Bloque 2: Sector Sur',
        description: 'Eje Residencial, Deportivo e Industrial (Matute, Balconcillo, Apolo, Av. Canadá, Javier Prado).',
        area: '4.89 km²',
        population: '~94,600',
        businesses: '~11,200',
        poisCount: 7,
        tags: ['Estadio Matute', 'Balconcillo', 'Urb. Apolo', 'Av. Canadá'],
        color: '#f59e0b',
        fillColor: '#f59e0b',
        polygon: [
          [-12.0706, -77.0315], // Inicio corte Av. México
          [-12.0698, -77.0268],
          [-12.0688, -77.0212],
          [-12.0679, -77.0158],
          [-12.0668, -77.0118],
          [-12.0652, -77.0062], // Fin corte
          [-12.0712, -77.0065],
          [-12.0835, -77.0082],
          [-12.0875, -77.0175],
          [-12.0882, -77.0288],
          [-12.0785, -77.0298]
        ]
      }
    },
    manco_capac: {
      id: 'manco_capac',
      name: 'Av. Manco Cápac / Iquitos',
      title: 'Eje Divisorio: Av. Manco Cápac / Iquitos',
      description: 'División Longitudinal Oeste (Conectividad Cívica) / Este (Damero Comercial y San Cosme)',
      avenueCoords: [
        [-12.0548, -77.0285], // Grau / Manco Cápac
        [-12.0601, -77.0282], // Plaza Manco Cápac
        [-12.0698, -77.0268], // Manco Cápac / México
        [-12.0772, -77.0262], // Iquitos / Balconcillo
        [-12.0882, -77.0288]  // Iquitos / Javier Prado
      ],
      blockA: {
        id: 'block_oeste',
        name: 'Bloque 1: Sector Oeste',
        description: 'Franja Cívica y Conectividad Metropolitana (Vía Expresa, Luna Pizarro, Av. Iquitos, Balconcillo Poniente).',
        area: '3.40 km²',
        population: '~78,000',
        businesses: '~14,200',
        poisCount: 5,
        tags: ['Luna Pizarro', 'Vía Expresa', 'Plaza Manco Cápac Oeste', 'Balconcillo'],
        color: '#06b6d4',
        fillColor: '#06b6d4',
        polygon: [
          [-12.0548, -77.0342],
          [-12.0548, -77.0285], // Inicio corte
          [-12.0601, -77.0282],
          [-12.0698, -77.0268],
          [-12.0772, -77.0262],
          [-12.0882, -77.0288], // Fin corte
          [-12.0785, -77.0298],
          [-12.0682, -77.0318],
          [-12.0585, -77.0335]
        ]
      },
      blockB: {
        id: 'block_este',
        name: 'Bloque 2: Sector Este',
        description: 'Corazón Comercial Textil, Deportivo y Urbano (Gamarra, Matute, San Cosme, Aviación, Nicolás Arriola).',
        area: '5.34 km²',
        population: '~119,000',
        businesses: '~25,500',
        poisCount: 10,
        tags: ['Gamarra', 'Estadio Matute', 'San Cosme', 'Aviación', 'Urb. Apolo'],
        color: '#f59e0b',
        fillColor: '#f59e0b',
        polygon: [
          [-12.0548, -77.0285], // Inicio corte Manco Cápac
          [-12.0542, -77.0185],
          [-12.0551, -77.0085],
          [-12.0610, -77.0048],
          [-12.0712, -77.0065],
          [-12.0835, -77.0082],
          [-12.0875, -77.0175],
          [-12.0882, -77.0288], // Fin corte
          [-12.0772, -77.0262],
          [-12.0698, -77.0268],
          [-12.0601, -77.0282]
        ]
      }
    },
    arriola: {
      id: 'arriola',
      name: 'Av. 28 de Julio',
      title: 'Eje Divisorio: Av. 28 de Julio',
      description: 'División Casco Histórico/Cívico vs Zona Sur Metropolitana',
      avenueCoords: [
        [-12.0585, -77.0335], // 28 de Julio con Paseo de la República
        [-12.0588, -77.0265], // 28 de Julio con Manco Cápac
        [-12.0592, -77.0195], // 28 de Julio con Huánuco
        [-12.0598, -77.0098]  // 28 de Julio con San Cosme
      ],
      blockA: {
        id: 'block_civico',
        name: 'Bloque 1: Casco Norte / Grau',
        description: 'Sector Cívico-Comercial de acceso a Lima Centro y eje de transporte.',
        area: '1.95 km²',
        population: '~46,000',
        businesses: '~12,000',
        poisCount: 4,
        tags: ['Av. Grau', 'Plaza Manco Cápac', 'Hospital 2 de Mayo Límite'],
        color: '#06b6d4',
        fillColor: '#06b6d4',
        polygon: [
          [-12.0548, -77.0342],
          [-12.0542, -77.0185],
          [-12.0551, -77.0085],
          [-12.0598, -77.0098], // Corte 28 de Julio
          [-12.0592, -77.0195],
          [-12.0588, -77.0265],
          [-12.0585, -77.0335]
        ]
      },
      blockB: {
        id: 'block_damero',
        name: 'Bloque 2: Macrozona Sur',
        description: 'Extensión mayoritaria de La Victoria que abarca Gamarra, Matute, Balconcillo y áreas industriales.',
        area: '6.79 km²',
        population: '~151,000',
        businesses: '~27,700',
        poisCount: 11,
        tags: ['Gamarra', 'Matute', 'Balconcillo', 'Canadá', 'Javier Prado'],
        color: '#f59e0b',
        fillColor: '#f59e0b',
        polygon: [
          [-12.0585, -77.0335], // Inicio corte 28 Julio
          [-12.0588, -77.0265],
          [-12.0592, -77.0195],
          [-12.0598, -77.0098],
          [-12.0610, -77.0048],
          [-12.0712, -77.0065],
          [-12.0835, -77.0082],
          [-12.0875, -77.0175],
          [-12.0882, -77.0288],
          [-12.0785, -77.0298],
          [-12.0682, -77.0318]
        ]
      }
    }
  };

  // Puntos de Interés Representativos de La Victoria
  const POI_DATABASE = [
    {
      id: 'gamarra',
      name: 'Emporio Comercial Gamarra',
      category: 'Comercio',
      icon: 'fa-shirt',
      coords: [-12.0658, -77.0135],
      desc: 'El complejo empresarial y textil más importante del Perú y Sudamérica con más de 20,000 tiendas.',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'matute',
      name: 'Estadio Alejandro Villanueva (Matute)',
      category: 'Deporte & Cultura',
      icon: 'fa-futbol',
      coords: [-12.0722, -77.0194],
      desc: 'Histórico recinto deportivo y casa del club Alianza Lima, fundado en 1974.',
      blockMapping: { mexico: 'B', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'manco_capac',
      name: 'Plaza Manco Cápac',
      category: 'Cívico & Patrimonio',
      icon: 'fa-monument',
      coords: [-12.0601, -77.0305],
      desc: 'Plaza principal del distrito, con el emblemático monumento obsequiado por la colonia japonesa.',
      blockMapping: { mexico: 'A', manco_capac: 'A', arriola: 'A' }
    },
    {
      id: 'canepa',
      name: 'Parque y Galería Cánepa',
      category: 'Comercio',
      icon: 'fa-bag-shopping',
      coords: [-12.0664, -77.0138],
      desc: 'Epicentro comercial del damero A de Gamarra con alta densidad de compradores.',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'porvenir',
      name: 'Parque del Porvenir',
      category: 'Deporte & Tradición',
      icon: 'fa-trophy',
      coords: [-12.0682, -77.0235],
      desc: 'Sede tradicional del célebre campeonato de fútbol callejero "Mundialito de El Porvenir".',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'balconcillo',
      name: 'Urb. Balconcillo (Parque Unión Panamericana)',
      category: 'Residencial',
      icon: 'fa-tree',
      coords: [-12.0772, -77.0251],
      desc: 'Una de las zonas residenciales más tradicionales y arboladas del distrito.',
      blockMapping: { mexico: 'B', manco_capac: 'A', arriola: 'B' }
    },
    {
      id: 'san_cosme',
      name: 'Cerro San Cosme',
      category: 'Comunidad & Mirador',
      icon: 'fa-mountain-city',
      coords: [-12.0598, -77.0089],
      desc: 'Emblemático cerro habitacional con rica tradición popular y vista panorámica.',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'estacion_gamarra',
      name: 'Estación Gamarra (Metro Línea 1)',
      category: 'Transporte',
      icon: 'fa-train-subway',
      coords: [-12.0645, -77.0122],
      desc: 'Principal nodo de conexión y transporte masivo que conecta con todo Lima.',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'estacion_arriola',
      name: 'Estación Arriola (Metro Línea 1)',
      category: 'Transporte',
      icon: 'fa-train-subway',
      coords: [-12.0735, -77.0098],
      desc: 'Estación de conexión con el sector industrial y mercados mayoristas.',
      blockMapping: { mexico: 'B', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'mercado_frutas',
      name: 'Sector Mercado de Frutas',
      category: 'Abastecimiento',
      icon: 'fa-apple-whole',
      coords: [-12.0632, -77.0078],
      desc: 'Principal centro de acopio y distribución de frutas a nivel metropolitano.',
      blockMapping: { mexico: 'A', manco_capac: 'B', arriola: 'B' }
    },
    {
      id: 'luna_pizarro',
      name: 'Eje Av. Luna Pizarro',
      category: 'Transporte Interprovincial',
      icon: 'fa-bus',
      coords: [-12.0635, -77.0318],
      desc: 'Tradicional corredor de terminales terrestres y agencias interprovinciales.',
      blockMapping: { mexico: 'A', manco_capac: 'A', arriola: 'B' }
    },
    {
      id: 'intercambio_jp',
      name: 'Nodo Javier Prado / Vía Expresa',
      category: 'Infraestructura Vial',
      icon: 'fa-road-circle-nodes',
      coords: [-12.0872, -77.0289],
      desc: 'Límite sur de alta conectividad con San Isidro y San Borja.',
      blockMapping: { mexico: 'B', manco_capac: 'A', arriola: 'B' }
    }
  ];

  // Map Tile Providers (Google Maps y Alternativas)
  const TILE_LAYERS = {
    'google-roadmap': {
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }
    },
    'google-satellite': {
      url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      options: {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps (Satélite)',
        maxZoom: 20
      }
    },
    'google-hybrid': {
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      options: {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps (Híbrido)',
        maxZoom: 20
      }
    },
    'google-terrain': {
      url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      options: {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps (Terreno)',
        maxZoom: 20
      }
    },
    'carto-dark': {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }
    }
  };

  // --- ESTADO DE LA APLICACIÓN ---
  const state = {
    map: null,
    currentBaseTileLayer: null,
    currentDivisionKey: 'mexico',
    polygonA: null,
    polygonB: null,
    avenuePolyline: null,
    avenueTooltip: null,
    poiMarkers: [],
    labelsLayer: L.layerGroup(),
    polygonOpacity: 0.30,
    polygonHoverOpacity: 0.50,
    showAvenue: true,
    showLandmarks: true,
    showLabels: true,
    activePoiId: null
  };

  // --- INICIALIZACIÓN DEL MAPA ---
  function initMap() {
    state.map = L.map('map-container', {
      center: LA_VICTORIA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true
    });

    // Control de Zoom customizado en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(state.map);

    // Cargar capa base inicial (Google Roadmap)
    setBaseMapLayer('google-roadmap');

    // Inicializar capas geográficas y render
    renderDivision(state.currentDivisionKey);
    renderPOIList();
    renderPOIMarkers();

    // Eventos UI
    bindEventListeners();
  }

  // --- CAMBIO DE CAPA BASE ---
  function setBaseMapLayer(layerKey) {
    if (state.currentBaseTileLayer) {
      state.map.removeLayer(state.currentBaseTileLayer);
    }
    const config = TILE_LAYERS[layerKey] || TILE_LAYERS['google-roadmap'];
    state.currentBaseTileLayer = L.tileLayer(config.url, config.options);
    state.currentBaseTileLayer.addTo(state.map);
  }

  // --- RENDERIZADO DE LA DIVISIÓN TERRITORIAL (2 BLOQUES + AVENIDA) ---
  function renderDivision(divisionKey) {
    const model = DIVISION_MODELS[divisionKey];
    if (!model) return;

    state.currentDivisionKey = divisionKey;

    // 1. Limpiar capas previas si existen
    if (state.polygonA) state.map.removeLayer(state.polygonA);
    if (state.polygonB) state.map.removeLayer(state.polygonB);
    if (state.avenuePolyline) state.map.removeLayer(state.avenuePolyline);
    state.labelsLayer.clearLayers();

    // 2. Crear Polígono Bloque A
    state.polygonA = L.polygon(model.blockA.polygon, {
      color: model.blockA.color,
      weight: 3,
      opacity: 0.9,
      fillColor: model.blockA.fillColor,
      fillOpacity: state.polygonOpacity,
      className: 'polygon-block-a'
    }).addTo(state.map);

    state.polygonA.bindTooltip(`<b>${model.blockA.name}</b><br><small>${model.blockA.area}</small>`, {
      sticky: true,
      className: 'block-label-tooltip'
    });

    state.polygonA.on('mouseover', () => highlightBlockCard('A', true));
    state.polygonA.on('mouseout', () => highlightBlockCard('A', false));
    state.polygonA.on('click', () => zoomToLayer(state.polygonA));

    // 3. Crear Polígono Bloque B
    state.polygonB = L.polygon(model.blockB.polygon, {
      color: model.blockB.color,
      weight: 3,
      opacity: 0.9,
      fillColor: model.blockB.fillColor,
      fillOpacity: state.polygonOpacity,
      className: 'polygon-block-b'
    }).addTo(state.map);

    state.polygonB.bindTooltip(`<b>${model.blockB.name}</b><br><small>${model.blockB.area}</small>`, {
      sticky: true,
      className: 'block-label-tooltip'
    });

    state.polygonB.on('mouseover', () => highlightBlockCard('B', true));
    state.polygonB.on('mouseout', () => highlightBlockCard('B', false));
    state.polygonB.on('click', () => zoomToLayer(state.polygonB));

    // 4. Crear Línea de la Avenida Divisoria (Con efecto resplandor)
    if (state.showAvenue) {
      state.avenuePolyline = L.polyline(model.avenueCoords, {
        color: '#ec4899',
        weight: 6,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(state.map);

      // Tooltip anclado en el punto central de la avenida
      const midPoint = model.avenueCoords[Math.floor(model.avenueCoords.length / 2)];
      state.avenuePolyline.bindTooltip(`⚡ Eje Divisorio: ${model.name}`, {
        permanent: state.showLabels,
        direction: 'top',
        className: 'avenue-leaflet-tooltip'
      });
    }

    // 5. Actualizar interfaz textual y estadísticas
    updateSidebarContent(model);
    updateMarkersBlockAssociation();
  }

  // --- ACTUALIZACIÓN DE TEXTOS Y MÉTRICAS DEL SIDEBAR ---
  function updateSidebarContent(model) {
    // Encabezado flotante
    const badgeEl = document.getElementById('current-division-badge');
    if (badgeEl) badgeEl.textContent = `Eje: ${model.name}`;

    // Bloque A
    document.getElementById('block-a-title').textContent = model.blockA.name;
    document.getElementById('block-a-desc').textContent = model.blockA.description;
    document.getElementById('block-a-area').textContent = model.blockA.area;
    document.getElementById('block-a-pop').textContent = model.blockA.population;
    document.getElementById('block-a-biz').textContent = model.blockA.businesses;

    const tagsContainerA = document.getElementById('block-a-tags');
    tagsContainerA.innerHTML = model.blockA.tags.map(t => `<span class="tag">${t}</span>`).join('');

    // Bloque B
    document.getElementById('block-b-title').textContent = model.blockB.name;
    document.getElementById('block-b-desc').textContent = model.blockB.description;
    document.getElementById('block-b-area').textContent = model.blockB.area;
    document.getElementById('block-b-pop').textContent = model.blockB.population;
    document.getElementById('block-b-biz').textContent = model.blockB.businesses;

    const tagsContainerB = document.getElementById('block-b-tags');
    tagsContainerB.innerHTML = model.blockB.tags.map(t => `<span class="tag">${t}</span>`).join('');

    // Leyenda Flotante
    document.getElementById('legend-label-a').textContent = model.blockA.name;
    document.getElementById('legend-label-b').textContent = model.blockB.name;
    document.getElementById('legend-label-avenue').textContent = `${model.name} (Eje Divisorio)`;
  }

  // --- RENDERIZADO DE MARCADORES (POIs) ---
  function renderPOIMarkers() {
    // Limpiar marcadores existentes
    state.poiMarkers.forEach(m => state.map.removeLayer(m));
    state.poiMarkers = [];

    if (!state.showLandmarks) return;

    POI_DATABASE.forEach(poi => {
      const currentBlock = poi.blockMapping[state.currentDivisionKey] || 'A';
      const markerClass = currentBlock === 'A' ? 'marker-a' : 'marker-b';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-poi-marker ${markerClass}" style="width: 28px; height: 28px;">
                 <i class="fa-solid ${poi.icon}" style="font-size: 12px;"></i>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker(poi.coords, { icon: customIcon }).addTo(state.map);

      // Popup informativo con estilo Google Maps
      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${currentBlock === 'A' ? '#06b6d4' : '#f59e0b'}; margin-bottom: 2px;">
            ${poi.category} • Bloque ${currentBlock === 'A' ? '1' : '2'}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;">
            ${poi.name}
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px 0; line-height: 1.35;">
            ${poi.desc}
          </p>
          <div style="font-size: 10px; color: #6b7280; font-family: monospace;">
            Coord: ${poi.coords[0].toFixed(4)}, ${poi.coords[1].toFixed(4)}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        showPOIDetailCard(poi, currentBlock);
      });

      state.poiMarkers.push(marker);
    });
  }

  function updateMarkersBlockAssociation() {
    renderPOIMarkers();
    renderPOIList();
  }

  // --- RENDERIZADO DE LISTA DE POIs EN SIDEBAR ---
  function renderPOIList(filterQuery = '') {
    const container = document.getElementById('poi-list-container');
    if (!container) return;

    const query = filterQuery.toLowerCase().trim();
    const filtered = POI_DATABASE.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.75rem;">
          No se encontraron lugares con "${filterQuery}"
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(poi => {
      const block = poi.blockMapping[state.currentDivisionKey] || 'A';
      const badgeStyle = block === 'A' 
        ? 'background: rgba(6, 182, 212, 0.15); color: #67e8f9;' 
        : 'background: rgba(245, 158, 11, 0.15); color: #fcd34d;';
      const iconStyle = block === 'A' ? 'color: #06b6d4;' : 'color: #f59e0b;';

      return `
        <div class="poi-list-item" data-id="${poi.id}">
          <div class="poi-item-left">
            <div class="poi-item-icon" style="${iconStyle}">
              <i class="fa-solid ${poi.icon}"></i>
            </div>
            <span class="poi-item-name">${poi.name}</span>
          </div>
          <span class="poi-item-badge" style="${badgeStyle}">Bloque ${block === 'A' ? '1' : '2'}</span>
        </div>
      `;
    }).join('');

    // Asignar listeners de click a cada item
    container.querySelectorAll('.poi-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const poiId = item.getAttribute('data-id');
        const poi = POI_DATABASE.find(p => p.id === poiId);
        if (poi) {
          state.map.flyTo(poi.coords, 16, { duration: 1.2 });
          const block = poi.blockMapping[state.currentDivisionKey] || 'A';
          showPOIDetailCard(poi, block);
          
          // Abrir popup en el mapa
          const markerIndex = POI_DATABASE.findIndex(p => p.id === poiId);
          if (state.poiMarkers[markerIndex]) {
            state.poiMarkers[markerIndex].openPopup();
          }
        }
      });
    });
  }

  // --- MODAL / TARJETA DE DETALLE FLOTANTE ---
  function showPOIDetailCard(poi, block) {
    const card = document.getElementById('poi-detail-card');
    if (!card) return;

    const blockModel = DIVISION_MODELS[state.currentDivisionKey];
    const blockName = block === 'A' ? blockModel.blockA.name : blockModel.blockB.name;

    document.getElementById('poi-modal-category').textContent = poi.category;
    document.getElementById('poi-modal-title').textContent = poi.name;
    document.getElementById('poi-modal-desc').textContent = poi.desc;
    document.getElementById('poi-modal-block').textContent = `Pertenencia: ${blockName}`;
    document.getElementById('poi-modal-coords').textContent = `${poi.coords[0].toFixed(5)}, ${poi.coords[1].toFixed(5)}`;

    card.classList.remove('hidden');
  }

  function hidePOIDetailCard() {
    const card = document.getElementById('poi-detail-card');
    if (card) card.classList.add('hidden');
  }

  // --- RESALTADO Y ZOOM DE POLÍGONOS ---
  function highlightBlockCard(blockKey, isHighlighted) {
    const cardA = document.getElementById('card-block-a');
    const cardB = document.getElementById('card-block-b');
    const targetOpacity = isHighlighted ? state.polygonHoverOpacity : state.polygonOpacity;

    if (blockKey === 'A') {
      if (cardA) cardA.classList.toggle('highlighted-a', isHighlighted);
      if (state.polygonA) {
        state.polygonA.setStyle({
          fillOpacity: targetOpacity,
          weight: isHighlighted ? 4 : 3
        });
      }
    } else {
      if (cardB) cardB.classList.toggle('highlighted-b', isHighlighted);
      if (state.polygonB) {
        state.polygonB.setStyle({
          fillOpacity: targetOpacity,
          weight: isHighlighted ? 4 : 3
        });
      }
    }
  }

  function zoomToLayer(layer) {
    if (layer && state.map) {
      state.map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 15 });
    }
  }

  // --- VINCULACIÓN DE EVENTOS DEL DOM ---
  function bindEventListeners() {
    // 1. Botones de División por Avenida
    document.querySelectorAll('.btn-avenue').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-avenue').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        const divKey = targetBtn.getAttribute('data-division');
        renderDivision(divKey);
      });
    });

    // 2. Select de Estilo de Mapa (Google Roadmap, Satellite, etc.)
    const mapStyleSelect = document.getElementById('select-map-style');
    if (mapStyleSelect) {
      mapStyleSelect.addEventListener('change', (e) => {
        setBaseMapLayer(e.target.value);
      });
    }

    // 3. Sliders de Opacidad (Base y Hover)
    const opacitySlider = document.getElementById('polygon-opacity');
    const opacityValText = document.getElementById('opacity-val');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.polygonOpacity = val / 100;
        if (opacityValText) opacityValText.textContent = `${val}%`;

        if (state.polygonA) state.polygonA.setStyle({ fillOpacity: state.polygonOpacity });
        if (state.polygonB) state.polygonB.setStyle({ fillOpacity: state.polygonOpacity });
      });
    }

    const hoverOpacitySlider = document.getElementById('polygon-hover-opacity');
    const hoverOpacityValText = document.getElementById('hover-opacity-val');
    if (hoverOpacitySlider) {
      hoverOpacitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.polygonHoverOpacity = val / 100;
        if (hoverOpacityValText) hoverOpacityValText.textContent = `${val}%`;
      });
    }

    // 4. Toggles de Capas
    const toggleAvenue = document.getElementById('toggle-avenue-highlight');
    if (toggleAvenue) {
      toggleAvenue.addEventListener('change', (e) => {
        state.showAvenue = e.target.checked;
        renderDivision(state.currentDivisionKey);
      });
    }

    const toggleLandmarks = document.getElementById('toggle-landmarks');
    if (toggleLandmarks) {
      toggleLandmarks.addEventListener('change', (e) => {
        state.showLandmarks = e.target.checked;
        renderPOIMarkers();
      });
    }

    const toggleLabels = document.getElementById('toggle-labels');
    if (toggleLabels) {
      toggleLabels.addEventListener('change', (e) => {
        state.showLabels = e.target.checked;
        renderDivision(state.currentDivisionKey);
      });
    }

    // 5. Botones de Foco de Bloque
    const btnFocusA = document.getElementById('btn-focus-a');
    if (btnFocusA) {
      btnFocusA.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomToLayer(state.polygonA);
      });
    }

    const btnFocusB = document.getElementById('btn-focus-b');
    if (btnFocusB) {
      btnFocusB.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomToLayer(state.polygonB);
      });
    }

    // Cards clickeables e interactivas con hover sincronizado
    const cardA = document.getElementById('card-block-a');
    if (cardA) {
      cardA.addEventListener('click', () => zoomToLayer(state.polygonA));
      cardA.addEventListener('mouseenter', () => highlightBlockCard('A', true));
      cardA.addEventListener('mouseleave', () => highlightBlockCard('A', false));
    }

    const cardB = document.getElementById('card-block-b');
    if (cardB) {
      cardB.addEventListener('click', () => zoomToLayer(state.polygonB));
      cardB.addEventListener('mouseenter', () => highlightBlockCard('B', true));
      cardB.addEventListener('mouseleave', () => highlightBlockCard('B', false));
    }

    // 6. Botones de Control Flotante
    const btnResetView = document.getElementById('btn-reset-view');
    if (btnResetView) {
      btnResetView.addEventListener('click', () => {
        state.map.flyTo(LA_VICTORIA_CENTER, DEFAULT_ZOOM, { duration: 1 });
      });
    }

    const btnFitBlocks = document.getElementById('btn-fit-blocks');
    if (btnFitBlocks) {
      btnFitBlocks.addEventListener('click', () => {
        if (state.polygonA && state.polygonB) {
          const group = L.featureGroup([state.polygonA, state.polygonB]);
          state.map.fitBounds(group.getBounds(), { padding: [30, 30] });
        }
      });
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
          document.exitFullscreen().catch(err => console.warn(err));
        }
      });
    }

    // 7. Buscador de Puntos de Interés
    const searchInput = document.getElementById('poi-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderPOIList(e.target.value);
      });
    }

    // 8. Cerrar modal de POI
    const btnClosePoi = document.getElementById('btn-close-poi');
    if (btnClosePoi) {
      btnClosePoi.addEventListener('click', hidePOIDetailCard);
    }

    // 9. Colapso / Expansión del Sidebar (Con soporte para Drawer Móvil y Backdrop)
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnOpenSidebar = document.getElementById('btn-open-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const sidebar = document.getElementById('main-sidebar');

    function toggleSidebar(collapse) {
      if (!sidebar) return;
      const shouldCollapse = collapse !== undefined ? collapse : !sidebar.classList.contains('collapsed');
      
      if (shouldCollapse) {
        sidebar.classList.add('collapsed');
        if (btnOpenSidebar) btnOpenSidebar.classList.remove('hidden');
        if (backdrop) backdrop.classList.add('hidden');
      } else {
        sidebar.classList.remove('collapsed');
        if (btnOpenSidebar) btnOpenSidebar.classList.add('hidden');
        if (backdrop && window.innerWidth <= 900) backdrop.classList.remove('hidden');
      }

      // Animación continua de redimensionamiento de Leaflet durante la transición CSS (400ms)
      const start = performance.now();
      function triggerResize(now) {
        if (state.map) state.map.invalidateSize();
        if (now - start < 400) {
          requestAnimationFrame(triggerResize);
        }
      }
      requestAnimationFrame(triggerResize);
    }

    if (btnToggleSidebar) {
      btnToggleSidebar.addEventListener('click', () => toggleSidebar(true));
    }

    if (btnOpenSidebar) {
      btnOpenSidebar.addEventListener('click', () => toggleSidebar(false));
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => toggleSidebar(true));
    }

    // En pantallas móviles (< 900px), colapsar sidebar al inicio para apreciar el mapa de inmediato
    if (window.innerWidth <= 900) {
      toggleSidebar(true);
    }
  }

  // --- ARRANQUE DE LA APLICACIÓN AL CARGAR EL DOM ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

})();
