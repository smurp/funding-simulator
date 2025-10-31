export function goto(url) {
  // Don't actually navigate - just log it
  console.log('Navigation suppressed:', url);
  return Promise.resolve();
}

export function invalidate() { return Promise.resolve(); }
export function invalidateAll() { return Promise.resolve(); }
export function preloadData() { return Promise.resolve(); }
export function preloadCode() { return Promise.resolve(); }
export function beforeNavigate() {}
export function afterNavigate() {}
export function disableScrollHandling() {}
export function pushState() {}
export function replaceState() {}