class RouterPath {
  // Root
  home = "/";

  // Offline
  offline = "/offline";
  offlineImposters = "/offline/imposters";
  offlineBadMatch = "/offline/bad-match";

  // Online
  online = "/online";
  onlineImposters = "/online/imposters";
  onlineImpostersRoom = (roomId: string) => `/online/imposters/${roomId}`;
}

const PATH = new RouterPath();
export default PATH;
