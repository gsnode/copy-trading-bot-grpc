import { SOL_CONNECTION } from "./constants";

/**
 * Polls the network until the given signature is at least confirmed
 * or the timeout is reached.
 */
export async function pollTransactionConfirmation(
  sig: string,
  timeoutMs = 12_000,
  intervalMs = 350,
): Promise<string> {
  let waited = 0;

  return new Promise((resolve, reject) => {
    const id = setInterval(async () => {
      waited += intervalMs;
      if (waited >= timeoutMs) {
        clearInterval(id);
        return reject(new Error(`Tx ${sig} confirmation timed out`));
      }

      const status = (await SOL_CONNECTION.getSignatureStatuses([sig]))
        .value?.[0];

      if (status?.err) {
        clearInterval(id);
        return reject(new Error(`Tx ${sig} failed: ${JSON.stringify(status.err)}`));
      }

      if (
        status?.confirmationStatus === "confirmed" ||
        status?.confirmationStatus === "finalized"
      ) {
        clearInterval(id);
        resolve(status.confirmationStatus!);
      }
    }, intervalMs);
  });
}
