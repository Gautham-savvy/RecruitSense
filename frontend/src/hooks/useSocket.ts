import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(jobId: string | undefined, onScored: (data: { candidateId: string }) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const socket = io("http://localhost:3000", { withCredentials: true });
    socketRef.current = socket;

    socket.emit("join:job", jobId);
    socket.on("candidate:scored", onScored);

    return () => {
      socket.off("candidate:scored", onScored);
      socket.disconnect();
    };
  }, [jobId, onScored]);

  return socketRef;
}
