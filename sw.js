// --- SERVICE WORKER BEEZITA ---

const CACHE_NAME = 'beezita-cache-v0.9.5.7-TopBackgound-D2.3-beta'; // Força a atualização do PWA quando muda a versão do cache.
const MAP_CACHE_NAME = 'beezita-map-tiles-v1';

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './map-trilhas.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './beezita-icon.svg',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css',
    // IMAGENS DO APP PARA FUNCIONAMENTO OFFLINE
    './assets/images/trocarimagem.webp',
    './assets/images/img-abelhas-droryana.webp',
    './assets/images/img-abelhas-cxvazia.webp',
    './assets/images/img-abelhas-irai.webp',
    './assets/images/img-abelhas-mandacaia.webp',
    './assets/images/img-abelhas-guaraipo.webp',
    './assets/images/img-abelhas-hotel.webp',
    './assets/images/img-expo-pipiripau-2.webp',
    './assets/images/img-background-mhnjb.webp',
    './assets/images/img-outros-lagoa.webp',
    './assets/images/img-jardim-jurassico.webp',
    './assets/images/img-expo-palacinho.webp',
    './assets/images/img-expo-orquidario-2.webp'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== MAP_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. ESTRATÉGIA PARA OS TILES DO MAPBOX (MAPA)
    // Se for uma requisição de imagem para a API do Mapbox
    if (url.hostname === 'api.mapbox.com' && url.pathname.includes('/tiles/')) {
        event.respondWith(
            caches.open(MAP_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        return response; // Se tem no cache, retorna na mesma hora (Offline Mode)
                    }
                    // Se não tem, busca na internet, guarda no cache para a próxima e retorna
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Opcional: Retornar uma imagem de "mapa indisponível" se a pessoa não baixou
                    });
                });
            })
        );
    } 
    // 2. ESTRATÉGIA PARA A API DE CLIMA (Sempre rede primeiro, não faz sentido cache antigo de clima)
    else if (url.hostname === 'api.open-meteo.com') {
        event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({ current_weather: { temperature: "--", weathercode: 0 } }), { headers: { 'Content-Type': 'application/json' } })));
    }
    // 3. ESTRATÉGIA PARA O RESTO DO APP (Arquivos estáticos: Cache primeiro)
    else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
