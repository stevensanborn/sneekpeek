use anchor_lang::prelude::*;
use crate::states::*;
use crate::states::ContentAccount;

pub fn initialize_content_account(ctx: Context<InitializeContentAccount>, name: String, duration: u64, cost: u64) -> Result<()> {

    //save the name
    let mut data_name = [0u8; NAME_LENGTH]; //initialize array with 0s
    data_name[..name.as_bytes().len()].copy_from_slice(name.as_bytes());
    ctx.accounts.content_account.name = data_name;
    ctx.accounts.content_account.name_length = name.as_bytes().len() as u16;
    //save the cost
    ctx.accounts.content_account.cost = cost;
    //save the duration
    ctx.accounts.content_account.duration = duration;
    //save the bump
    ctx.accounts.content_account.bump = ctx.bumps.content_account;
    ctx.accounts.content_account.authority = ctx.accounts.authority.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeContentAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init, 
        payer = authority, 
        space = 8 + ContentAccount::INIT_SPACE,
        seeds = [b"content_account", name.as_bytes(), authority.key().as_ref()], 
        bump
    )]
    pub content_account: Account<'info, ContentAccount>,
    pub system_program: Program<'info, System>,
}
