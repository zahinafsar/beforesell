// Tracks which chat is currently on screen so foreground message pushes for that
// peer can be suppressed (the messages already appear live).
let activePeerId: string | null = null;

export function setActiveChat(peerId: string | null) {
  activePeerId = peerId;
}

export function getActiveChat() {
  return activePeerId;
}
