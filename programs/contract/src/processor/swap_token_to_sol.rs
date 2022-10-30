use solana_program::{
    account_info::next_account_info, account_info::AccountInfo, entrypoint::ProgramResult, msg,
    program::invoke, pubkey::Pubkey,
};

pub fn process(_program_id: &Pubkey, accounts: &[AccountInfo], lamports: u64) -> ProgramResult {
    msg!("swap sol to token, lamports: {}", lamports);
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let payer_ata = next_account_info(accounts_iter)?;
    let program = next_account_info(accounts_iter)?;
    let _mint = next_account_info(accounts_iter)?;
    let pool = next_account_info(accounts_iter)?;
    let pool_ata = next_account_info(accounts_iter)?;
    let token_program_id = next_account_info(accounts_iter)?;

    msg!("transfer {} Token lamports from payer to pool", lamports);
    let payer_token_to_pool_ix = spl_token::instruction::transfer(
        &token_program_id.key,
        &payer_ata.key,
        &pool_ata.key,
        &payer.key,
        &[],
        lamports,
    )?;
    invoke(
        &payer_token_to_pool_ix,
        &[
            token_program_id.clone(),
            payer_ata.clone(),
            pool_ata.clone(),
            program.clone(),
            payer.clone(),
        ],
    )?;

    msg!("transfer SOL from pool to payer");
    **pool.try_borrow_mut_lamports()? -= lamports / 10 as u64;
    **payer.try_borrow_mut_lamports()? += lamports / 10 as u64;
    msg!(
        "{} SOL lamports transferred from pool to payer",
        lamports / 10 as u64,
    );

    Ok(())
}
