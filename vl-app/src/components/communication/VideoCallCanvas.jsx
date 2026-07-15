import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, User, Loader2 } from 'lucide-react';

const CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export default function VideoCallCanvas({ callState, onAccept, onReject, onHangUp, socket, localStream, setLocalStream }) {
  const { isIncoming, callerName, peerId, activeCall } = callState;

  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted]         = useState(false);
  const [videoOff, setVideoOff]         = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [statusText, setStatusText]     = useState('Initializing WebRTC...');

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const audioContext   = useRef(null);
  const oscillator     = useRef(null);

  // Play synthetic telephone ring tone when incoming
  useEffect(() => {
    if (isIncoming && !activeCall) {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Ringing timer loop
        const playRing = () => {
          if (!audioContext.current) return;
          const osc1 = audioContext.current.createOscillator();
          const osc2 = audioContext.current.createOscillator();
          const gain = audioContext.current.createGain();

          osc1.frequency.setValueAtTime(440, audioContext.current.currentTime); // Hz
          osc2.frequency.setValueAtTime(480, audioContext.current.currentTime);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioContext.current.destination);

          gain.gain.setValueAtTime(0.15, audioContext.current.currentTime);
          osc1.start();
          osc2.start();

          // Stop after 1.5 seconds
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
            } catch (e) {}
          }, 1500);
        };

        playRing();
        const interval = setInterval(playRing, 3500);

        return () => {
          clearInterval(interval);
          if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
          }
        };
      } catch (e) {
        console.error('Audio ringtone error:', e);
      }
    }
  }, [isIncoming, activeCall]);

  // Set up local camera on mount if active or incoming call accepted
  useEffect(() => {
    if (activeCall && !localStream) {
      setStatusText('Accessing media capture devices...');
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          initializeConnection(stream);
        })
        .catch((err) => {
          console.error('Media acquisition error:', err);
          setStatusText('Failed to access camera/microphone. Continuing audio-only/avatar.');
          initializeConnection(null);
        });
    } else if (activeCall && localStream) {
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      initializeConnection(localStream);
    }
  }, [activeCall]);

  const initializeConnection = (stream) => {
    setStatusText('Configuring peer connection...');
    const pc = new RTCPeerConnection(CONFIG);
    peerConnection.current = pc;

    // Attach local tracks
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Capture remote tracks
    pc.ontrack = (event) => {
      setStatusText('Connection established!');
      const [remote] = event.streams;
      setRemoteStream(remote);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    };

    // Relay Ice Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate
        });
      }
    };

    // Monitor Connection States
    pc.onconnectionstatechange = () => {
      console.log(`WebRTC Connection state changed: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setStatusText('Connected');
      } else if (pc.connectionState === 'disconnected') {
        setStatusText('Peer disconnected.');
      } else if (pc.connectionState === 'failed') {
        setStatusText('Connection failed. Retrying...');
      }
    };

    // WebRTC Offer/Answer hooks from socket
    socket.off('ice-candidate');
    socket.on('ice-candidate', async (data) => {
      if (data.candidate && peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    // Start dialing if we are the host (caller)
    if (!isIncoming) {
      makeCallOffer(pc);
    } else {
      receiveCallAnswer(pc);
    }
  };

  const makeCallOffer = async (pc) => {
    try {
      setStatusText('Dialing student browser...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        to: peerId,
        offer,
        callerId: socket.userId,
        callerName: 'Nodal Centre Support'
      });

      socket.off('call-answered');
      socket.on('call-answered', async (data) => {
        setStatusText('Call accepted! Connecting...');
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      });
    } catch (e) {
      console.error('Error creating WebRTC offer:', e);
      setStatusText('Dialing failed.');
    }
  };

  const receiveCallAnswer = async (pc) => {
    try {
      setStatusText('Answering...');
      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', {
        to: peerId,
        answer
      });
    } catch (e) {
      console.error('Error creating answer:', e);
      setStatusText('Answering failed.');
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (peerConnection.current) {
          const senders = peerConnection.current.getSenders();
          const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        // Auto restore when user clicks "Stop Sharing" from browser bar
        screenTrack.onended = () => {
          restoreCamera();
        };

        setScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    } else {
      restoreCamera();
    }
  };

  const restoreCamera = () => {
    if (localStream) {
      const cameraTrack = localStream.getVideoTracks()[0];
      if (peerConnection.current && cameraTrack) {
        const senders = peerConnection.current.getSenders();
        const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      }
      setScreenSharing(false);
    }
  };

  // Close connection & clean tracks
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    onHangUp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
      {/* 1. Incoming Call Dialog */}
      {isIncoming && !activeCall && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
          <div className="relative mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse">
            <User className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg leading-tight">{callerName || 'Instructor'}</h3>
            <p className="text-slate-400 text-xs mt-1">Incoming Video Call Request...</p>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
            >
              <PhoneOff className="w-4 h-4" /> Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors animate-bounce"
            >
              <Phone className="w-4 h-4" /> Accept
            </button>
          </div>
        </div>
      )}

      {/* 2. Active WebRTC Call Room */}
      {activeCall && (
        <div className="relative w-full max-w-4xl h-[75vh] md:h-[80vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          {/* Main Video View (Remote User) */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-slate-500 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{statusText}</p>
              </div>
            )}

            {/* PIP Local Video View */}
            <div className="absolute top-4 right-4 w-32 h-24 md:w-44 md:h-32 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg z-10">
              {localStream && !videoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Overlay Status Bar */}
            <div className="absolute bottom-4 left-4 bg-slate-950/75 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-300">
              Connection Status: {statusText}
            </div>
          </div>

          {/* Control Actions bar */}
          <div className="px-6 py-4 bg-slate-950/50 border-t border-white/5 flex justify-center items-center gap-4 z-20">
            <button
              onClick={toggleMic}
              title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`p-3 rounded-full border transition-all ${micMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              title={videoOff ? 'Turn camera on' : 'Turn camera off'}
              className={`p-3 rounded-full border transition-all ${videoOff ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              title={screenSharing ? 'Stop screen sharing' : 'Share screen'}
              className={`p-3 rounded-full border transition-all ${screenSharing ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
            >
              {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCall}
              title="Hang up call"
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-colors border border-rose-600"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
