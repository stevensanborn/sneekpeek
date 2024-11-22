use anchor_lang::prelude::*;
use crate::states::*;

pub fn initialize_content_state(ctx: Context<InitializeContentState>) -> Result<()> {
    
    //save the content account
    ctx.accounts.content_pay_user_account.content_account=ctx.accounts.content_account.key();
    //save the authority
    ctx.accounts.content_pay_user_account.user=ctx.accounts.payer.key();

    //save the bump
    ctx.accounts.content_pay_user_account.bump=ctx.bumps.content_pay_user_account;

    //save the duration
    let clock=Clock::get()?;
    ctx.accounts.content_pay_user_account.time=clock.unix_timestamp as u64;

    Ok(())
}


#[derive(Accounts)]
pub struct InitializeContentState<'info> {

    #[account(mut)]
    pub payer: Signer<'info>, //signer of the transaction

    // pda for the content 
    #[account(
        seeds = [b"content_account",
        content_account.name[..content_account.name_length as usize].as_ref(), 
        content_account.authority.key().as_ref()],
        bump=content_account.bump
    )]
    pub content_account: Account<'info, ContentAccount>,

    //
    #[account(
        init,
        payer = payer,
        space = 8 + ContentUserState::INIT_SPACE,
        seeds = [
                b"content_account_user",
                content_account.key().as_ref(),
                payer.key().as_ref()],
        bump
    )]
    pub content_pay_user_account: Account<'info, ContentUserState>,
    pub system_program: Program<'info, System>,
}