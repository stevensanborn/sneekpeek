use anchor_lang::prelude::*;

#[error_code]

pub enum PayperpageError {
    #[msg("Cannot initialize, name too long")]
    NameTooLong,
    #[msg("Cannot initialize, cost too low")]
    CostTooLow,
}
