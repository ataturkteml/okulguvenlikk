const CACHE_NAME = 'okulgiris-v1';
const ASSETS = [
  '/student/index.html',
  '/student/manifest.json',
  '/student/offline.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // API isteklerini cache'leme
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request).then(r => r || caches.match('/student/offline.html'))
    )
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'Yeni Bildirim',
    body: 'Okul idaresinden yeni mesaj!'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/student/icons/icon-192.png',
      badge: '/student/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/student/index.html')
  );
});
