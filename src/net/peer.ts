// Thin wrappers around PeerJS for the host and client sides. PeerJS uses its
// free public broker only for signaling (exchanging connection info); actual
// game messages travel directly peer-to-peer over WebRTC DataConnections.

import Peer, { type DataConnection } from 'peerjs';
import type { ClientMessage, HostMessage } from './protocol';

/** PeerJS id namespace so room codes don't collide with other apps. */
const ID_PREFIX = 'animecn-';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

/** Generate a short, human-shareable room code. */
export function makeRoomCode(len = 4): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

const peerIdFor = (code: string) => `${ID_PREFIX}${code.toUpperCase()}`;

// --- Host --------------------------------------------------------------------

export interface HostHandlers {
  onConnect: (id: string, conn: DataConnection) => void;
  onMessage: (id: string, msg: ClientMessage) => void;
  onDisconnect: (id: string) => void;
  onError: (message: string) => void;
}

export class NetHost {
  readonly code: string;
  private peer: Peer;
  private conns = new Map<string, DataConnection>();

  constructor(handlers: HostHandlers) {
    this.code = makeRoomCode();
    this.peer = new Peer(peerIdFor(this.code));

    this.peer.on('error', (err) =>
      handlers.onError(err?.message ?? 'Connection error')
    );

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.conns.set(conn.peer, conn);
        handlers.onConnect(conn.peer, conn);
      });
      conn.on('data', (data) =>
        handlers.onMessage(conn.peer, data as ClientMessage)
      );
      const drop = () => {
        if (this.conns.delete(conn.peer)) handlers.onDisconnect(conn.peer);
      };
      conn.on('close', drop);
      conn.on('error', drop);
    });
  }

  /** Resolves once the broker has assigned our id (room is joinable). */
  ready(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.peer.open) return resolve();
      this.peer.on('open', () => resolve());
      this.peer.on('error', (e) => reject(e));
    });
  }

  send(id: string, msg: HostMessage): void {
    this.conns.get(id)?.send(msg);
  }

  broadcast(msg: HostMessage): void {
    for (const conn of this.conns.values()) conn.send(msg);
  }

  destroy(): void {
    this.conns.clear();
    this.peer.destroy();
  }
}

// --- Client ------------------------------------------------------------------

export interface ClientHandlers {
  /** Called once connected; `selfId` matches the id the host keys us by. */
  onOpen: (selfId: string) => void;
  onMessage: (msg: HostMessage) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export class NetClient {
  private peer: Peer;
  private conn: DataConnection | null = null;

  constructor(code: string, handlers: ClientHandlers) {
    this.peer = new Peer();

    this.peer.on('error', (err) =>
      handlers.onError(err?.message ?? 'Could not reach the room')
    );

    this.peer.on('open', () => {
      const conn = this.peer.connect(peerIdFor(code), { reliable: true });
      this.conn = conn;
      conn.on('open', () => handlers.onOpen(this.peer.id));
      conn.on('data', (data) => handlers.onMessage(data as HostMessage));
      conn.on('close', () => handlers.onClose());
      conn.on('error', (e) =>
        handlers.onError(e?.message ?? 'Connection lost')
      );
    });
  }

  send(msg: ClientMessage): void {
    this.conn?.send(msg);
  }

  destroy(): void {
    this.conn?.close();
    this.peer.destroy();
  }
}
