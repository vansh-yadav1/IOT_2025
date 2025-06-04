const API_BASE = '/api/messaging';

export const messagingService = {
  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },
  async createConversation(patient_id: string, doctor_id: string) {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ patient_id, doctor_id })
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },
  async getMessages(conversation_id: string) {
    const res = await fetch(`${API_BASE}/messages?conversation_id=${conversation_id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },
  async sendMessage(conversation_id: string, content: string) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversation_id, content })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
}; 