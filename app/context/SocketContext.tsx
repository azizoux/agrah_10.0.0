import { getUserByUsername } from "@/actions";
import { OnlineUser, Party } from "@/types";
import { User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface iSocketContext {
  onlineUsers: OnlineUser[] | null;
  party: Party | null;
  setParty: (party: Party) => void;
  socket: Socket | null;
  isConnected: boolean;
  user: User | null;
  setUser: (user: User) => void;
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
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const username = localStorage.getItem("username");
      if (username) {
        const localUser = await getUserByUsername(username);
        setUser(localUser);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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
      console.log("Reconnected...");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected...");
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
    socket?.on("getParty", ({ sender, data }) => {
      setParty(data);
    });

    return () => {
      socket?.off("getUsers", (response) => {
        setOnlineUser(response);
      });
      socket?.off("getParty", ({ sender, data }) => {
        setParty(data);
      });
    };
  }, [isConnected, user, socket]);

  return (
    <SocketContext.Provider
      value={{
        onlineUsers,
        party,
        setParty,
        socket,
        isConnected,
        user,
        setUser,
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
