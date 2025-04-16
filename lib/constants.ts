// lib/constants.ts
import { Connection } from "@solana/web3.js";
import { GeyserClient } from "@triton-one/yellowstone-grpc";

/* ------------------------------------------------------------------ */
/*  Endpoints                                                          */
/* ------------------------------------------------------------------ */

export const HTTP_ENDPOINT =
  process.env.SOL_HTTP_ENDPOINT ?? "https://rpc.gsnode.io/";

export const GRPC_ENDPOINT =
  process.env.SOL_GRPC_ENDPOINT ?? "https://rpc.gsnode.io/grpc";

/* ------------------------------------------------------------------ */
/*  Connections                                                        */
/* ------------------------------------------------------------------ */

// 1.  JSON‑RPC / WebSocket (envío de transacciones)
export const HTTP_CONNECTION = new Connection(HTTP_ENDPOINT, {
  wsEndpoint: HTTP_ENDPOINT.replace("https", "wss").replace("http", "ws"),
  commitment: "processed",
});

// 2.  gRPC client (lectura en tiempo real)
export const GRPC_CLIENT = new GeyserClient(GRPC_ENDPOINT);

/* ------------------------------------------------------------------ */
/*  Alias para compatibilidad con código existente                     */
/* ------------------------------------------------------------------ */

export const SOL_CONNECTION = HTTP_CONNECTION; // ← antiguo nombre usado en varios módulos
