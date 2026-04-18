import { SorobanClient, Contract, contractDataFromXDR, xdr } from 'stellar-sdk';
import { SOROBAN_CONFIG } from '../config/soroban.config.js';

// Initialize with config value, can be updated dynamically
let CONTRACT_ADDRESS = SOROBAN_CONFIG.CONTRACT_ADDRESS;
const NETWORK_PASSPHRASE = SOROBAN_CONFIG.NETWORK_PASSPHRASE;
const RPC_URL = SOROBAN_CONFIG.RPC_URL;

let client = null;

export function initSorobanClient() {
  if (!client) {
    client = new SorobanClient(RPC_URL);
  }
  return client;
}

export function getContractAddress() {
  return CONTRACT_ADDRESS;
}

export function setContractAddress(address) {
  // Update the contract address dynamically
  if (!address.startsWith('C')) {
    throw new Error('Invalid contract address. Must start with "C"');
  }
  CONTRACT_ADDRESS = address;
}

// Get all proposals
export async function getAllProposals() {
  try {
    if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
      throw new Error('Contract address not configured. Please set it in src/config/soroban.config.js');
    }
    
    const sorobanClient = initSorobanClient();
    
    // First, get the proposal count
    const countArgs = [{ type: 'void', value: undefined }];
    const countResult = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('get_proposal_count', countArgs)
    );
    
    const count = parseInt(countResult.result?.retval || '0');
    const proposals = [];
    
    // Fetch each proposal
    for (let i = 1; i <= count; i++) {
      const proposalResult = await sorobanClient.simulateTransaction(
        new Contract(CONTRACT_ADDRESS).call('get_proposal', [
          { type: 'u64', value: i.toString() }
        ])
      );
      
      if (proposalResult.result?.retval) {
        proposals.push({
          id: i,
          data: proposalResult.result.retval
        });
      }
    }
    
    return proposals;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

// Get a specific proposal
export async function getProposal(proposalId) {
  try {
    const sorobanClient = initSorobanClient();
    const result = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('get_proposal', [
        { type: 'u64', value: proposalId.toString() }
      ])
    );
    return result.result?.retval;
  } catch (error) {
    console.error(`Error fetching proposal ${proposalId}:`, error);
    throw error;
  }
}

// Submit a new proposal
export async function submitProposal(owner, title, description, goalAmount) {
  try {
    const sorobanClient = initSorobanClient();
    const args = [
      { type: 'address', value: owner },
      { type: 'string', value: title },
      { type: 'string', value: description },
      { type: 'i128', value: goalAmount.toString() }
    ];
    
    const result = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('submit_proposal', args)
    );
    
    return result.result?.retval;
  } catch (error) {
    console.error('Error submitting proposal:', error);
    throw error;
  }
}

// Invest in a proposal
export async function invest(investor, proposalId, amount) {
  try {
    const sorobanClient = initSorobanClient();
    const args = [
      { type: 'address', value: investor },
      { type: 'u64', value: proposalId.toString() },
      { type: 'i128', value: amount.toString() }
    ];
    
    const result = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('invest', args)
    );
    
    return result;
  } catch (error) {
    console.error('Error investing:', error);
    throw error;
  }
}

// Get investment amount
export async function getInvestment(proposalId, investorAddress) {
  try {
    const sorobanClient = initSorobanClient();
    const result = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('get_investment', [
        { type: 'u64', value: proposalId.toString() },
        { type: 'address', value: investorAddress }
      ])
    );
    return result.result?.retval || '0';
  } catch (error) {
    console.error('Error fetching investment:', error);
    throw error;
  }
}

// Get proposal count
export async function getProposalCount() {
  try {
    const sorobanClient = initSorobanClient();
    const result = await sorobanClient.simulateTransaction(
      new Contract(CONTRACT_ADDRESS).call('get_proposal_count', [])
    );
    return parseInt(result.result?.retval || '0');
  } catch (error) {
    console.error('Error fetching proposal count:', error);
    throw error;
  }
}
