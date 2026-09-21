import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState(null);

  const checkConnection = useCallback(async () => {
    setIsReconnecting(true);
    try {
      // Ping API endpoint or favicon with no-cache to test real internet connectivity
      const res = await fetch(`/favicon.ico?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      if (res.ok || res.status < 500) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sanity check on mount
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isReconnecting,
    wasOffline,
    lastOfflineTime,
    checkConnection,
    resetWasOffline: () => setWasOffline(false),
  };
};

export default useNetworkStatus;
