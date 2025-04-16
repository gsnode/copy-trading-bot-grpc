import {
  Connection,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import { pollTransactionConfirmation, Transaction } from "../lib/pollTransaction";
import { Settings } from "../controllers/sniper/sniper.def";
import { SOL_CONNECTION } from "../lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type QuoteResponse = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  priceImpactPct: number;
  otherAmounts: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/*  JupiterSwap Class                                                  */
/* ------------------------------------------------------------------ */

export class JupiterSwap {
  private readonly inputMint: PublicKey;
  private readonly outputMint: PublicKey;
  private readonly settings: Settings;
  private readonly connection: Connection;

  constructor(inputMint: PublicKey, outputMint: PublicKey, settings: Settings) {
    this.inputMint = inputMint;
    this.outputMint = outputMint;
    this.settings = settings;
    this.connection = SOL_CONNECTION;          // ← HTTP / WSS path
  }

  /* ------------------------- Quote ------------------------------- */

  public async getQuote(amount: number, slippageBps: number): Promise<QuoteResponse> {
    const decimals = 6;                                   // SOL decimals
    const adjustedAmount = Math.floor(amount * 10 ** decimals);

    const url = `https://quote-api.jup.ag/v6/quote` +
      `?inputMint=${this.inputMint.toBase58()}` +
      `&outputMint=${this.outputMint.toBase58()}` +
      `&amount=${adjustedAmount}` +
      `&slippageBps=${slippageBps}`;

    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch quote: ${res.statusText}`);

    return (await res.json()) as QuoteResponse;
  }

  /* --------------------- Build swap tx --------------------------- */

  public async createSwapTransaction(quote: QuoteResponse): Promise<Transaction> {
    const res = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: this.settings.keypair.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 100_000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error fetching swap transaction: ${err}`);
    }

    const data = await res.json();
    const buf = Buffer.from(data.swapTransaction, "base64");
    const vtx = VersionedTransaction.deserialize(buf);

    const tx = new Transaction([], this.settings);
    tx.versionedTransaction = vtx;
    return tx;
  }

  /* ----------------------- Execute ------------------------------- */

  public async executeTransaction(tx: Transaction): Promise<string> {
    tx.versionedTransaction!.sign([this.settings.keypair]);

    const txid = await this.connection.sendRawTransaction(
      tx.versionedTransaction!.serialize(),
      { skipPreflight: false, maxRetries: 5, preflightCommitment: "processed" },
    );

    await pollTransactionConfirmation(txid);
    return txid;
  }
}
