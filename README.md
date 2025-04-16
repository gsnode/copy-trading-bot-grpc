# ⚡ Solana Copy‑Trading Bot (gRPC + Jupiter)

Real‑time copy‑trading bot for Solana that listens to Yellowstone/Geyser **gRPC streams** and mirrors the master wallet’s trades through **Jupiter** swaps.

Built for **memecoin snipers**, **volume farmers**, and traders who need ultra‑low latency.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔌 **gRPC Stream** | Subscribe to accounts via `@triton-one/yellowstone-grpc` (≈ 200‑500 ms median latency on GS Node). |
| 🧠 **Classifier** | Detects *buys* / *sells* and separates stablecoins from tokens. |
| 🚀 **JupiterSwap** | Creates and sends `VersionedTransaction` with dynamic priority fees. |
| 🔄 **Multi‑wallet** | Follows multiple addresses at the same time. |
| 🛡 **Resilience** | Auto‑reconnect with exponential back‑off. |
| 🪶 **TypeScript** | Modular structure, easy to extend or port to another DEX. |

---

## 🧪 Requirements

* **Node ≥ 18**
* pnpm / npm / yarn
* A Solana keypair (JSON or base58)
* gRPC endpoint from **[GS Node](https://gsnode.io)**
* Tokens supported by Jupiter

---

## 📂 Project Structure

.
├── lib/
│   ├── constants.ts          <!-- HTTP & gRPC endpoints -->
│   ├── grpcSubscribe.ts      <!-- Yellowstone subscription -->
│   ├── blockhashProvider.ts
│   └── pollTransaction.ts
├── sniper/
│   ├── classifier.ts         <!-- Detect buys / sells -->
│   └── index.ts              <!-- Main bot logic -->
├── swap/
│   └── JupiterSwap.ts
├── .env.example
└── README.md

---

## 🚀 Quick Start

```bash
git clone https://github.com/<your‑user>/solana-grpc-copy-trading-bot.git
cd solana-grpc-copy-trading-bot
pnpm install          # or npm / yarn
```
### 1 · Set environment variables

Copy .env.example → .env and fill in:

SOL_HTTP_ENDPOINT=https://rpc.gsnode.io/
SOL_GRPC_ENDPOINT=https://grpc.gsnode.io/
SOL_GRPC_TOKEN=        # only if your plan requires auth

### 2 · Add the wallets to follow

// sniper/index.ts
const masterWallets = [
  "9YwtWKdNczTzJHMbVdh1J3ZFWAVmYPpCPR7FwoMvZkVx",
  // more addresses…
];

### 3 · Run the bot

```pnpm start``          <!--  compiles & runs with ts-node -->

#### Example log:

⏱  Subscribing with gRPC stream…
🔍 Quote request for token: Hq6y…WZci
🚀 Executing swap…  Txid: 5RuG…Jm2v
✅ Position opened for Hq6y…WZci (0.000001 SOL)

![JOIN THE DISCORD CHANNEL AND SELECT YOUR GRPC](https://github.com/user-attachments/assets/92e610eb-551a-4582-9734-e4000f29bb44)
[Discord Channel](https://discord.gg/S3Bct3AJT5)

⸻

## 📈 Use Cases

- Instantly copy whales buying fresh memecoins
- Mirror large entries into new liquidity pools
- Follow wallets farming airdrops
- Automate sniper entries right after the master wallet buys


⸻

## 💬 Support

Need a production‑grade gRPC node?
Join our Discord and try GS Node: https://discord.gg/S3Bct3AJT5

