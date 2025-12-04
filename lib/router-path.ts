class RouterPath {
  // Root
  home = "/";

  // Offline
  offline = "/offline";
  offlineImposters = "/offline/imposters";

  // Online
  online = "/online";
  onlineImposters = "/online/imposters";
  onlineImpostersRoom = (roomId: string) => `/online/imposters/${roomId}`;
}

const PATH = new RouterPath();
export default PATH;
