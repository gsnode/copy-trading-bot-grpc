import { WalletTracker }  from "./grpc/WalletTracker";
import { JupiterSwap }    from "./lib/JupiterSwap";
import { PublicKey }      from "@solana/web3.js";
import {
  SOL_HTTP_CONNECTION,
  GRPC_ENDPOINT,
  GRPC_TOKEN,
} from "./constants";
import { Settings } from "../controllers";

/* ------------------------------------------------------------------ */
/* 1.  Initialise the gRPC wallet stream                               */
/* ------------------------------------------------------------------ */

const walletsToMirror = [
  "9xQeWvG816bUbkKkFzSi72d5BQ7rsExUyq33VYbE7Z7H", // example!!!
  "F1uBQr6RwjrUq9Xfi5fBfh7qxjBvKnPjMXdrsSLiF1Ca",
];

const stream = new WalletTracker(
  GRPC_ENDPOINT,
  GRPC_TOKEN,
  walletsToMirror,
);

/* ------------------------------------------------------------------ */
/* 2.  For every observed tx decide whether to copy‑trade              */
/* ------------------------------------------------------------------ */

stream.on("tx", async ({ signature, slot }) => {
  try {
    /* You decide what “copy” means – here we simply swap the same pair
       that the leader wallet swapped, at 50 % of their size               */

    // 2‑a) pull the parsed tx (HTTP is fine for one‑off reads)
    const parsed = await SOL_HTTP_CONNECTION.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!parsed) return;

    /* 2‑b) extract the first Jupiter swap instruction (example) */
    const ix = parsed.transaction.message.instructions.find(
      (i) => "program" in i && i.program === "spl-token-swap",
    );
    if (!ix) return;

    // demo – replace with real parser
    const INPUT_MINT  = new PublicKey((ix as any).parsed.info.source);
    const OUTPUT_MINT = new PublicKey((ix as any).parsed.info.destination);
    const leaderSize  = Number((ix as any).parsed.info.amount) / 10 ** 6;
    const mySize      = leaderSize * 0.5;

    /* 2‑c) fire your own swap through Jupiter                       */
    const swapper = new JupiterSwap(INPUT_MINT, OUTPUT_MINT, Settings, SOL_HTTP_CONNECTION);
    const quote   = await swapper.getQuote(mySize, /* slippage */ 100);
    const tx      = await swapper.createSwapTransaction(quote);
    const txid    = await swapper.executeTransaction(tx);

    console.log(`[COPY‑TRADE] Mirrored tx ${signature} in slot ${slot}. My txid: ${txid}`);
  } catch (err) {
    console.error("[COPY‑TRADE] error →", (err as Error).message);
  }
});
