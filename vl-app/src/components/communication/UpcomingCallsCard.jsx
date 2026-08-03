import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Check, X, Loader2, AlertCircle, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';


const STATUS_STYLES = {
  accepted: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  pending:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
  declined: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

export default function UpcomingCallsCard() {
  const { user } = useAuth();

  const [calls, setCalls]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState(null);


  useEffect(() => {
    if (user) {
      fetchScheduledCalls();
    }
  }, [user]);

  const fetchScheduledCalls = async () => {
    try {
      const res = await api.get('/calls/scheduled');
      if (res.ok) setCalls(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (callId, status) => {
    const key = callId + '_' + status;
    setActionId(key);
    try {
      const res = await api.post(`/calls/schedule/${callId}/update`, { status });
      if (res.ok) fetchScheduledCalls();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const triggerJoinCall = (call) => {
    // Collect all other participants' ids for calling
    const peers = call.invitees
      .map(inv => inv.user)
      .filter(u => u.id !== user.id);
    if (peers.length === 0 && call.host.id !== user.id) return;
    const peer = call.hostId === user.id ? peers[0] : call.host;
    if (!peer) return;
    window.dispatchEvent(new CustomEvent('webrtc-join-call', {
      detail: { peerId: peer.id, peerName: peer.name }
    }));
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span className="text-slate-400 text-xs">Loading appointments...</span>
      </div>
    );
  }

  const now = Date.now();
  const activeSchedules = calls.filter(c => {
    const end = new Date(c.scheduledAt).getTime() + (c.duration * 60 * 1000);
    // Exclude calls where current user has declined
    const myRecord = c.invitees?.find(inv => inv.userId === user.id);
    if (myRecord?.status === 'declined') return false;
    return end > now;
  });

  return (
    <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-5 backdrop-blur-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Scheduled Consultations</h4>
        </div>

      </div>

      {activeSchedules.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-8 space-y-2">
          <AlertCircle className="w-7 h-7 text-slate-600" />
          <p className="text-xs font-semibold">No upcoming consultations.</p>

        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-0.5">
          {activeSchedules.map(call => {
            const isHost   = call.hostId === user.id;
            const start    = new Date(call.scheduledAt).getTime();
            const end      = start + (call.duration * 60 * 1000);
            const canJoin  = now >= (start - 10 * 60 * 1000) && now <= end;

            // My invitee record (if I'm not the host)
            const myRecord = call.invitees?.find(inv => inv.userId === user.id);
            const myStatus = isHost ? 'host' : (myRecord?.status || 'pending');

            // All accepted invitees (to show in participants list)
            return (
              <div key={call.id} className="bg-slate-950/20 border border-white/5 rounded-xl p-4 space-y-3">
                {/* Title + status */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h5 className="text-white font-bold text-sm leading-snug truncate">{call.title}</h5>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      Host: <span className="text-slate-300 font-semibold">{call.host.name}</span>
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                    isHost ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                    STATUS_STYLES[myStatus] || STATUS_STYLES.pending
                  }`}>
                    {isHost ? 'Host' : myStatus}
                  </span>
                </div>

                {/* Participants */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Participants</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Host chip */}
                    <span className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {call.host.name.split(' ')[0]} <span className="text-indigo-500/60">(host)</span>
                    </span>
                    {/* Invitee chips */}
                    {call.invitees?.map(inv => (
                      <span key={inv.id} className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[inv.status] || STATUS_STYLES.pending}`}>
                        {inv.user.name.split(' ')[0]}
                        <span className="opacity-60">({inv.status})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date + time */}
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(call.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(call.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {call.duration} min
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-0.5">
                  {/* Invitee accept/decline when pending */}
                  {!isHost && myStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(call.id, 'declined')}
                        disabled={actionId !== null}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold border border-rose-500/20 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(call.id, 'accepted')}
                        disabled={actionId !== null}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                    </>
                  )}

                  {/* Join call button — for host always, for accepted invitees */}
                  {(isHost || myStatus === 'accepted') && (
                    <button
                      onClick={() => triggerJoinCall(call)}
                      disabled={!canJoin}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold border transition-all ${
                        canJoin
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/10'
                          : 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      {canJoin ? 'Join Video Call Room' : 'Waiting for Start Time'}
                    </button>
                  )}

                  {/* Host waiting message when all invitees are pending */}
                  {isHost && !canJoin && (
                    <p className="text-[9px] text-slate-600 italic text-center w-full pt-0.5">
                      Invitations sent · awaiting responses
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}
