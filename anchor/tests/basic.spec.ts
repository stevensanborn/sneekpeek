import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { PayPerPage } from '../target/types/pay_per_page';
import { expect, describe, it } from '@jest/globals';
import { getContentAddress, getContentUserAddress,hashName } from '../../src/utils/utils';
import assert from 'assert';

describe('basic', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.PayPerPage as Program<PayPerPage>;
  
  const authority = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  let contentAccountKey: PublicKey;
  let  contentAccountBump: number;
  let contentUserStateKey: PublicKey;
  
  // it('should run the program', async () => {
  //   // Add your test here.
  //   const tx = await program.methods.greet().rpc();
  //   console.log('Your transaction signature', tx);
  // });

  it('intitialize content account', async () => {

    await airdrop(provider.connection, authority.publicKey);

    let strName =  (await hashName("name test")).substring(0, 32)
    console.log(strName,strName.length)
    const tx = await program.methods.initContentAccount( strName, new BN(360), new BN(1000)).accounts(
      {
        authority: authority.publicKey,
        
      }
    ).signers([authority]).rpc({commitment: 'confirmed'});

    expect(tx).toBeDefined();
    const [pkey, bump] = getContentAddress(strName, authority.publicKey, program.programId);
    contentAccountKey = pkey;
    contentAccountBump = bump;

    let contentAccountInfo = await program.account.contentAccount.fetch(contentAccountKey);
    console.log(contentAccountInfo)
    expect(contentAccountInfo.authority.toBase58()).toBe(authority.publicKey.toBase58());
    const utf8ByteArray_name= stringToUtf8ByteArray(strName);
    
    const paddedByteArray_name = padByteArrayWithZeroes(utf8ByteArray_name, contentAccountInfo.name.length);
    console.log(Array.prototype.slice.call(paddedByteArray_name))
    expect(contentAccountInfo.name as number[] ).toEqual(Array.prototype.slice.call(paddedByteArray_name));
  


    console.log('Your transaction signature', tx);
  });

  it("Cost too low", async () => {
    let should_fail = "This Should Fail"
    
    
    let strName =  (await hashName("Hers a nother one")).substring(0, 32)

    try {
      await program.methods.initContentAccount(strName, new BN(100), new BN(10)).accounts(
        {
          authority: authority.publicKey,
        }
      ).signers([authority]).rpc({commitment: 'confirmed'});
    } catch (error:any) {
      console.log(error)
      // expect(error instanceof anchor.AnchorError).toBe(true);
        const err = anchor.AnchorError.parse(error.logs);
        console.log(err?.error.errorCode.code)
      assert.strictEqual(err?.error.errorCode.code, "CostTooLow");
      should_fail = "Failed"

    }
    expect(should_fail).toBe("Failed");
  })


  it("initialize content user state", async () => {

    await airdrop(provider.connection, user.publicKey);
    
    let strName = (await hashName("name test")).substring(0, 32)

    console.log(contentAccountKey.toBase58());

    const [contentUserKey, contentUserBump] = getContentUserAddress(contentAccountKey, user.publicKey, program.programId);
    
    console.log("contentUserKey",contentUserKey.toBase58())

    const tx = await program.methods.initContentState().accountsStrict({
        "payer": user.publicKey,
        "contentAccount": contentAccountKey,
        contentPayUserAccount:contentUserKey,
        "systemProgram": anchor.web3.SystemProgram.programId
      }
    ).signers([user]).rpc({commitment: 'confirmed'});
  
    
    expect(tx).toBeDefined();

    let contentAccountInfo = await program.account.contentUserState.fetch(contentUserKey);
    
    expect(contentAccountInfo.contentAccount.toBase58()).toBe(contentAccountKey.toBase58());
    
    console.log("buying content account")
    
    const tx2 = await program.methods.buyContentAccount().accountsStrict({
      "payer": user.publicKey,
      "authority": authority.publicKey,
      "contentAccount": contentAccountKey,
      "contentPayUserAccount": contentUserKey,
      "systemProgram": anchor.web3.SystemProgram.programId
    }).signers([user]).rpc({commitment: 'processed'});
    console.log(tx2)
    expect(tx2).toBeDefined();

    contentAccountInfo = await program.account.contentUserState.fetch(contentUserKey);
    let time:BN = contentAccountInfo.time;
    console.log("contentAccountInfo time",time.toNumber())
    expect(time.toNumber()).toBeGreaterThan(0);

  })

    


});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function stringToUtf8ByteArray(inputString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(inputString);
}
// Function to pad a byte array with zeroes to a specified length
function padByteArrayWithZeroes(byteArray: Uint8Array, length: number): Uint8Array {
  if (byteArray.length >= length) {
    return byteArray;
  }

  const paddedArray = new Uint8Array(length);
  paddedArray.set(byteArray, 0);
  return paddedArray;
}

