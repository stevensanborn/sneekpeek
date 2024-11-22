
use anchor_lang::prelude::*;

pub const NAME_LENGTH: usize = 250;

#[account ]
#[derive(InitSpace)]
pub struct ContentAccount {
    pub authority: Pubkey,
    //metadata
    pub name :[u8; NAME_LENGTH],
    pub name_length: u16,
    pub cost:u64,
    pub duration:u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ContentUserState {
    pub user: Pubkey,
    pub content_account: Pubkey,
    pub time: u64,
    pub bump: u8,
}
