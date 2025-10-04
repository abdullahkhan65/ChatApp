import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import type { Message } from '../services/socket';
import './Chat.css';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    console.log('🔌 Connecting to WebSocket with token:', token);
    const socket = socketService.connect(token);

    socket.on('connect', () => {
      console.log('✅ WebSocket connected!');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    socketService.getMessages((msgs) => {
      console.log('📨 Received messages:', msgs);
      setMessages(msgs);
    });

    socketService.onNewMessage((message) => {
      console.log('📩 New message received:', message);
      console.log('Reply data:', message.replyTo);
      setMessages((prev) => [...prev, message]);
    });

    socketService.onUserJoined((data) => {
      console.log('👋 User joined:', data);
      setConnectedUsers(data.connectedUsers);
    });

    socketService.onUserLeft((data) => {
      console.log('👋 User left:', data);
      setConnectedUsers(data.connectedUsers);
    });

    socketService.onUserTyping((data) => {
      console.log('⌨️ User typing:', data);
      if (data.isTyping) {
        setTypingUsers((prev) => [...prev.filter((u) => u !== data.username), data.username]);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    });

    socketService.onMessageRead((data) => {
      console.log('✓✓ Message read:', data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, readBy: data.readBy } : msg
        )
      );
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      socketService.disconnect();
    };
  }, [token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Mark messages as read when they appear
    messages.forEach((msg) => {
      if (msg.userId !== user?.id && (!msg.readBy || !msg.readBy.includes(user?.id || ''))) {
        socketService.markAsRead(msg.id);
      }
    });
  }, [messages, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, replyingTo?.id);
      socketService.sendTyping(false);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    socketService.sendTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(false);
    }, 2000);
  };

  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chat App</h2>
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <div className="online-users">
          <h3>Online ({connectedUsers.length})</h3>
          <ul>
            {connectedUsers.map((username, idx) => (
              <li key={idx} className="online-user">
                <span className="online-indicator"></span>
                {username}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-main">
        <div className="messages-container">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              ref={(el) => {
                if (el) messageRefs.current.set(msg.id, el);
              }}
              className={`message ${msg.userId === user?.id ? 'own-message' : ''} ${
                highlightedMessageId === msg.id ? 'highlighted' : ''
              }`}
            >
              <div className="message-header">
                <span className="message-username">{msg.username}</span>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {msg.replyTo && (
                <div
                  className="reply-preview"
                  onClick={() => scrollToMessage(msg.replyTo!.id)}
                  title="Click to view original message"
                >
                  <div className="reply-icon">↩</div>
                  <div className="reply-content">
                    <span className="reply-username">{msg.replyTo.username}</span>
                    <span className="reply-text">{msg.replyTo.content}</span>
                  </div>
                </div>
              )}
              <div className="message-content">
                {msg.content}
                {msg.userId === user?.id && msg.readBy && msg.readBy.length > 0 && (
                  <span className="read-receipt" title={`Read by ${msg.readBy.length} user(s)`}>
                    ✓✓
                  </span>
                )}
              </div>
              <button
                className="reply-button"
                onClick={() => handleReply(msg)}
                title="Reply to this message"
              >
                ↩
              </button>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span className="typing-text">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="replying-to-banner">
            <div className="replying-to-content">
              <span className="replying-to-label">Replying to {replyingTo.username}</span>
              <span className="replying-to-text">{replyingTo.content}</span>
            </div>
            <button onClick={cancelReply} className="cancel-reply-button">
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : 'Type a message...'}
            className="message-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
