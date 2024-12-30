import { useCallback, useRef } from 'react';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { useModel } from '@/models';
import { createRelogin } from '@/shared/tools';

type EventSourceOption = {
  url: string;
  parseData?: boolean; // 是否需要解析
  payload?: Record<string, unknown>; // fetch 参数
};

type EventSourceCallback = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

/**
 * Hook
 * @description 使用EventSource
 * @returns {Object<*>}
 */
const useEventSource = <T>() => {
  /**
   * Context
   */
  const token = useModel(state => state.token);

  /**
   * Ref
   * @description 控制器
   */
  const controller = useRef<AbortController>(new AbortController());

  /**
   * Callback
   * @description 终止信号
   * @returns {void}
   */
  const stop = useCallback(() => {
    controller.current.abort();
    controller.current = new AbortController();
  }, []);

  /**
   * Callback
   * @description 开始引流
   * @param {EventSourceOption} option
   * @param {Function} onMessage
   * @returns {void}
   */
  const start = useCallback(
    (option: EventSourceOption, onMessage: (message: T) => void, callback?: EventSourceCallback) => {
      if (!token) return void 0;

      const { url, parseData = true, payload } = option;

      // 建立事件流
      fetchEventSource(url, {
        openWhenHidden: true,
        signal: controller.current.signal,
        method: payload ? 'POST' : 'GET',
        headers: {
          token,
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : null,
        onopen: async response => {
          createRelogin(response.status);
          callback?.onOpen?.();
        },
        onmessage: event => {
          onMessage(parseData ? JSON.parse(event.data) : event.data);
        },
        onclose: () => callback?.onClose?.(),
        onerror: () => callback?.onError?.(),
      });

      return () => {
        stop();
      };
    },
    [stop, token],
  );

  return { start };
};

export default useEventSource;
