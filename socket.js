let io;

export function getSocket(server) {
  if (!io) {
    io = new Server(server);
    // setup des events
  }
  return io;
}
