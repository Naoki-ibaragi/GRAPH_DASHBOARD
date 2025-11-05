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

/**
 * 進捗とComplete両方のイベントを購読するカスタムフック
 * @param {string} baseName - イベント名のベース（例: 'graph_data'）
 * @param {Function} onProgress - 進捗イベントのコールバック
 * @param {Function} onComplete - 完了イベントのコールバック
 * @param {Array} dependencies - useEffectの依存配列
 */
export const useBackendTask = (baseName, onProgress, onComplete, dependencies = []) => {
  const progressEventName = `${baseName}-progress`;
  const completeEventName = `${baseName}-complete`;
  const unlistenRefs = useRef({ progress: null, complete: null });

  useEffect(() => {
    let mounted = true;

    const setupListeners = async () => {
      try {
        // 進捗リスナー
        unlistenRefs.current.progress = await listen(progressEventName, (event) => {
          if (mounted && onProgress) {
            onProgress(event.payload);
          }
        });

        // 完了リスナー
        unlistenRefs.current.complete = await listen(completeEventName, (event) => {
          if (mounted && onComplete) {
            onComplete(event.payload);
          }
        });
      } catch (error) {
        console.error(`Failed to setup listeners for ${baseName}:`, error);
      }
    };

    setupListeners();

    return () => {
      mounted = false;
      if (unlistenRefs.current.progress) {
        unlistenRefs.current.progress();
      }
      if (unlistenRefs.current.complete) {
        unlistenRefs.current.complete();
      }
      unlistenRefs.current = { progress: null, complete: null };
    };
  }, [baseName, ...dependencies]);
};
