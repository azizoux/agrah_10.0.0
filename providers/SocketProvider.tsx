"use client";

import { SocketContextProvider } from "@/app/context/SocketContext";

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return <SocketContextProvider>{children}</SocketContextProvider>;
};

export default SocketProvider;
