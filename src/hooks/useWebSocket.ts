import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  action: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<Event | null>(null);
  const reconnectCount = useRef(0);
  const maxReconnectAttempts = options.reconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  // Create WebSocket connection
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        if (options.onOpen) options.onOpen(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);
          if (options.onMessage) options.onMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        if (options.onClose) options.onClose(event);
        
        // Attempt to reconnect
        if (reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current += 1;
          console.log(`Attempting to reconnect (${reconnectCount.current}/${maxReconnectAttempts})...`);
          setTimeout(connect, reconnectInterval);
        } else {
          console.log('Max reconnection attempts reached');
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(event);
        if (options.onError) options.onError(event);
      };
      
      setSocket(ws);
      return ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      return null;
    }
  }, [url, options, maxReconnectAttempts, reconnectInterval]);
  
  // Connect on mount
  useEffect(() => {
    const ws = connect();
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);
  
  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && isConnected) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('Error sending WebSocket message:', err);
        return false;
      }
    }
    return false;
  }, [socket, isConnected]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Disconnect function
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);
  
  // Reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    reconnectCount.current = 0;
    connect();
  }, [socket, connect]);
  
  return {
    isConnected,
    messages,
    error,
    sendMessage,
    clearMessages,
    disconnect,
    reconnect
  };
}

export default useWebSocket; 