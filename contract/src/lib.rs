#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String
};

// ─── Storage Keys ───────────────────────────────────────────────
#[contracttype]
pub enum DataKey {
    Proposal(u64),   // stores a Proposal by its ID
    ProposalCount,   // tracks total number of proposals
    Investment(u64, Address), // tracks investment per proposal per investor
}

// ─── Data Structures ────────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub struct Proposal {
    pub id: u64,
    pub owner: Address,       // the small vendor/SME
    pub title: String,
    pub description: String,
    pub goal_amount: i128,    // funding goal in stroops (XLM smallest unit)
    pub raised_amount: i128,  // total raised so far
    pub is_active: bool,
}

// ─── Contract ───────────────────────────────────────────────────
#[contract]
pub struct GOInvestContract;

#[contractimpl]
impl GOInvestContract {

    /// Submit a new investment proposal (called by an SME/vendor)
    pub fn submit_proposal(
        env: Env,
        owner: Address,
        title: String,
        description: String,
        goal_amount: i128,
    ) -> u64 {
        // Owner must authorize this action
        owner.require_auth();

        // Get current count and increment
        let count: u64 = env.storage().instance()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0);
        let new_id = count + 1;

        // Build the proposal object
        let proposal = Proposal {
            id: new_id,
            owner: owner.clone(),
            title,
            description,
            goal_amount,
            raised_amount: 0,
            is_active: true,
        };

        // Save proposal and update count
        env.storage().instance().set(&DataKey::Proposal(new_id), &proposal);
        env.storage().instance().set(&DataKey::ProposalCount, &new_id);

        new_id // return the new proposal ID
    }

    /// Invest into a proposal (called by an investor)
    pub fn invest(
        env: Env,
        investor: Address,
        proposal_id: u64,
        amount: i128,
    ) {
        // Investor must authorize
        investor.require_auth();

        // Amount must be positive
        if amount <= 0 {
            panic!("Investment amount must be greater than zero");
        }

        // Fetch the proposal
        let mut proposal: Proposal = env.storage().instance()
            .get(&DataKey::Proposal(proposal_id))
            .expect("Proposal not found");

        // Proposal must still be active
        if !proposal.is_active {
            panic!("Proposal is no longer active");
        }

        // Update raised amount
        proposal.raised_amount += amount;

        // If goal is reached, close the proposal
        if proposal.raised_amount >= proposal.goal_amount {
            proposal.is_active = false;
        }

        // Track individual investor contribution
        let invest_key = DataKey::Investment(proposal_id, investor.clone());
        let prev: i128 = env.storage().instance()
            .get(&invest_key)
            .unwrap_or(0);
        env.storage().instance().set(&invest_key, &(prev + amount));

        // Save updated proposal
        env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);
    }

    /// Get a proposal by ID
    pub fn get_proposal(env: Env, proposal_id: u64) -> Proposal {
        env.storage().instance()
            .get(&DataKey::Proposal(proposal_id))
            .expect("Proposal not found")
    }

    /// Get total number of proposals submitted
    pub fn get_proposal_count(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0)
    }

    /// Get how much a specific investor contributed to a proposal
    pub fn get_investment(env: Env, proposal_id: u64, investor: Address) -> i128 {
        env.storage().instance()
            .get(&DataKey::Investment(proposal_id, investor))
            .unwrap_or(0)
    }
}

mod test;