# Copy Trading Bot with gRPC
Real-time copy trading bot for Solana powered by **gRPC** and **Jupiter Aggregator**.  
Track multiple wallets via Yellowstone's gRPC interface and automatically mirror their trades with your own wallet.

Built for **meme coin snipers**, **volume farmers**, and **speed‑hungry traders**.

---

## ⚙️ Features

- 🔁 Copy trades in real-time using Solana gRPC stream
- 👀 Track multiple wallets simultaneously
- ⚡ Execute your own swaps via Jupiter Aggregator
- 🔒 Built with connection resilience and exponential backoff
- 🧰 Written in TypeScript with modular structure (easy to extend)

---

## 🧪 Requirements

- Node.js >= 18
- pnpm / npm / yarn
- Solana wallet keypair (used for signing swap txs)
- gRPC endpoint from [GS Node](https://gsnode.io/) 
- Jupiter aggregator enabled tokens

---

## 📂 Project Structure

.
├── grpc/                 <!-- gRPC client to stream wallet txs-->
│   └── WalletTracker.ts
├── lib/                  <!--  Jupiter Swap logic-->
│   └── JupiterSwap.ts
├── utils/
│   └── poller.ts         <!-- Poll tx confirmation-->
├── bot/
│   └── main.ts           <!-- Main bot logic-->
├── constants.ts
├── .env.example
└── README.md

## 🚀 Getting Started

```bash
git clone https://github.com/tuusuario/solana-grpc-copy-trading-bot.git
cd solana-grpc-copy-trading-bot
pnpm install  
```

## 1. Set environment variables

Create a .env file or export manually:

```bash
SOL_HTTP_ENDPOINT=https://your-http-endpoint
SOL_GRPC_ENDPOINT=https://your-grpc-endpoint
SOL_GRPC_TOKEN=your-grpc-token
```

## 2. Configure tracked wallets

```ts
const walletsToMirror = [
  "WalletAddress1",
  "WalletAddress2",
  // Add more wallets here
];
```

## 3. Run the bot

```bash
pnpm start
```


## 📈 Example Use Cases

- Mirror whales buying meme coins in real time
- Monitor liquidity pools and replicate big entries
- Follow wallets farming airdrops
- Automate sniper entries after target wallet buys
- Copy trade good traders

  
![JOIN THE DISCORD CHANNEL AND SELECT YOUR GRPC](https://github.com/user-attachments/assets/b3042c25-366d-46e4-8e89-987031bee66a)
[Reach out us on Dicord](https://discord.gg/S3Bct3AJT5)

## 💬 Support

Need a gRPC node for production use?
Check out [GS Node](https://discord.gg/S3Bct3AJT5) – Solana RPC built for speed.
 
