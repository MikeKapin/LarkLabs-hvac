import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { PWAInstallPrompt, isRunningStandalone, getInstallInstructions } from '../utils/pwa.js';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const pwaInstall = new PWAInstallPrompt();
    setInstallPrompt(pwaInstall);
    setIsStandalone(isRunningStandalone());

    // Check if we can show install prompt
    const checkInstallability = () => {
      const canShow = pwaInstall.canInstall() && !isRunningStandalone();
      setCanInstall(canShow);
      
      // Show prompt after 30 seconds if user hasn't installed
      if (canShow && !localStorage.getItem('g3-install-prompt-dismissed')) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Check immediately and then periodically
    checkInstallability();
    const interval = setInterval(checkInstallability, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      const installed = await installPrompt.showInstallPrompt();
      if (installed) {
        setShowPrompt(false);
        setCanInstall(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('g3-install-prompt-dismissed', 'true');
  };

  const getDeviceIcon = () => {
    const instructions = getInstallInstructions();
    switch (instructions.device) {
      case 'iOS':
        return <Smartphone size={20} />;
      case 'Android':
        return <Tablet size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  // Don't show if already installed as PWA
  if (isStandalone || !canInstall) {
    return null;
  }

  return (
    <>
      {/* Install Button (always visible when installable) */}
      {canInstall && (
        <button
          onClick={() => setShowPrompt(true)}
          className="fixed bottom-4 right-4 bg-lark-blue text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          title="Install G3 Tutor App"
        >
          <Download size={20} />
        </button>
      )}

      {/* Install Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getDeviceIcon()}
              <h3 className="text-lg font-semibold text-gray-800">
                Install G3 Tutor
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-3">
                Install the TSSA G3 Gas Technician Tutor app for:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Quick access from your home screen</li>
                <li>• Offline study capability</li>
                <li>• Faster loading times</li>
                <li>• Distraction-free learning</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-lark-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Manual install instructions */}
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Manual installation instructions
              </summary>
              <div className="mt-2 text-xs text-gray-500">
                {getInstallInstructions().steps.map((step, index) => (
                  <p key={index} className="mb-1">
                    {index + 1}. {step}
                  </p>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;