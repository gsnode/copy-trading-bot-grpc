import { SOL_CONNECTION } from "./constants";

export class BlockhashProvider {
  private current: string | null = null;
  private lastRefresh = 0;

  /** Fetch a fresh blockhash every ~30 s (cheap throttle) */
  async getFreshBlockhash(): Promise<string> {
    const now = Date.now();
    if (this.current && now - this.lastRefresh < 30_000) return this.current;

    const { blockhash } = await SOL_CONNECTION.getLatestBlockhash("confirmed");
    this.current = blockhash;
    this.lastRefresh = now;
    return blockhash;
  }
}
