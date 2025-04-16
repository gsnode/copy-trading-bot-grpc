import { Connection } from "@solana/web3.js";

export async function pollTransactionConfirmation(
  connection: Connection,
  txSig: string,
  timeout = 12_000,
): Promise<string> {
  const interval = 350;
  let elapsed    = 0;

  return new Promise<string>((res, rej) => {
    const id = setInterval(async () => {
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(id);
        return rej(new Error(`Tx ${txSig} confirmation timed out`));
      }
      const status = (await connection.getSignatureStatuses([txSig])).value?.[0];
      if (status?.err)              return rej(new Error(JSON.stringify(status.err)));
      if (status?.confirmationStatus === "confirmed" ||
          status?.confirmationStatus === "finalized" ||
          status?.confirmationStatus === "processed") {
        clearInterval(id);
        res(status.confirmationStatus);
      }
    }, interval);
  });
}
