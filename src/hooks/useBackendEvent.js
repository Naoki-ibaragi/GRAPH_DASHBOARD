import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';

/**
 * Tauriバックエンドイベントを購読するカスタムフック
 * @param {string} eventName - イベント名
 * @param {Function} onEvent - イベント発火時のコールバック
 * @param {Array} dependencies - useEffectの依存配列
 */
export const useBackendEvent = (eventName, onEvent, dependencies = []) => {
  const unlistenRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const setupListener = async () => {
      try {
        unlistenRef.current = await listen(eventName, (event) => {
          if (mounted) {
            onEvent(event.payload);
          }
        });
      } catch (error) {
        console.error(`Failed to setup listener for ${eventName}:`, error);
      }
    };

    setupListener();

    return () => {
      mounted = false;
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, [eventName, ...dependencies]);
};
