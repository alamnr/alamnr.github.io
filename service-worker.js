

(function(){
	'use strict';
	// TODO 2 - cache the application shell
  var filesToCache = [
    '.',
    'css/bootstrap.min.css',
    'css/social-boot.css',
    'css/style.css',
    'js/chart-1.js',
    'js/new_git_promise.js',
    'https://code.jquery.com/jquery-3.2.1.slim.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'


  ];



var staticCacheName = 'pages-cache-v1';
// Service worker events- install, activate, fetch,push and sync

self.addEventListener('install',event=>{
//	console.log('Attempting to install service worker and cache static assets');
	//self.skipWaiting();
	event.waitUntil(caches.open(staticCacheName)
		.then(cache=>cache.addAll(filesToCache)));

});

// TODO 7 - activate and delete unused caches
self.addEventListener('activate',event=>{
//	console.log('Activating new service worker...');
	var cacheWhiteList = [staticCacheName];
	event.waitUntil(caches.keys().then(cacheNames=>{
		return Promise.all(cacheNames.map(cacheName=>{
			if(cacheWhiteList.indexOf(cacheName)===-1){
				return caches.delete(cacheName);
			}
		}));
	}));
});


// TODO 3 - intercept network requests
self.addEventListener('fetch',event=>{
	/*
	if(event.request.url.indexOf('client_id') < 0){
	console.log('Fetch event for ', event.request.url);
	}*/

	// Only respond to request from caches or falling back to network which are not github REST API
	if(event.request.url.indexOf('client_id') < 0){
		event.respondWith(
			caches.match(event.request).then(response=>{
				if (response) {
			        //console.log('Found ', event.request.url, ' in cache');
			        return response;
			    }
			    //console.log('Network Request For- ',event.request.url);
			    return fetch(event.request).then(response=>{
			    	// TODO 4 - Add fetched files to the cache
			          if(response.status === 404){
			            return cache.match('pages/404.html');
			          }
			          return caches.open(staticCacheName).then(cache=>{
			          	if(event.request.url.indexOf('test')<0){
			          		cache.put(event.request.url,response.clone());
			          	}
			          	return response;
			          })
			    })
			}).catch(error=>{

	        // TODO 6 - Respond with custom offline page
	        console.log('Error, ', error);
	        //return caches.match('pages/offline.html');

	      })
		);
	}
});

})();
