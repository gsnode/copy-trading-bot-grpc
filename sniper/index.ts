// sniper/index.ts
import {
  PublicKey,
  TransactionSignature,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";

import { subscribeToWalletGRPC } from "../lib/grpcSubscribe";
import { Settings } from "../controllers/sniper/sniper.def";
import { stringKey } from "../lib/constants";        // tu secret en base58
import { HTTP_CONNECTION, SOL_CONNECTION } from "../lib/constants";
import { BlockhashProvider } from "../lib/blockhashProvider";
import { JupiterSwap } from "../swap/JupiterSwap";
import { Subscription } from "../lib";               // si aún lo usas para logs

/* ------------------------------------------------------------------ */
/*  Config inicial                                                     */
/* ------------------------------------------------------------------ */

const keypair = Keypair.fromSecretKey(bs58.decode(stringKey));
const settings: Settings = {
  keypair,
  amountToBuy: 0.000001,
  slippage: 40,
};

const subscription = new Subscription();
subscription.start();               // opcional: métricas, logs, etc.

const positions: Map<string, number> = new Map();
const blockhashProvider = new BlockhashProvider();
blockhashProvider.getFreshBlockhash();

/* ------------------------------------------------------------------ */
/*  Función para ejecutar el swap vía Jupiter                          */
/* ------------------------------------------------------------------ */

async function jupiterBuy(
  tokenMintStr: string,
  settings: Settings,
): Promise<{ txid: string }> {
  console.log(`🔍 Solicitando quote para token: ${tokenMintStr}`);

  const inputMint = new PublicKey(
    "So11111111111111111111111111111111111111112",
  );
  const outputMint = new PublicKey(tokenMintStr);
  const jupiterSwap = new JupiterSwap(inputMint, outputMint, settings);

  const quote = await jupiterSwap.getQuote(
    settings.amountToBuy,
    settings.slippage,
  );

  console.log("🔄 Creando transacción de compra…");
  const buyTx = await jupiterSwap.createSwapTransaction(quote);

  console.log("🚀 Ejecutando transacción…");
  const txid = await jupiterSwap.executeTransaction(buyTx);

  console.log(`✅ Swap ejecutado. Txid: ${txid}`);
  return { txid };
}

/* ------------------------------------------------------------------ */
/*  Main loop                                                          */
/* ------------------------------------------------------------------ */

(async () => {
  const masterWalletAddress = new PublicKey(
    "9YwtWKdNczTzJHMbVdh1J3ZFWAVmYPpCPR7FwoMvZkVx",
  );

  console.log("⏱  Subscribing with gRPC stream…");

  await subscribeToWalletGRPC(
    masterWalletAddress,
    async (
      signature: TransactionSignature,
      classifications,
    ) => {
      console.log(`Transacción detectada: ${signature}`);

      await Promise.all(
        classifications.map(async (c) => {
          if (c.token && c.type === "buy") {
            const tokenMintStr = c.token.token;
            if (positions.has(tokenMintStr)) {
              console.log(
                `Ya se posee la posición para ${tokenMintStr}, omitiendo compra.`,
              );
              return;
            }
            try {
              const { txid } = await jupiterBuy(tokenMintStr, settings);
              positions.set(tokenMintStr, settings.amountToBuy);
              console.log(`Copiado ✔️  (${tokenMintStr}) → ${txid}`);
            } catch (err) {
              console.error(`Error en compra ${tokenMintStr}:`, err);
            }
          }
        }),
      );
    },
  );
})();
