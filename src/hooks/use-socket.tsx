// hooks/useSocket.ts - FIXED VERSION
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/messaging';

interface UseSocketProps {
  userId: number;
  onNewMessage?: (message: Message, conversationId: number) => void;
  onUserTyping?: (userId: number, conversationId: number) => void;
  onUserStoppedTyping?: (userId: number, conversationId: number) => void;
}

export const useSocket = ({ userId, onNewMessage, onUserTyping, onUserStoppedTyping }: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Store callback refs to avoid dependency issues
  const onNewMessageRef = useRef(onNewMessage);
  const onUserTypingRef = useRef(onUserTyping);
  const onUserStoppedTypingRef = useRef(onUserStoppedTyping);

  // Update refs when callbacks change
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onUserTypingRef.current = onUserTyping;
  }, [onUserTyping]);

  useEffect(() => {
    onUserStoppedTypingRef.current = onUserStoppedTyping;
  }, [onUserStoppedTyping]);

  useEffect(() => {
    console.log('useSocket effect running with userId:', userId);
    
    // Don't initialize socket if userId is not available
    if (!userId) {
      console.log('No userId provided, skipping socket initialization');
      return;
    }

    // Prevent multiple socket connections
    if (socketRef.current?.connected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    console.log('Initializing socket connection to:', `${process.env.NEXT_PUBLIC_API_URL}`);

    // Initialize socket connection
    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}messaging`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      // Authenticate user only when userId is available
      if (userId) {
        console.log('Sending authenticate event with userId:', userId);
        socket.emit('authenticate', { userId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    // Authentication handlers
    socket.on('authenticated', (data) => {
      console.log('User authenticated successfully:', data);
      setIsAuthenticated(true);
    });

    socket.on('error', (error) => {
      console.error('Socket authentication error:', error);
      setIsAuthenticated(false);
    });

    // Message handlers - Use refs to access current callbacks
    socket.on('new_message', (data: { message: Message; conversationId: number }) => {
      console.log('New message received:', data);
      onNewMessageRef.current?.(data.message, data.conversationId);
    });

    socket.on('message_sent', (data: { messageId: number }) => {
      console.log('Message sent confirmation:', data);
    });

    // Typing handlers - Use refs to access current callbacks
    socket.on('user_typing_start', (data: { userId: number; conversationId: number }) => {
      onUserTypingRef.current?.(data.userId, data.conversationId);
    });

    socket.on('user_typing_stop', (data: { userId: number; conversationId: number }) => {
      onUserStoppedTypingRef.current?.(data.userId, data.conversationId);
    });

    // Cleanup
    return () => {
      console.log('Cleaning up socket connection');
      if (socket.connected) {
        socket.disconnect();
      }
      setIsConnected(false);
      setIsAuthenticated(false);
    };
  }, [userId]); // Only depend on userId, not the callback functions

  const joinConversation = useCallback((conversationId: number) => {
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('join_conversation', { conversationId });
      setCurrentConversationId(conversationId);
    }
  }, [isAuthenticated]);

  const leaveConversation = useCallback((conversationId: number) => {
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('leave_conversation', { conversationId });
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
    }
  }, [isAuthenticated, currentConversationId]);

  const sendMessage = useCallback((conversationId: number, content: string, messageType: string = 'text') => {
    console.log('CLAIMS ID: ', userId);
    
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('send_message', {
        conversationId,
        content,
        messageType,
        senderId: userId,
      });
    }
  }, [isAuthenticated, userId]);

  const startTyping = useCallback((conversationId: number) => {
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  }, [isAuthenticated]);

  const stopTyping = useCallback((conversationId: number) => {
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  }, [isAuthenticated]);

  const markMessageAsRead = useCallback((messageId: number) => {
    if (socketRef.current && isAuthenticated) {
      socketRef.current.emit('mark_message_read', { messageId });
    }
  }, [isAuthenticated]);

  return {
    isConnected,
    isAuthenticated,
    currentConversationId,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
  };
};