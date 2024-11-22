// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import PayPerPageIDL from '../target/idl/pay_per_page.json'
import { PayPerPage } from '../target/types/pay_per_page'

// Re-export the generated IDL and type
export type { PayPerPage }
export { PayPerPageIDL }

// The programId is imported from the program IDL.
export const PAYPERPAGE_PROGRAM_ID = new PublicKey(PayPerPageIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getBasicProgram(provider: AnchorProvider) {
  return new Program(PayPerPageIDL as PayPerPage, provider)
}