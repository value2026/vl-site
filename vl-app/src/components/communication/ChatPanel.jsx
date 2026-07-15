import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  MessageSquare, X, Send, Phone, Calendar, User,
  Circle, AlertCircle, PhoneIncoming, Loader2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import MeetingSchedulerModal from './MeetingSchedulerModal';
import VideoCallCanvas from './VideoCallCanvas';

export default function ChatPanel() {
  const { user, token } = useAuth();
  if (!user) return null;

  const [isOpen, setIsOpen]           = useState(false);
  const [contacts, setContacts]       = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [messageText, setMessageText] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Modals state
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  
  // WebRTC Call State
  const [localStream, setLocalStream] = useState(null);
  const [callState, setCallState] = useState({
    isIncoming: false,
    activeCall: false,
    peerId: null,
    callerName: '',
    offer: null
  });

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Establish WebSocket Connection ───────────────────────────
  useEffect(() => {
    if (!isOpen) {
      // Disconnect socket if chat drawer is closed to save resources
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to server
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const s = io(socketUrl, {
      credentials: true
    });
    socketRef.current = s;

    // Join WebSocket session
    s.emit('join-session', user.id);

    // Socket Event listeners
    s.on('online-users-list', (usersList) => {
      setOnlineUserIds(usersList);
    });

    s.on('receive-chat-message', (msg) => {
      // Append if it belongs to the current conversation
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === msg.id)) return prev;
        if (
          (msg.senderId === user.id && msg.receiverId === activeContact?.id) ||
          (msg.senderId === activeContact?.id && msg.receiverId === user.id)
        ) {
          return [...prev, msg];
        }
        return prev;
      });
      scrollToBottom();
    });

    // WebRTC Signaling Inbound hooks
    s.on('incoming-call', (data) => {
      setCallState({
        isIncoming: true,
        activeCall: false,
        peerId: data.from,
        callerName: data.callerName || 'Instructor Support',
        offer: data.offer
      });
    });

    s.on('call-ended', () => {
      // Clean tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setCallState({ isIncoming: false, activeCall: false, peerId: null, callerName: '', offer: null });
    });

    // Load initial contacts list
    fetchContacts();

    return () => {
      if (s) s.disconnect();
    };
  }, [isOpen, activeContact?.id]);

  // Handle join-call custom event from UpcomingCallsCard
  useEffect(() => {
    const handleJoinCallEvent = (e) => {
      const { peerId, peerName } = e.detail;
      setIsOpen(true); // Open the support desk drawer
      setCallState({
        isIncoming: false,
        activeCall: true,
        peerId,
        callerName: peerName,
        offer: null
      });
    };
    window.addEventListener('webrtc-join-call', handleJoinCallEvent);
    return () => window.removeEventListener('webrtc-join-call', handleJoinCallEvent);
  }, []);

  // Load chat history when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchChatLogs(activeContact.id);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await api.get('/calls/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchChatLogs = async (peerId) => {
    setLoadingChat(true);
    try {
      const res = await api.get(`/calls/chat/${peerId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContact || !socketRef.current) return;

    // Emit to backend socket server
    socketRef.current.emit('send-chat-message', {
      senderId: user.id,
      receiverId: activeContact.id,
      content: messageText.trim()
    });

    setMessageText('');
  };

  const handleStartVideoCall = () => {
    if (!activeContact || !socketRef.current) return;
    setCallState({
      isIncoming: false,
      activeCall: true,
      peerId: activeContact.id,
      callerName: activeContact.name,
      offer: null
    });
  };

  const handleAcceptCall = () => {
    setCallState(prev => ({ ...prev, activeCall: true }));
  };

  const handleRejectCall = () => {
    if (socketRef.current && callState.peerId) {
      socketRef.current.emit('hang-up', { to: callState.peerId });
    }
    setCallState({ isIncoming: false, activeCall: false, peerId: null, callerName: '', offer: null });
  };

  const handleHangUpCall = () => {
    if (socketRef.current && callState.peerId) {
      socketRef.current.emit('hang-up', { to: callState.peerId });
    }
    setCallState({ isIncoming: false, activeCall: false, peerId: null, callerName: '', offer: null });
  };

  const getRoleLabel = (r) => {
    return { admin: 'Admin', nodal_centre: 'Nodal Centre', teacher: 'Teacher', student: 'Student' }[r] || 'User';
  };

  return (
    <>
      {/* ── Persistent FLOATING CHAT BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 shadow-xl hover:from-blue-600 hover:to-indigo-700 hover:scale-105 active:scale-95 transition-all duration-200"
        title="Open Support Chat & Calling"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </button>

      {/* ── WebRTC Video calling screen wrapper ── */}
      {(callState.isIncoming || callState.activeCall) && (
        <VideoCallCanvas
          callState={callState}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onHangUp={handleHangUpCall}
          socket={socketRef.current}
          localStream={localStream}
          setLocalStream={setLocalStream}
        />
      )}

      {/* ── Slide out communication drawer ── */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-slate-950/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="text-white font-extrabold text-sm uppercase tracking-wider">Virtual Support Desk</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Contact Mode View */}
            {!activeContact ? (
              <div className="w-full flex flex-col p-4 space-y-4">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400 px-1">Contacts Support Directory</h4>
                {loadingContacts ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs">Loading contacts list...</span>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-semibold">No contacts available.</p>
                    <p className="text-[10px] text-slate-600">Students and teachers can only contact their immediate academic supervisors.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {contacts.map((c) => {
                      const isOnline = onlineUserIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveContact(c)}
                          className="bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-150 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white text-xs font-bold font-mono">
                              {c.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">{c.name}</div>
                              <div className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-wider font-bold">
                                {getRoleLabel(c.role)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Circle className={`w-2.5 h-2.5 ${isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-slate-600 fill-slate-600'}`} />
                            <span className="text-[10px] font-semibold text-slate-500">{isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Conversation Chat Mode View */
              <div className="w-full flex flex-col overflow-hidden">
                {/* Active Header */}
                <div className="px-4 py-3 bg-slate-950/20 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveContact(null)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-white text-sm font-bold leading-tight">{activeContact.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${onlineUserIds.includes(activeContact.id) ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span className="text-[10px] text-slate-500 capitalize">{onlineUserIds.includes(activeContact.id) ? 'online' : 'offline'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Call and Schedule) */}
                  <div className="flex items-center gap-2">
                    {onlineUserIds.includes(activeContact.id) && (
                      <button
                        onClick={handleStartVideoCall}
                        title="Start Instant Video Call"
                        className="p-2 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsSchedulerOpen(true)}
                      title="Schedule future Video Call"
                      className="p-2 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-slate-600 text-xs italic text-center py-20">No conversation history. Say hello!</p>
                  ) : (
                    messages.map((m) => {
                      const isSelf = m.senderId === user.id;
                      return (
                        <div key={m.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs text-white ${isSelf ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/5' : 'bg-slate-800'}`}>
                            <div>{m.content}</div>
                            <div className="text-[8px] text-white/50 text-right mt-1.5">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send chat block form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Message ${activeContact.name.split(' ')[0]}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Schedule modal trigger ── */}
      {isSchedulerOpen && (
        <MeetingSchedulerModal
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
          contact={activeContact}
        />
      )}
    </>
  );
}
