// PWA Registration and Install Prompt
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('G3 Tutor Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('G3 Tutor Service Worker registration failed:', error);
        });
    });
  }
};

// PWA Install Prompt
export class PWAInstallPrompt {
  constructor() {
    this.deferredPrompt = null;
    this.setupInstallPrompt();
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      console.log('Install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('G3 Tutor app was installed');
      this.deferredPrompt = null;
    });
  }

  async showInstallPrompt() {
    if (this.deferredPrompt) {
      // Show the prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      this.deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  canInstall() {
    return this.deferredPrompt !== null;
  }
}

// Check if app is running as PWA
export const isRunningStandalone = () => {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
};

// Get install instructions based on device
export const getInstallInstructions = () => {
  const userAgent = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return {
      device: 'iOS',
      steps: [
        'Tap the Share button in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install G3 Tutor'
      ]
    };
  } else if (/Android/.test(userAgent)) {
    return {
      device: 'Android',
      steps: [
        'Tap the menu button (three dots) in Chrome',
        'Tap "Add to Home Screen"',
        'Tap "Add" to install G3 Tutor'
      ]
    };
  } else {
    return {
      device: 'Desktop',
      steps: [
        'Look for the install button in your browser\'s address bar',
        'Click "Install" when prompted',
        'The G3 Tutor app will be added to your desktop'
      ]
    };
  }
};