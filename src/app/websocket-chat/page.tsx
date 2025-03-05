'use client';

import React from 'react';
import WebSocketChat from '../../components/WebSocketChat';

export default function WebSocketChatPage() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">WebSocket Chat Demo</h1>
      <div className="h-[calc(100vh-200px)]">
        <WebSocketChat />
      </div>
    </div>
  );
} 