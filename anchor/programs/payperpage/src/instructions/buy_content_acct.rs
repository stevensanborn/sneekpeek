use anchor_lang::prelude::*;
use crate::states::*;
use anchor_lang::solana_program::system_instruction;

pub fn buy_content_state(ctx: Context<BuyContentContext>) -> Result<()> {

    //do the transfer 
    let from_account = &ctx.accounts.payer;
    let to_account = &ctx.accounts.authority;

    msg!("cost: {}", ctx.accounts.content_account.cost);
    
        // Create the transfer instruction
    let transfer_instruction = system_instruction::transfer(
        from_account.key, 
        to_account.key,
        ctx.accounts.content_account.cost);

    //invoke the transfer instruction
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[
            from_account.to_account_info(),
            to_account.to_account_info()
        ]
     
    )?;

    //save to chain
    ctx.accounts.content_pay_user_account.time=Clock::get()?.unix_timestamp as u64;
    

    Ok(())



}




#[derive(Accounts)]
pub struct BuyContentContext<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
            seeds = [b"content_account",
            content_account.name[..content_account.name_length as usize].as_ref(),
            content_account.authority.key().as_ref()],
            bump=content_account.bump
        )]
    pub content_account: Account<'info, ContentAccount>,
    
    #[account(
        mut,
        seeds = [
                b"content_account_user",
                content_account.key().as_ref(),
                payer.key().as_ref()],

        bump
    )]
    pub content_pay_user_account: Account<'info, ContentUserState>,

    /// CHECK:
    #[account(
        mut,
        address = content_account.authority,
    )]
    pub authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,    
}