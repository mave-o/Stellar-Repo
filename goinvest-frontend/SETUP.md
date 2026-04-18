# GoInvest Frontend - Soroban Integration

A React + Vite frontend for the GoInvest Soroban smart contract on the Stellar testnet.

## Features

✅ **View All Proposals** - Browse all active and closed investment proposals  
✅ **Create New Proposals** - Submit new investment proposals  
✅ **Invest** - Contribute XLM to proposals you believe in  
✅ **Track Investments** - View your investment portfolio  

## Setup Instructions

### 1. Install Dependencies

```bash
cd goinvest-frontend
npm install stellar-sdk @stellar/protocol
```

### 2. Configure Contract Address

Edit `src/config/soroban.config.js` and replace `YOUR_CONTRACT_ADDRESS_HERE` with your deployed contract address (the one starting with `CA...`).

**Where to find your contract address:**
- When you deployed the contract, the output showed something like:
  ```
  ✅ Contract successfully deployed with address: CA...
  ```
- Or check the deployment logs from the `stellar contract deploy` command

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

### Connect to the Contract

1. Enter your deployed contract address (starts with `CA...`)
2. Click "Connect"
3. Enter your Stellar address (starts with `G...`)

### Create a Proposal

1. Click the "➕ Create Proposal" button
2. Fill in:
   - **Title**: Name of your proposal
   - **Description**: Details about what you're funding
   - **Funding Goal**: Amount of XLM needed
3. Click "Submit Proposal"
4. The proposal will appear in the list once confirmed

### Invest in a Proposal

1. Click the "💰 Invest" button
2. Enter the proposal ID (shown on proposal cards)
3. Enter the amount of XLM to invest
4. Click "Invest Now"
5. Your investment will be recorded on the blockchain

### View Your Investments

1. Click the "💼 My Investments" button
2. See all your contributions across proposals
3. Amounts are shown in XLM (automatically converted from stroops)

## Project Structure

```
goinvest-frontend/
├── src/
│   ├── App.jsx              # Main React component
│   ├── App.css              # Styling
│   ├── main.jsx             # Entry point
│   ├── config/
│   │   └── soroban.config.js # Contract configuration
│   └── utils/
│       └── soroban.js       # Soroban contract interactions
├── package.json
└── vite.config.js
```

## Contract Functions

The frontend interacts with these contract functions:

- `submit_proposal(owner, title, description, goal_amount)` → proposal_id
- `invest(investor, proposal_id, amount)` → void
- `get_proposal(proposal_id)` → Proposal
- `get_proposal_count()` → u64
- `get_investment(proposal_id, investor_address)` → i128

## Development Notes

- Amounts are converted from stroops (1 XLM = 10,000,000 stroops)
- The contract requires authorization from the user's Stellar address
- All operations are simulated transactions on the testnet
- The RPC endpoint uses Stellar's official testnet

## Troubleshooting

**"Contract address not found"**
- Make sure you entered the contract address starting with `CA...`
- Check that the contract was successfully deployed

**"Failed to connect to RPC"**
- The testnet might be temporarily unavailable
- Check your internet connection
- Ensure the RPC URL is correct in the config file

**"Proposal not found"**
- The proposal ID might not exist
- Try refreshing the proposals list first

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Support

For issues with:
- **Contract**: Check the backend Rust code in `/contract`
- **Frontend**: Review the React components and browser console
- **Testnet**: Visit https://stellar.expert/explorer/testnet

## Resources

- [Stellar SDK Docs](https://js.stellar.org/)
- [Soroban Documentation](https://developers.stellar.org/soroban)
- [Stellar Developer Guide](https://developers.stellar.org/)
- [Stellar Testnet](https://stellar.expert/explorer/testnet)
