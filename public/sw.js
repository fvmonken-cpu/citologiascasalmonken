const CACHE_NAME = 'citologia-casal-monken-v1.4.0';
const urlsToCache = ['/', '/favicon.svg', '/favicon.ico', '/logo-casal-monken.png'];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache aberto');
        return Promise.all(
          urlsToCache.map(u =>
            cache.add(u).catch(e => console.warn('skip cache', u, e))
          )
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Recursos em cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro no cache:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Ativado');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('📋 Service Worker: Servindo do cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('🌐 Service Worker: Buscando na rede:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Sincronização em background');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline data sync when connection is restored
  return new Promise((resolve) => {
    console.log('✅ Service Worker: Sincronização completa');
    resolve();
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  console.log('📬 Service Worker: Push notification:', data);

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open',  title: 'Abrir',  icon: '/favicon.svg' },
      { action: 'close', title: 'Fechar', icon: '/favicon.svg' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Citologia Oncótica', options)
  );
});

// Handle notification clicks — abre o exame correspondente
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Foca aba já aberta se existir
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Abre nova aba
      return clients.openWindow(targetUrl);
    })
  );
});