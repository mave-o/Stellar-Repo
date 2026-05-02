# GOInvest — Stellar Testnet Deployment Guide

This guide walks you through deploying the `GOInvestContract` to the Stellar testnet step by step.

---

## Prerequisites

Make sure these are installed:

```bash
# Verify Rust
rustc --version

# Verify WASM target
rustup target list --installed | grep wasm32

# If WASM target is missing, add it:
rustup target add wasm32-unknown-unknown

# Verify Stellar CLI
stellar --version
```

---

## Step 1 — Run Tests First

Always confirm all tests pass before deploying.

```bash
cd contract
cargo test
```

Expected output: **5 tests passing**, 0 failures.

---

## Step 2 — Build the WASM Binary

```bash
# macOS / Linux
cargo build --target wasm32-unknown-unknown --release

# Confirm the .wasm file was created
ls target/wasm32-unknown-unknown/release/*.wasm
```

```powershell
# Windows (PowerShell)
cargo build --target wasm32-unknown-unknown --release
Get-ChildItem target\wasm32-unknown-unknown\release\*.wasm
```

You should see: `goinvest.wasm`

---

## Step 3 — Create a Testnet Identity

> Skip this step if you already have a `my-key` identity.

```bash
stellar keys generate --global my-key --network testnet
stellar keys address my-key
```

Save the address output — it starts with `G...`.

---

## Step 4 — Fund Your Testnet Account

**Option A — Stellar CLI:**
```bash
stellar keys fund my-key --network testnet
```

**Option B — Friendbot (browser):**
1. Go to: https://friendbot.stellar.org
2. Paste your `G...` address and submit.

**Option C — Friendbot (CLI fallback):**
```bash
# macOS / Linux
curl "https://friendbot.stellar.org?addr=<YOUR_G_ADDRESS>"

# Windows (PowerShell)
Invoke-WebRequest "https://friendbot.stellar.org?addr=<YOUR_G_ADDRESS>"
```

Verify your balance on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet).

---

## Step 5 — Deploy the Contract

```bash
# macOS / Linux
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/goinvest.wasm \
  --source my-key \
  --network testnet
```

```powershell
# Windows (PowerShell)
stellar contract deploy `
  --wasm target\wasm32-unknown-unknown\release\goinvest.wasm `
  --source my-key `
  --network testnet
```

The CLI will return a **Contract ID** that looks like:

```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Copy and save this Contract ID.**

---

## Step 6 — Verify on Stellar Expert

Open the following URL in your browser, replacing `<CONTRACT_ID>` with yours:

```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```

You should see the contract listed with its metadata.

---

## Step 7 — Connect the Frontend

1. Start the frontend:
   ```bash
   cd goinvest-frontend
   npm install
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser.

3. Make sure **Freighter Wallet** is installed and set to **Testnet**.

4. Paste your **Contract ID** (`C...`) into the "Connect to Smart Contract" field and click **Connect**.

---

## Step 8 — Submit to Rise In

Once deployed, submit the following on your Rise In program page:

| Field | Value |
|---|---|
| **GitHub Repository** | Your public repo URL |
| **Contract ID** | `C...` (your deployed contract address) |
| **Stellar Expert Link** | `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>` |
| **Short Description** | GOInvest is a decentralized investment platform that allows Philippine SMEs to raise funds from individual investors via Stellar smart contracts, with Freighter Wallet integration for secure on-chain interactions. |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `No .wasm file found` | Confirm `[lib] crate-type = ["cdylib"]` is in `Cargo.toml` |
| `insufficient balance` | Re-run Friendbot or `stellar keys fund` |
| `contract not found` | Double-check you're on Testnet in both CLI and Freighter |
| `cargo test` fails | Check `src/lib.rs` for `mod test;` at the bottom |
| Freighter not connecting | Ensure Freighter is set to **Testnet**, not Mainnet |

---

*For more help: [Stellar Docs](https://developers.stellar.org) | [Soroban SDK](https://docs.rs/soroban-sdk) | [Stellar CLI Docs](https://developers.stellar.org/docs/tools/stellar-cli)*
