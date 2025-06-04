import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Snackbar, Alert, Autocomplete, List, ListItem, ListItemText, Avatar, Chip, IconButton } from '@mui/material';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { fetchAllDoctors, fetchAllPatients } from '../../services/doctorService';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// New ChatMessage component for modularity
const ChatMessage: React.FC<{ message: any; isOwnMessage: boolean; senderName: string }> = ({ message, isOwnMessage, senderName }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        mb: 1,
        alignItems: 'flex-end',
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mr: isOwnMessage ? 0 : 1,
          ml: isOwnMessage ? 1 : 0,
          bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
        }}
      >
        {senderName.charAt(0)}
      </Avatar>
      <Box
        sx={{
          bgcolor: isOwnMessage ? 'primary.light' : 'grey.200',
          color: 'black',
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: '70%',
          position: 'relative',
        }}
      >
        <Typography variant="body2">
          <strong>{senderName}:</strong> {message.content}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
        </Typography>
      </Box>
    </Box>
  );
};

// New ChatHeader component for modularity
const ChatHeader: React.FC<{ recipientName: string; isOnline: boolean }> = ({ recipientName, isOnline }) => {
  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #eee', fontWeight: 600, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'secondary.main' }}>
          {recipientName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{recipientName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FiberManualRecordIcon sx={{ fontSize: 12, color: isOnline ? 'success.main' : 'grey.500', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>
      </Box>
      <IconButton size="small">
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.user_metadata?.role === 'DOCTOR';

  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [newMessageMode, setNewMessageMode] = useState(false);
  const [newRecipient, setNewRecipient] = useState<any>(null);
  const [allUserMessages, setAllUserMessages] = useState<any[]>([]);
  // New states for typing indicators and read receipts
  const [isTyping, setIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});

  // Fetch doctors/patients for dropdowns and sidebar
  useEffect(() => {
    if (!isDoctor) {
      fetchAllDoctors()
        .then(data => Array.isArray(data) ? setDoctors(data.map(doc => ({ ...doc, name: doc.full_name }))) : setDoctors([]))
        .catch(() => setDoctors([]));
    } else {
      fetchAllPatients()
        .then(data => {
          setPatients((data || []).map(p => ({ ...p, name: p.full_name || p.email })));
          // Add the current doctor to the doctors array for name lookups
          setDoctors([
            {
              id: user?.id,
              name: user?.user_metadata?.full_name || user?.email || 'Unknown',
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || '',
            },
          ]);
        })
        .catch(() => setPatients([]));
    }
  }, [isDoctor, user]);

  // Fetch all messages for the user (for sidebar)
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const fetchAllUserMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      setAllUserMessages(data || []);
      setLoading(false);
    };
    fetchAllUserMessages();
    // Realtime subscription for new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        fetchAllUserMessages();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  // Helper to determine if a message is deleted for the current user
  const isMessageVisible = (msg: any) => {
    if (!user?.id) return false;
    if (msg.sender_id === user.id) return !msg.deleted_for_sender;
    if (msg.receiver_id === user.id) return !msg.deleted_for_receiver;
    return false;
  };

  // Build visible conversations from allUserMessages
  const visibleConversations = React.useMemo(() => {
    if (!user) return [];
    // Only use messages visible to the current user
    const visibleMsgs = (allUserMessages || []).filter(isMessageVisible);
    // Group by other user
    const map = new Map();
    visibleMsgs.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!map.has(otherId)) {
        map.set(otherId, msg);
      }
    });
    return Array.from(map.values()).map((msg) => {
      let otherUser;
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (isDoctor) {
        otherUser = patients.find((p) => p.id === otherId);
      } else {
        otherUser = doctors.find((d) => d.id === otherId);
      }
      // Fallbacks for display name
      let displayName =
        otherUser?.name ||
        otherUser?.email ||
        msg.receiver_name ||
        msg.sender_name ||
        msg.receiver_email ||
        msg.sender_email ||
        otherId ||
        'Unknown';
      return {
        id: otherId,
        name: displayName,
        lastMessage: msg.content,
        lastTime: msg.created_at ? new Date(msg.created_at).toLocaleString() : '',
      };
    });
  }, [allUserMessages, isDoctor, patients, doctors, user?.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user?.id || !selectedConversation?.id) {
      setMessages([]);
      return;
    }
    setLoading(true);
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation.id}),and(sender_id.eq.${selectedConversation.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
    // Realtime subscription for new messages in this conversation
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedConversation.id) ||
          (msg.sender_id === selectedConversation.id && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id, selectedConversation]);

  // Start a new message
  const handleStartNew = () => {
    setNewMessageMode(true);
    setNewRecipient(null);
    setMessage('');
  };

  // Send a message (new or existing conversation)
  const handleSend = async () => {
    let receiverId = selectedConversation?.id;
    let recipientUser = null;
    if (newMessageMode && newRecipient) receiverId = newRecipient.id;
    if (!user?.id || !receiverId || !message.trim()) return;
    // Find recipient user object for name/email
    if (isDoctor) {
      recipientUser = patients.find((p) => p.id === receiverId) || doctors.find((d) => d.id === receiverId);
    } else {
      recipientUser = doctors.find((d) => d.id === receiverId) || patients.find((p) => p.id === receiverId);
    }
    setSending(true);
    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        sender_name: user?.user_metadata?.full_name || null,
        sender_email: user?.email || null,
        receiver_id: receiverId,
        receiver_name: recipientUser?.name || recipientUser?.full_name || recipientUser?.email || null,
        receiver_email: recipientUser?.email || null,
        content: message,
      },
    ]);
    setSending(false);
    setMessage('');
    if (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } else {
      setNewMessageMode(false);
      setNewRecipient(null);
      // Refetch doctors/patients
      if (!isDoctor) {
        fetchAllDoctors()
          .then(data => setDoctors((data || []).map(doc => ({ ...doc, name: doc.full_name }))))
          .catch(() => setDoctors([]));
      } else {
        fetchAllPatients()
          .then(data => setPatients((data || []).map(p => ({ ...p, name: p.full_name || p.email }))))
          .catch(() => setPatients([]));
      }
    }
  };

  // Delete a conversation (soft delete for current user only)
  const handleDeleteConversation = async (convId: string) => {
    if (!user?.id || !convId) return;
    setLoading(true);
    // Update deleted_for_sender or deleted_for_receiver for all messages in this conversation
    const isSender = (msg: any) => msg.sender_id === user.id;
    const isReceiver = (msg: any) => msg.receiver_id === user.id;
    // Fetch all messages in this conversation
    const { data: msgs, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, deleted_for_sender, deleted_for_receiver')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${convId}),and(sender_id.eq.${convId},receiver_id.eq.${user.id})`);
    if (fetchError) {
      setLoading(false);
      setSnackbar({ open: true, message: fetchError.message, severity: 'error' });
      return;
    }
    // Prepare updates
    const updates = (msgs || []).map((msg: any) => {
      if (msg.sender_id === user.id) {
        return { id: msg.id, deleted_for_sender: true };
      } else if (msg.receiver_id === user.id) {
        return { id: msg.id, deleted_for_receiver: true };
      }
      return null;
    }).filter(Boolean);
    // Batch update
    for (const update of updates) {
      if (update && update.id) {
        await supabase.from('messages').update(update).eq('id', update.id);
      }
    }
    setLoading(false);
    // Update conversations state
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    // Update allUserMessages to remove the conversation from the UI
    setAllUserMessages((prev) => prev.filter((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      return otherId !== convId;
    }));
    if (selectedConversation?.id === convId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '80vh', maxWidth: 1000, mx: 'auto', mt: 6, bgcolor: '#fafbfc', borderRadius: 3, boxShadow: 2 }}>
      {/* Sidebar: Conversation List */}
      <Box sx={{ width: 300, borderRight: '1px solid #eee', height: '100%', overflowY: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Conversations</span>
          <Button size="small" variant="contained" onClick={handleStartNew}>+ New Message</Button>
        </Box>
        <List>
          {visibleConversations.length === 0 && (
            <Typography sx={{ p: 2 }} color="text.secondary">
              No conversations yet.
            </Typography>
          )}
          {visibleConversations.map((conv) => (
            <ListItem
              button
              key={conv.id}
              selected={selectedConversation && conv.id === selectedConversation.id}
              onClick={() => { setSelectedConversation(conv); setNewMessageMode(false); }}
              secondaryAction={
                <DeleteIcon
                  sx={{ color: 'error.main', cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                />
              }
            >
              <ListItemText
                primary={conv.name}
                secondary={conv.lastMessage ? `${conv.lastMessage} • ${conv.lastTime}` : ''}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {newMessageMode ? (
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', fontWeight: 600, minHeight: 56 }}>
            New Message
          </Box>
        ) : selectedConversation ? (
          <ChatHeader recipientName={selectedConversation.name} isOnline={true} />
        ) : (
          <Box sx={{ p: 2, borderBottom: '1px solid #eee', fontWeight: 600, minHeight: 56 }}>
            Select a conversation
          </Box>
        )}
        {/* New Message Mode */}
        {newMessageMode && (
          <Box sx={{ p: 2 }}>
            <Autocomplete
              options={isDoctor ? patients : doctors}
              getOptionLabel={option => option?.name || ''}
              value={newRecipient}
              onChange={(_, value) => setNewRecipient(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label={isDoctor ? 'Search or Select Patient' : 'Search or Select Doctor'}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                />
              )}
            />
          </Box>
        )}
        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f7f7fa' }}>
          {loading ? (
            <CircularProgress />
          ) : newMessageMode && !newRecipient ? (
            <Typography color="text.secondary">Select a recipient to start a new conversation.</Typography>
          ) : (
            (messages.filter(isMessageVisible).length === 0 && !newMessageMode) ? (
              <Typography color="text.secondary">No messages yet.</Typography>
            ) : (
              messages.filter(isMessageVisible).map((msg, idx) => {
                // Find sender name with robust fallback
                let senderName = 'Unknown';
                if (msg.sender_id === user?.id) {
                  // Show your actual name if available, otherwise 'You'
                  senderName = user?.user_metadata?.full_name || user?.email || 'You';
                } else {
                  // Try to find the user in both doctors and patients arrays
                  let otherUser = doctors.find((d) => d.id === msg.sender_id) || patients.find((p) => p.id === msg.sender_id);
                  senderName =
                    otherUser?.name ||
                    otherUser?.email ||
                    msg.sender_name ||
                    msg.receiver_name ||
                    msg.sender_email ||
                    msg.receiver_email ||
                    msg.sender_id ||
                    'Unknown';
                }
                return (
                  <ChatMessage
                    key={msg.id || idx}
                    message={msg}
                    isOwnMessage={user?.id === msg.sender_id}
                    senderName={senderName}
                  />
                );
              })
            )
          )}
        </Box>
        {/* Message Box */}
        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <TextField
            label="Type your message"
            multiline
            minRows={2}
            fullWidth
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{ mb: 2 }}
            disabled={(!selectedConversation && !newRecipient) || sending}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={
              ((!selectedConversation && !newRecipient) || !message.trim() || sending)
            }
            onClick={handleSend}
          >
            {sending ? <CircularProgress size={20} color="inherit" /> : 'Send'}
          </Button>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default MessagingPage; 