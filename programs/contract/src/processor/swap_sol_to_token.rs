use solana_program::{
    account_info::next_account_info,
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
};
use spl_associated_token_account::solana_program::system_instruction;

use crate::errors::TokenSwapError;
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], lamports: u64) -> ProgramResult {
    msg!("swap sol to token, lamports: {}", lamports);
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let payer_ata = next_account_info(accounts_iter)?;
    let _program = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let pool = next_account_info(accounts_iter)?;
    let pool_ata = next_account_info(accounts_iter)?;
    let token_program_id = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (pool_pda, pool_bump_seed) =
        Pubkey::find_program_address(&[b"pool", mint.key.as_ref()], program_id);
    if pool_pda != *pool.key {
        msg!("Invalid pool account");
        return Err(TokenSwapError::InvalidAccountAddress.into());
    }

    msg!("transfer SOL from payer to program");
    let take_sol_from_payer_ix = system_instruction::transfer(payer.key, pool.key, lamports);
    let required_accounts_take_sol = [system_program.clone(), payer.clone(), pool.clone()];
    invoke(&take_sol_from_payer_ix, &required_accounts_take_sol);

    //send token
    msg!("transfer token from pool_ata to payer_ata");
    let give_token_to_payer_ix = spl_token::instruction::transfer(
        token_program_id.key,
        &pool_ata.key,
        &payer_ata.key,
        &pool.key,
        &[],
        lamports * 10 as u64,
    )?;
    invoke_signed(
        &give_token_to_payer_ix,
        &[
            token_program_id.clone(),
            payer_ata.clone(),
            pool_ata.clone(),
            pool.clone(),
        ],
        &[&[b"pool", mint.key.as_ref(), &[pool_bump_seed]]],
    )?;

    Ok(())
}
