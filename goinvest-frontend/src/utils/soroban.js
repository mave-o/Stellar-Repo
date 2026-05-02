import * as StellarSdk from '@stellar/stellar-sdk';
import { SOROBAN_CONFIG } from '../config/soroban.config.js';

const { Contract, nativeToScVal, scValToNative, Address, SorobanRpc, TransactionBuilder, Networks, BASE_FEE } = StellarSdk;

// ─── Config ─────────────────────────────────────────────────────
let CONTRACT_ADDRESS = SOROBAN_CONFIG.CONTRACT_ADDRESS;
const NETWORK_PASSPHRASE = SOROBAN_CONFIG.NETWORK_PASSPHRASE;
const RPC_URL = SOROBAN_CONFIG.RPC_URL;

// ─── RPC Server ─────────────────────────────────────────────────
function getRpcServer() {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: false });
}

// ─── Address helpers ────────────────────────────────────────────
export function getContractAddress() {
  return CONTRACT_ADDRESS;
}

export function setContractAddress(address) {
  if (!address.startsWith('C')) {
    throw new Error('Invalid contract address. Must start with "C"');
  }
  CONTRACT_ADDRESS = address;
}

// ─── Simulate a read-only contract call ─────────────────────────
async function simulateCall(method, args = []) {
  const server = getRpcServer();

  // Use a dummy source account for simulation
  const dummyKeypair = StellarSdk.Keypair.random();
  const dummyPublicKey = dummyKeypair.publicKey();

  // Fetch a real account object or create a minimal one for simulation
  let account;
  try {
    account = await server.getAccount(dummyPublicKey);
  } catch {
    account = new StellarSdk.Account(dummyPublicKey, '0');
  }

  const contract = new Contract(CONTRACT_ADDRESS);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`);
  }

  return simResult;
}

// ─── Parse proposal struct from ScVal ───────────────────────────
function parseProposal(scVal) {
  try {
    const native = scValToNative(scVal);
    return {
      id:             Number(native.id ?? 0),
      owner:          native.owner?.toString() ?? '',
      title:          native.title ?? '',
      description:    native.description ?? '',
      goal_amount:    native.goal_amount?.toString() ?? '0',
      raised_amount:  native.raised_amount?.toString() ?? '0',
      is_active:      native.is_active ?? false,
    };
  } catch (e) {
    console.warn('parseProposal fallback:', e);
    return null;
  }
}

// ─── Get proposal count ─────────────────────────────────────────
export async function getProposalCount() {
  try {
    const sim = await simulateCall('get_proposal_count');
    const retval = sim.result?.retval;
    if (!retval) return 0;
    return Number(scValToNative(retval));
  } catch (error) {
    console.error('Error fetching proposal count:', error);
    throw error;
  }
}

// ─── Get a single proposal ──────────────────────────────────────
export async function getProposal(proposalId) {
  try {
    const args = [nativeToScVal(proposalId, { type: 'u64' })];
    const sim = await simulateCall('get_proposal', args);
    const retval = sim.result?.retval;
    if (!retval) throw new Error('No result returned');
    return parseProposal(retval);
  } catch (error) {
    console.error(`Error fetching proposal ${proposalId}:`, error);
    throw error;
  }
}

// ─── Get all proposals ──────────────────────────────────────────
export async function getAllProposals() {
  try {
    const count = await getProposalCount();
    const proposals = [];
    for (let i = 1; i <= count; i++) {
      try {
        const proposal = await getProposal(i);
        if (proposal) proposals.push({ id: i, ...proposal });
      } catch (err) {
        console.error(`Failed to load proposal ${i}:`, err);
      }
    }
    return proposals;
  } catch (error) {
    console.error('Error fetching all proposals:', error);
    throw error;
  }
}

// ─── Submit a proposal ──────────────────────────────────────────
export async function submitProposal(owner, title, description, goalAmount) {
  try {
    const args = [
      nativeToScVal(Address.fromString(owner), { type: 'address' }),
      nativeToScVal(title,       { type: 'string' }),
      nativeToScVal(description, { type: 'string' }),
      nativeToScVal(BigInt(goalAmount), { type: 'i128' }),
    ];
    const sim = await simulateCall('submit_proposal', args);
    const retval = sim.result?.retval;
    return retval ? Number(scValToNative(retval)) : null;
  } catch (error) {
    console.error('Error submitting proposal:', error);
    throw error;
  }
}

// ─── Invest in a proposal ───────────────────────────────────────
export async function invest(investor, proposalId, amount) {
  try {
    const args = [
      nativeToScVal(Address.fromString(investor), { type: 'address' }),
      nativeToScVal(proposalId, { type: 'u64' }),
      nativeToScVal(BigInt(amount), { type: 'i128' }),
    ];
    const sim = await simulateCall('invest', args);
    return sim;
  } catch (error) {
    console.error('Error investing:', error);
    throw error;
  }
}

// ─── Get investment amount ──────────────────────────────────────
export async function getInvestment(proposalId, investorAddress) {
  try {
    const args = [
      nativeToScVal(proposalId, { type: 'u64' }),
      nativeToScVal(Address.fromString(investorAddress), { type: 'address' }),
    ];
    const sim = await simulateCall('get_investment', args);
    const retval = sim.result?.retval;
    if (!retval) return '0';
    return scValToNative(retval).toString();
  } catch (error) {
    console.error('Error fetching investment:', error);
    throw error;
  }
}
