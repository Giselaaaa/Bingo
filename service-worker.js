const CACHE_NAME = 'bingo-cristina-offline-v2';
const ARCHIVOS = ['./','./index.html','./style.css','./script.js','./manifest.json','./icon-bingo.png','./icon-bingo-512.png'];
const AUDIOS = ["./audios/01.mp3", "./audios/02.mp3", "./audios/03.mp3", "./audios/04.mp3", "./audios/05.mp3", "./audios/06.mp3", "./audios/07.mp3", "./audios/08.mp3", "./audios/09.mp3", "./audios/10.mp3", "./audios/11.mp3", "./audios/12.mp3", "./audios/13.mp3", "./audios/14.mp3", "./audios/15.mp3", "./audios/16.mp3", "./audios/17.mp3", "./audios/18.mp3", "./audios/19.mp3", "./audios/20.mp3", "./audios/21.mp3", "./audios/22.mp3", "./audios/23.mp3", "./audios/24.mp3", "./audios/25.mp3", "./audios/26.mp3", "./audios/27.mp3", "./audios/28.mp3", "./audios/29.mp3", "./audios/30.mp3", "./audios/31.mp3", "./audios/32.mp3", "./audios/33.mp3", "./audios/34.mp3", "./audios/35.mp3", "./audios/36.mp3", "./audios/37.mp3", "./audios/38.mp3", "./audios/39.mp3", "./audios/40.mp3", "./audios/41.mp3", "./audios/42.mp3", "./audios/43.mp3", "./audios/44.mp3", "./audios/45.mp3", "./audios/46.mp3", "./audios/47.mp3", "./audios/48.mp3", "./audios/49.mp3", "./audios/50.mp3", "./audios/51.mp3", "./audios/52.mp3", "./audios/53.mp3", "./audios/54.mp3", "./audios/55.mp3", "./audios/56.mp3", "./audios/57.mp3", "./audios/58.mp3", "./audios/59.mp3", "./audios/60.mp3", "./audios/61.mp3", "./audios/62.mp3", "./audios/63.mp3", "./audios/64.mp3", "./audios/65.mp3", "./audios/66.mp3", "./audios/67.mp3", "./audios/68.mp3", "./audios/69.mp3", "./audios/70.mp3", "./audios/71.mp3", "./audios/72.mp3", "./audios/73.mp3", "./audios/74.mp3", "./audios/75.mp3", "./audios/76.mp3", "./audios/77.mp3", "./audios/78.mp3", "./audios/79.mp3", "./audios/80.mp3", "./audios/81.mp3", "./audios/82.mp3", "./audios/83.mp3", "./audios/84.mp3", "./audios/85.mp3", "./audios/86.mp3", "./audios/87.mp3", "./audios/88.mp3", "./audios/89.mp3", "./audios/90.mp3"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(ARCHIVOS);
    // Precarga los 90 MP3 disponibles para que funcionen sin internet.
    await Promise.all(AUDIOS.map(async ruta => {
      try { await cache.add(ruta); } catch (e) { console.warn('No se pudo guardar', ruta); }
    }));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n.startsWith('bingo-') && n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const esAudio = new URL(event.request.url).pathname.endsWith('.mp3');
  if (esAudio) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy)); }
      return response;
    })));
  } else {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy)); }
      return response;
    }).catch(() => caches.match(event.request)));
  }
});
