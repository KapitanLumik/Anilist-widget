import { delay } from "https://deno.land/std@0.177.0/async/delay.ts";

/** Default port for serving HTTP. */
const HTTP_PORT = 8000;

export interface ConnInfo {
  readonly localAddr: Deno.Addr;
  readonly remoteAddr: Deno.Addr;
}

export type Handler = (
  request: Request,
  connInfo: ConnInfo,
) => Response | Promise<Response>;

export interface ServerInit extends Partial<Deno.ListenOptions> {
  handler: Handler;
  onError?: (error: unknown) => Response | Promise<Response>;
}

export class Server {
  #port?: number;
  #host?: string;
  #handler: Handler;
  #onError: (error: unknown) => Response | Promise<Response>;
  #abortController = new AbortController();

  constructor(serverInit: ServerInit) {
    this.#port = serverInit.port;
    this.#host = serverInit.hostname;
    this.#handler = serverInit.handler;
    this.#onError = serverInit.onError ?? function (error: unknown) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    };
  }

  async listenAndServe() {
    const port = this.#port ?? HTTP_PORT;
    const hostname = this.#host ?? "0.0.0.0";

    return await Deno.serve({
      port,
      hostname,
      signal: this.#abortController.signal,
      onError: this.#onError,
    }, (request, info) => {
      return this.#handler(request, info);
    }).finished;
  }

  close() {
    this.#abortController.abort();
  }
}

export async function serve(
  handler: Handler,
  options: ServeInit = {},
) {
  const port = options.port ?? HTTP_PORT;
  const hostname = options.hostname ?? "0.0.0.0";
  
  return Deno.serve({
    port,
    hostname,
    onError: options.onError,
    onListen: options.onListen,
  }, (request, info) => {
    return handler(request, info);
  });
}

export interface ServeInit extends Partial<Deno.ListenOptions> {
  signal?: AbortSignal;
  onError?: (error: unknown) => Response | Promise<Response>;
  onListen?: (params: { hostname: string; port: number }) => void;
}

// Spuštění samotného serveru, aby aplikace na Deno Deploy jen tak neskončila
const defaultHandler = (_req: Request) => new Response("Aplikace úspěšně běží!", { status: 200 });
serve(defaultHandler);
