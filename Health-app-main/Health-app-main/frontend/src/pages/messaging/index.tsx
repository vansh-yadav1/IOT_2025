import React, { useEffect, useState } from 'react';
import { messagingService } from '../../services/messagingService';

export default function MessagingPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    messagingService.getConversations()
      .then(data => setConversations(data))
      .catch(err => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      setLoading(true);
      setError(null);
      messagingService.getMessages(selected.id)
        .then(setMessages)
        .catch(() => setError('Failed to load messages'))
        .finally(() => setLoading(false));
    }
  }, [selected]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    setLoading(true);
    setError(null);
    try {
      await messagingService.sendMessage(selected.id, newMsg);
      setNewMsg('');
      const msgs = await messagingService.getMessages(selected.id);
      setMessages(msgs);
    } catch {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '80vh' }}>
      <div style={{ width: 300, borderRight: '1px solid #ccc', padding: 16 }}>
        <h2>Conversations</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && conversations.length === 0 && <div>No conversations found.</div>}
        <ul>
          {conversations.map(conv => (
            <li key={conv.id} style={{ margin: 8 }}>
              <button onClick={() => setSelected(conv)} style={{ fontWeight: selected?.id === conv.id ? 'bold' : 'normal' }}>
                {conv.patient_id} - {conv.doctor_id}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        {selected ? (
          <>
            <h3>Messages</h3>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div style={{ height: '60vh', overflowY: 'auto', border: '1px solid #eee', marginBottom: 8 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ margin: 4, textAlign: 'left' }}>
                  <b>{msg.sender_id}:</b> {msg.content}
                </div>
              ))}
            </div>
            <div>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ width: '80%' }} />
              <button onClick={sendMessage} disabled={loading}>Send</button>
            </div>
          </>
        ) : <div>Select a conversation</div>}
      </div>
    </div>
  );
} 