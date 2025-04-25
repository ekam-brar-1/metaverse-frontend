import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with your backend URL
const ROOM_ID = "table-room-1";

const VoiceChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", ROOM_ID);

    socket.on("voice-offer", async ({ offer, from }) => {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      localAudioRef.current.srcObject = stream;

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("voice-answer", { roomId: ROOM_ID, answer, to: from });
    });

    socket.on("voice-answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("voice-offer");
      socket.off("voice-answer");
      socket.off("ice-candidate");
    };
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId: ROOM_ID, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    return pc;
  };

  const startVoiceChat = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudioRef.current.srcObject = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("voice-offer", { roomId: ROOM_ID, offer, from: socket.id });

    setIsConnected(true);
  };

  const stopVoiceChat = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    localAudioRef.current.srcObject?.getTracks().forEach(t => t.stop());
    remoteAudioRef.current.srcObject?.getTracks().forEach(t => t.stop());
    setIsConnected(false);
  };

  return (
    <div className="voice-chat p-4 border rounded-lg w-80 bg-white shadow-md">
      <p className="text-sm mb-2">
        {isConnected ? "Voice Chat Active" : "Voice Chat Off"}
      </p>
      <button
        className={`px-4 py-2 rounded-md text-white ${isConnected ? "bg-red-500" : "bg-green-500"}`}
        onClick={isConnected ? stopVoiceChat : startVoiceChat}
      >
        {isConnected ? "Stop Voice Chat" : "Start Voice Chat"}
      </button>

      {/* Hidden audio elements for playback */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default VoiceChat;
