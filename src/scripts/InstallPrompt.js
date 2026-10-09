let installPrompt = null;

let installWasAsked = false;
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installWasAsked = false;
  notify();
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installWasAsked = false;
  notify();
});

function subscribeToInstallPrompt(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getInstallPrompt() {
  return installPrompt;
}

function getInstallWasAsked() {
  return installWasAsked;
}

async function promptToInstall() {
  const prompt = installPrompt;
  installPrompt = null;
  installWasAsked = true;
  notify();
  await prompt?.prompt();
}

function isAppleMobile() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isFirefoxAndroid() {
  return (
    /Android/.test(navigator.userAgent) && /Firefox\//.test(navigator.userAgent)
  );
}

function isInstalled() {
  return (
    matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true
  );
}

export {
  getInstallPrompt,
  getInstallWasAsked,
  isAppleMobile,
  isFirefoxAndroid,
  isInstalled,
  promptToInstall,
  subscribeToInstallPrompt,
};
