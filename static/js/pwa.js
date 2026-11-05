(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (err) {
      console.warn('SW register failed', err);
    });
  });
})();
