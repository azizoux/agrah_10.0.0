import { OnlineUser, Party } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface iSocketContext {
  onlineUsers: OnlineUser[] | null;
  party: Party | null;
  setParty: (party: Party) => void;
  socket: Socket | null;
  isConnected: boolean;
  username: string;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUser] = useState<OnlineUser[] | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  useEffect(() => {
    const uname = localStorage.getItem("username");
    if (uname) setUsername(uname);
  }, []);
  //   useEffect(() => {
  //     socket?.emit("sendParty", selectedParty);
  //   }, [selectedParty]);
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [username]);
  useEffect(() => {
    if (socket === null) return;
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);
  useEffect(() => {
    if (!isConnected || !socket) return;
    socket?.emit("addNewUser", username);
    socket?.on("getUsers", (response) => {
      setOnlineUser(response);
    });
    socket?.on("getParty", (response) => {
      setParty(response);
    });

    return () => {
      socket?.off("getUsers", (response) => {
        setOnlineUser(response);
      });
      socket?.off("getParty", (response) => {
        setParty(response);
      });
    };
  }, [isConnected, username, socket]);

  return (
    <SocketContext.Provider
      value={{
        onlineUsers,
        party,
        setParty,
        socket,
        isConnected,
        username,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null)
    throw new Error("useContext must be used within a SockedContextProvider");
  return context;
};
