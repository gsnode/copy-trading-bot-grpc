// lib/grpcSubscribe.ts
import { PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import {
  CommitmentLevel,
  SubscribeRequest,
  SubscribeUpdate,
} from "@triton-one/yellowstone-grpc";
import { GRPC_CLIENT } from "./constants";
import { classifyTransaction } from "../sniper/classifier";

/**
 * Suscribe al stream gRPC de Yellowstone y devuelve cada transacción
 * clasificada (buy/sell) que involucre la cuenta indicada.
 */
export async function subscribeToWalletGRPC(
  master: PublicKey,
  onClassification: (
    signature: string,
    classifications: ReturnType<typeof classifyTransaction>,
  ) => void,
) {
  const req: SubscribeRequest = {
    transactions: { account: [master.toBase58()] },
    commitment: CommitmentLevel.CONFIRMED,
  };

  const stream = GRPC_CLIENT.subscribe(req);

  stream.on("data", (u: SubscribeUpdate) => {
    if (!u.transactions) return;

    const { signature, transaction, meta, slot } =
      u.transactions.value[0];

    // Re‑usar el parser existente
    const parsed = {
      transaction,
      meta,
      slot,
      version: 0,
    } as unknown as ParsedTransactionWithMeta;

    const cls = classifyTransaction(parsed, master);
    if (cls) onClassification(signature, cls);
  });

  stream.on("error", (err) =>
    console.error("[gRPC] stream error:", err.message),
  );
}
