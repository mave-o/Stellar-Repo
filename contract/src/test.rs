#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};

/// Test 1 — Happy Path: SME submits a proposal successfully
#[test]
fn test_submit_proposal() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GOInvestContract, ());
    let client = GOInvestContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let id = client.submit_proposal(
        &owner,
        &String::from_str(&env, "Sari-Sari Store Expansion"),
        &String::from_str(&env, "Need funds to expand inventory"),
        &5000_i128,
    );

    assert_eq!(id, 1);
}

/// Test 2 — Edge Case: investing zero amount should panic
#[test]
#[should_panic(expected = "Investment amount must be greater than zero")]
fn test_invest_zero_amount_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GOInvestContract, ());
    let client = GOInvestContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.submit_proposal(
        &owner,
        &String::from_str(&env, "Food Cart Business"),
        &String::from_str(&env, "Starting a food cart"),
        &3000_i128,
    );

    let investor = Address::generate(&env);
    client.invest(&investor, &1, &0_i128); // should panic
}

/// Test 3 — State Verification: raised_amount updates correctly after investment
#[test]
fn test_investment_updates_raised_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GOInvestContract, ());
    let client = GOInvestContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.submit_proposal(
        &owner,
        &String::from_str(&env, "Tindahan ni Aling Nena"),
        &String::from_str(&env, "Expand the neighborhood store"),
        &10000_i128,
    );

    let investor = Address::generate(&env);
    client.invest(&investor, &1, &2500_i128);

    let proposal = client.get_proposal(&1);
    assert_eq!(proposal.raised_amount, 2500);
    assert!(proposal.is_active); // goal not yet reached
}

/// Test 4 — Proposal closes when goal is fully funded
#[test]
fn test_proposal_closes_when_goal_reached() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GOInvestContract, ());
    let client = GOInvestContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.submit_proposal(
        &owner,
        &String::from_str(&env, "GoNegosyo Cart"),
        &String::from_str(&env, "Mobile food cart near campus"),
        &5000_i128,
    );

    let investor = Address::generate(&env);
    client.invest(&investor, &1, &5000_i128); // exact goal amount

    let proposal = client.get_proposal(&1);
    assert_eq!(proposal.is_active, false); // should be closed now
}

/// Test 5 — Individual investment tracking is accurate
#[test]
fn test_get_investment_returns_correct_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GOInvestContract, ());
    let client = GOInvestContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.submit_proposal(
        &owner,
        &String::from_str(&env, "Ukay-Ukay Online"),
        &String::from_str(&env, "Secondhand clothing marketplace"),
        &8000_i128,
    );

    let investor = Address::generate(&env);
    client.invest(&investor, &1, &1500_i128);

    let contribution = client.get_investment(&1, &investor);
    assert_eq!(contribution, 1500);
}