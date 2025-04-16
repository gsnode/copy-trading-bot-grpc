import {
  Client,
  CommitmentLevel,
  SubscribeRequest,
  SubscribeUpdate,
  SubscribeUpdateTransaction,
} from "@triton-one/yellowstone-grpc";
import EventEmitter from "events";

/** Event object emitted for every observed transaction */
export interface WalletTxEvent {
  signature: string;
  slot: bigint;
  raw:   SubscribeUpdateTransaction;
}

/**
 * Streams real‑time transactions that touch any of the `watchlist` addresses.
 * Emits a `"tx"` event for each match.
 */
export class WalletTracker extends EventEmitter {
  private backoff = 1_000; // ms – grows exponentially until 30 s

  constructor(
    private readonly endpoint: string,
    private readonly token: string,
    private readonly watchlist: string[],
    private readonly commitment: CommitmentLevel = CommitmentLevel.CONFIRMED,
  ) {
    super();
    if (!endpoint || !token) {
      throw new Error("gRPC endpoint/token missing – set SOL_GRPC_* env vars");
    }
    void this.start();
  }

  /* --------------------------------------------------------------------- */
  /*  Private helpers                                                      */
  /* --------------------------------------------------------------------- */

  private async start(): Promise<void> {
    // eslint‑disable‑next‑line no‑constant‑condition
    while (true) {
      try {
        const client  = new Client(this.endpoint, this.token, {});
        const stream  = await client.subscribe();
        await this.sendSubscribeRequest(stream);

        stream.on("data",  (d) => this.handleData(d));
        stream.on("error", (e) => { throw e; });
        stream.on("end",   ()  => { throw new Error("Stream ended"); });
        stream.on("close", ()  => { throw new Error("Stream closed"); });

        /* Block until an error bubbles up */
        await new Promise<never>(() => void 0);
      } catch (err) {
        console.error("[gRPC] stream error →", (err as Error).message);
        console.info (`[gRPC] reconnecting in ${this.backoff / 1000}s…`);
        await new Promise(r => setTimeout(r, this.backoff));
        this.backoff = Math.min(this.backoff * 2, 30_000);
      }
    }
  }

  private sendSubscribeRequest(stream: any): Promise<void> {
    return new Promise((res, rej) => {
      stream.write(this.buildRequest(), (e: Error | null) => (e ? rej(e) : res()));
    });
  }

  private buildRequest(): SubscribeRequest {
    return {
      accounts: {}, slots: {},
      transactions: {
        walletTracker: {
          accountInclude: this.watchlist,
          accountExclude: [],
          accountRequired: [],
        },
      },
      transactionsStatus: {}, entry: {}, blocks: {}, blocksMeta: {},
      commitment: this.commitment, accountsDataSlice: [], ping: undefined,
    };
  }

  private handleData(update: SubscribeUpdate): void {
    if (!("transaction" in update)) return;
    const tx = (update as SubscribeUpdate & { transaction: SubscribeUpdateTransaction }).transaction;
    const sig = Buffer.from(tx.transaction!.signature).toString("base58");
    this.emit("tx", { signature: sig, slot: tx.slot, raw: tx });
  }
}
