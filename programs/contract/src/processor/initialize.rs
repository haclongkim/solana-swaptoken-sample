use crate::errors::TokenSwapError;
use crate::state;
use borsh::BorshSerialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction::create_account,
    sysvar::Sysvar,
};

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let pool = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (pool_pda, pool_bump_seed) =
        Pubkey::find_program_address(&[b"pool", mint.key.as_ref()], program_id);

    if pool_pda != *pool.key {
        msg!("Invalid pool account");
        return Err(TokenSwapError::InvalidAccountAddress.into());
    }

    msg!("create pool {} ...", pool.key.to_string());
    invoke_signed(
        &create_account(
            &payer.key,
            &pool.key,
            Rent::get()?.minimum_balance(state::TOKEN_SWAP_ACCOUNT_LEN),
            state::TOKEN_SWAP_ACCOUNT_LEN as u64,
            program_id,
        ),
        &[payer.clone(), system_program.clone(), pool.clone()],
        &[&[b"pool", mint.key.as_ref(), &[pool_bump_seed]]],
    )?;

    // * Allocate data to pool
    let pool_info = state::Pool {
        admin: *payer.key,
        pool: *pool.key,
        mint: *mint.key,
    };
    let pool_data = &mut *pool.data.borrow_mut();
    pool_info.serialize(pool_data)?;

    Ok(())
}
