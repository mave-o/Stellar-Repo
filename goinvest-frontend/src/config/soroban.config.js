// Soroban Contract Configuration
// Update these values with your deployed contract details

export const SOROBAN_CONFIG = {
  // Your deployed contract address (starts with 'C')
  CONTRACT_ADDRESS: 'CDN6PAJQZFX3F7EVNQN7B4A3HFDJNMVOONFEHKSXSV7DKBHFIBZWH7MZ',
  
  // Soroban testnet RPC endpoint
  RPC_URL: 'https://soroban-testnet.stellar.org/',
  
  // Network passphrase for testnet
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  
  // Network name for display
  NETWORK_NAME: 'Testnet',
};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Deploy your Soroban contract (already done in your case)
 * 2. Get the contract address from the deployment output (should start with 'C')
 * 3. Replace 'YOUR_CONTRACT_ADDRESS_HERE' with your actual contract address
 * 4. Run: npm install stellar-sdk
 * 5. Start the dev server: npm run dev
 * 
 * HOW TO GET YOUR CONTRACT ADDRESS:
 * When you deployed the contract with:
 *   stellar contract deploy --wasm ... --source kiel --network testnet
 * 
 * The output should have shown something like:
 *   ℹ️  Deploying contract using wasm hash d454e08cfcf2fa8d36ba41f655c3daf7f5d402300012b4d2a...
 *   ✅ Contract successfully deployed with address: CA...
 * 
 * Copy that CA... address and paste it here.
 */
