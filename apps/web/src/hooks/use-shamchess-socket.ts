import { useEffect } from 'react';

type SocketOptions<T> = {
  path: string;
  onMessage: (payload: T) => void;
  onOpen?: () => void;
  onClose?: () => void;
  mockGenerator?: (emit: (payload: T) => void) => () => void;
};

export function useShamChessSocket<T>({ path, onMessage, onOpen, onClose, mockGenerator }: SocketOptions<T>): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host || 'localhost:8000';
    const url = `${protocol}://${host}${path}`;

    let socket: WebSocket | null = null;
    let disposeMock: (() => void) | undefined;

    try {
      socket = new WebSocket(url);
      socket.onopen = () => {
        onOpen?.();
      };
      socket.onclose = () => {
        onClose?.();
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessage(payload);
        } catch (error) {
          console.error('تعذر تحليل رسالة الويب سوكيت', error);
        }
      };
    } catch (error) {
      console.warn('تعذر فتح اتصال WebSocket، سيتم استخدام بيانات محاكاة.', error);
      if (mockGenerator) {
        disposeMock = mockGenerator(onMessage);
        onOpen?.();
      }
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      disposeMock?.();
      onClose?.();
    };
  }, [mockGenerator, onClose, onMessage, onOpen, path]);
}
