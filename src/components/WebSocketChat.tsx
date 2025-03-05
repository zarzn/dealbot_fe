'use client';

import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

interface Message {
  action: string;
  sender?: string;
  data?: string;
  message?: string;
  timestamp?: string;
  room?: string;
}

const WebSocketChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('general');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  
  // Get WebSocket URL from environment variable
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_API_URL || 'wss://1ze1jsv3qg.execute-api.us-east-1.amazonaws.com/prod';
  
  // Initialize WebSocket connection
  const { 
    isConnected, 
    messages, 
    sendMessage, 
    clearMessages,
    reconnect
  } = useWebSocket(wsUrl, {
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    onMessage: (message) => {
      console.log('Received message:', message);
    }
  });
  
  // Process incoming messages
  useEffect(() => {
    if (messages.length > 0) {
      // Process messages based on action
      messages.forEach(msg => {
        if (msg.action === 'messageResponse') {
          setChatMessages(prev => [...prev, msg]);
        } else {
          setSystemMessages(prev => [...prev, msg]);
        }
      });
      
      // Clear processed messages
      clearMessages();
    }
  }, [messages, clearMessages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage({
        action: 'sendMessage',
        data: message,
        room: room,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };
  
  // Handle joining a room
  const handleJoinRoom = () => {
    if (room.trim()) {
      sendMessage({
        action: 'joinRoom',
        roomId: room,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Handle leaving a room
  const handleLeaveRoom = () => {
    if (room.trim()) {
      sendMessage({
        action: 'leaveRoom',
        roomId: room,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Handle subscribing to a topic
  const handleSubscribe = () => {
    sendMessage({
      action: 'subscribe',
      topic: 'deals',
      timestamp: new Date().toISOString()
    });
  };
  
  // Handle getting price updates
  const handleGetPriceUpdate = () => {
    sendMessage({
      action: 'getPriceUpdate',
      symbol: 'BTC',
      timestamp: new Date().toISOString()
    });
  };
  
  // Handle getting notifications
  const handleGetNotification = () => {
    sendMessage({
      action: 'getNotification',
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">WebSocket Chat</h2>
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          {!isConnected && (
            <button 
              onClick={reconnect}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleJoinRoom}
          className="px-4 py-2 bg-green-500 text-white rounded-none hover:bg-green-600"
        >
          Join
        </button>
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-500 text-white rounded-r hover:bg-red-600"
        >
          Leave
        </button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleSubscribe}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Subscribe to Deals
        </button>
        <button
          onClick={handleGetPriceUpdate}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Get Price Update
        </button>
        <button
          onClick={handleGetNotification}
          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Get Notification
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-300 rounded p-4 bg-gray-50">
        <div className="space-y-2">
          {chatMessages.map((msg, index) => (
            <div key={`chat-${index}`} className="p-2 rounded bg-blue-100">
              <div className="font-semibold">{msg.sender || 'Anonymous'}</div>
              <div>{msg.data}</div>
              <div className="text-xs text-gray-500">{new Date(msg.timestamp || '').toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4 border border-gray-300 rounded p-4 bg-gray-50 max-h-40 overflow-y-auto">
        <h3 className="font-semibold mb-2">System Messages</h3>
        <div className="space-y-1">
          {systemMessages.map((msg, index) => (
            <div key={`system-${index}`} className="text-sm">
              <span className="font-medium">{msg.action}:</span> {msg.message || JSON.stringify(msg)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default WebSocketChat;