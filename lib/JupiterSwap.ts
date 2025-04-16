import {
  Connection,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import { pollTransactionConfirmation } from "../utils/poller";
import { Settings } from "../../controllers";

export type QuoteResponse = { /* … stays the same … */ };

export class JupiterSwap {
  constructor(
    private readonly inputMint:  PublicKey,
    private readonly outputMint: PublicKey,
    private readonly settings:   Settings,
    private readonly connection: Connection,
  ) {}

  /* getQuote, createSwapTransaction – unchanged */

  public async executeTransaction(tx: Transaction): Promise<string> {
    tx.versionedTransaction!.sign([this.settings.keypair]);

    try {
      const txid = await this.connection.sendRawTransaction(
        tx.versionedTransaction!.serialize(),
        { skipPreflight: false, maxRetries: 5, preflightCommitment: "processed" },
      );
      await pollTransactionConfirmation(this.connection, txid);
      return txid;
    } catch (err) {
      throw new Error(`Jupiter swap failed: ${(err as Error).message}`);
    }
  }
}
