import { useEffect, useState, useRef } from 'react';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getConversations, getThread, sendMessage } from '../lib/api';

export default function Messages() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [thread, setThread] = useState([]);
  const [message, setMessage] = useState('');
  const threadRef = useRef(null);

  const loadConversations = () => {
    getConversations()
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [thread]);

  const openChat = async (otherUser) => {
    setActiveChat(otherUser);
    try {
      const d = await getThread(otherUser.id);
      setThread(d.messages || []);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    try {
      await sendMessage({ receiver_id: activeChat.id, content: message.trim() });
      setMessage('');
      const d = await getThread(activeChat.id);
      setThread(d.messages || []);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <>
      <PageBanner title="Messages" color="teal" />
      <div className="messages-layout">
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="listings-empty">No conversations yet.</div>
          )}
          {conversations.map((cv) => (
            <div
              key={cv.other_user_id}
              className={`conversation-item ${activeChat && activeChat.id === cv.other_user_id ? 'active' : ''}`}
              onClick={() => openChat({ id: cv.other_user_id, username: cv.other_username })}
            >
              <div className="conversation-main">
                <strong>{cv.other_username}</strong>
                <span className="muted">{cv.last_message || ''}</span>
              </div>
              {cv.unread_count > 0 && <span className="unread-badge">{cv.unread_count}</span>}
            </div>
          ))}
        </div>
        <div className="message-thread">
          <div className="thread-header">{activeChat ? activeChat.username : 'Select a conversation'}</div>
          <div className="thread-messages" ref={threadRef}>
            {activeChat && thread.length === 0 && <div className="listings-empty">No messages yet.</div>}
            {thread.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                  <div className="message-bubble">{m.content}</div>
                </div>
              );
            })}
          </div>
          {activeChat && (
            <div className="thread-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
