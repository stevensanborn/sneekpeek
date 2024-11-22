use anchor_lang::prelude::*;
use crate::instructions::*;
// use crate::states::*;

mod instructions;
mod states;

declare_id!("FLdJRxLbgC6Qj4V9nWeEqjjw9dHVxmvTjqYkb24Wjx89");

#[program]
pub mod pay_per_page {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
    pub fn init_content_account(ctx: Context<InitializeContentAccount>, name: String, duration: u64, cost: u64) -> Result<()> {
        initialize_content_account(ctx, name, duration, cost)
    }

    pub fn buy_content_account(ctx: Context<BuyContentContext>) -> Result<()> {
        buy_content_state(ctx)
    }
   
    pub fn init_content_state(ctx: Context<InitializeContentState>) -> Result<()> {
        initialize_content_state(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
