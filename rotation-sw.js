const CACHE='rotation-ui-v1';
const SHELL=[
 './bearing-rotor-insertion-ui-release.html',
 './rotation.webmanifest',
 './rotation-icon-192.png',
 './rotation-icon-512.png',
 './rotation-icon-180.png'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./bearing-rotor-insertion-ui-release.html',copy));return response;
  }).catch(()=>caches.match('./bearing-rotor-insertion-ui-release.html')));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
  return response;
 })));
});
