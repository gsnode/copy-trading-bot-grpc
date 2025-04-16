import { Connection } from "@solana/web3.js";
import { Client } from "@triton-one/yellowstone-grpc";

/**
 * Public HTTP endpoint from GS Node – used for transaction sending & regular RPC calls.
 */
export const HTTP_ENDPOINT =
  process.env.SOL_HTTP_ENDPOINT ?? "https://rpc.gsnode.io/";

/**
 * gRPC endpoint from GS Node – used for real-time streaming via Yellowstone.
 */
export const GRPC_ENDPOINT =
  process.env.SOL_GRPC_ENDPOINT ?? "https://grpc.gsnode.io/";

/**
 * Token for gRPC auth (optional – if your GS Node endpoint requires it).
 */
export const GRPC_TOKEN = process.env.SOL_GRPC_TOKEN ?? "";

/**
 * Connection used for standard Solana web3.js calls (getBalance, sendTransaction, etc.).
 */
export const SOL_HTTP_CONNECTION = new Connection(HTTP_ENDPOINT, {
  wsEndpoint: HTTP_ENDPOINT.replace("https", "wss").replace("http", "ws"),
  commitment: "processed",
});

/**
 * gRPC client for real-time streaming (slots, accounts, transactions...).
 */
export const GRPC_CLIENT = new Client(GRPC_ENDPOINT, GRPC_TOKEN);
