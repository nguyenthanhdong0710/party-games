declare module "partykit/server" {
  export interface Room {
    id: string;
    env: Record<string, unknown>;
    storage: {
      get<T>(key: string): Promise<T | undefined>;
      put<T>(key: string, value: T): Promise<void>;
      delete(key: string): Promise<void>;
    };
    broadcast(message: string, exclude?: string[]): void;
  }

  export interface Connection {
    id: string;
    send(message: string): void;
  }

  export interface Server {
    onStart?(): void | Promise<void>;
    onConnect?(conn: Connection): void | Promise<void>;
    onMessage?(message: string, sender: Connection): void | Promise<void>;
    onClose?(conn: Connection): void | Promise<void>;
  }
}

// Global fetch for Cloudflare Workers runtime
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;
