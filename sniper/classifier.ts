import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  TransactionSignature,
} from "@solana/web3.js";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TransactionType = "buy" | "sell";

export interface ClassificationResult {
  type: TransactionType;
  stablecoin?: { token: string; amount: number };
  token?: { token: string; amount: number };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STABLECOINS = new Set([
  "So11111111111111111111111111111111111111112",          // wSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",          // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",          // USDT
]);

/* ------------------------------------------------------------------ */
/*  Core classifier                                                    */
/* ------------------------------------------------------------------ */

export function classifyTransaction(
  tx: ParsedTransactionWithMeta,
  wallet: PublicKey,
): ClassificationResult[] | null {
  if (!tx.meta) return null;

  const pre  = tx.meta.preTokenBalances  ?? [];
  const post = tx.meta.postTokenBalances ?? [];
  const map  = new Map<string, any>();
  pre.forEach((b) => map.set(`${b.mint}-${b.owner}`, b));

  const out: ClassificationResult[] = [];

  for (const p of post) {
    const key  = `${p.mint}-${p.owner}`;
    const preB = map.get(key);

    if (p.owner !== wallet.toBase58()) continue;
    if (p.uiTokenAmount.uiAmount === undefined) continue;

    const before = preB?.uiTokenAmount.uiAmount ?? 0;
    const delta  = p.uiTokenAmount.uiAmount - before;

    if (delta === 0) continue;

    const record = STABLECOINS.has(p.mint)
      ? { stablecoin: { token: p.mint, amount: Math.abs(delta) } }
      : { token: { token: p.mint, amount: Math.abs(delta) } };

    out.push(delta > 0
      ? { type: "buy",  ...record }
      : { type: "sell", ...record });
  }

  return out.length ? out : null;
}

/* ------------------------------------------------------------------ */
/*  Optional helper: subscribe over WS (fallback)                      */
/* ------------------------------------------------------------------ */

export async function subscribeToWalletLogs(
  connection: Connection,
  wallet: PublicKey,
  cb: (sig: TransactionSignature, cls: ClassificationResult[]) => void,
) {
  const processed = new Set<string>();
  const pending: string[] = [];

  // polling loop
  setInterval(async () => {
    if (!pending.length) return;

    const batch = pending.splice(0, pending.length);
    const txs = await Promise.all(
      batch.map((s) =>
        connection.getParsedTransaction(s, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        }),
      ),
    );

    txs.forEach((t, i) => {
      if (!t) return;
      const c = classifyTransaction(t, wallet);
      if (c) cb(batch[i], c);
    });
  }, 500);

  // WS logs
  connection.onLogs(wallet, (l) => {
    if (processed.has(l.signature)) return;
    processed.add(l.signature);
    pending.push(l.signature);
  });
}
