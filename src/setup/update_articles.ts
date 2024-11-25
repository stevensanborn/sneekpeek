import { Connection, Keypair, clusterApiUrl ,PublicKey, SystemProgram} from '@solana/web3.js';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import * as ed25519 from 'ed25519-hd-key';
import bs58 from 'bs58';
import dotenv from 'dotenv';
dotenv.config();
import keys from '../../private/keys.json' assert {type: 'json'};
// import idl from '../../anchor/target/idl/pay_per_page.json' assert {type: 'json'};
// import { PayPerPage } from '../../anchor/target/types/pay_per_page';
import articles from './data/articles.json' assert {type: 'json'};
import { AnchorProvider, BN, Program,setProvider } from '@coral-xyz/anchor'
// import { AnchorProvider, Program ,setProvider} from '@project-serum/anchor';
// import { Wallet } from '@project-serum/anchor';
import { Wallet } from '@coral-xyz/anchor';
import { getBasicProgram, PAYPERPAGE_PROGRAM_ID, PayPerPageIDL } from '../../anchor/src/payperpage-exports';
import * as anchor from '@coral-xyz/anchor';
import { getContentAddress } from '../utils/utils';

// Load from a secret/seed phrase
const mnemonic = keys.mnemonic;
const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);

// You can create a keypair directly from the mnemonic by converting it into a seed
const seedPhraseKeypair = Keypair.fromSeed(seed);

/*
Convert the seed asynchronously so that you can perform other tasks while the seed is being generated. When to do this: generating a seed phrase in a web browser, or an API server that needs to handle multiple requests at the same time

const seed = bip39.mnemonicToSeed(mnemonic); 
*/

// Alternatively, to create a keypair using a custom derivation path
// Define the derivation path
const path = `m/44'/501'/0'/0'`; // Replace with your custom path
// Derive a seed from the given path
// const derivedSeed = ed25519.derivePath(path, Buffer.from(seed, "hex").toS).key;
const derivedSeed = ed25519.derivePath(path, seed.toString('hex')).key;
// Generate a keypair from the derived seed using tweetnacl (NaCl = Networking and Cryptography library)
const derivedUint8Keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
// This is a Uint8Array, not a Solana web3.js Keypair object, so you will need to convert it
const customPathKeypair = Keypair.fromSecretKey(
  Uint8Array.from(derivedUint8Keypair.secretKey)
);

// Load from Byte Array
const byteArray = keys.secretKey;
const byteArraySecretKey = Uint8Array.from(byteArray);
const byteArrayKeypair = Keypair.fromSecretKey(byteArraySecretKey);
// console.log('Public key from byteArrayKeypair:', byteArrayKeypair.publicKey.toBase58());

// Load from base58 encoded string
const base58String = keys.base58PrivateKey;
const base58SecretKey = bs58.decode(base58String);
const base58Keypair = Keypair.fromSecretKey(base58SecretKey);

// Load from hexadecimal string
const hexString = keys.secretKeyHex;
const hexStringSecretKey = new Uint8Array(
  hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
);
const keypairFromHex = Keypair.fromSecretKey(hexStringSecretKey);

// Check that the public keys for all the keypairs match
// This is done to verify that the keypairs were loaded correctly
const arePublicKeysSame =
  seedPhraseKeypair.publicKey.toBase58() ===
    byteArrayKeypair.publicKey.toBase58() &&
  byteArrayKeypair.publicKey.toBase58() ===
    base58Keypair.publicKey.toBase58() &&
  base58Keypair.publicKey.toBase58() === keypairFromHex.publicKey.toBase58();

console.log('Do all public keys match?', arePublicKeysSame);

let url ="http://127.0.0.1:8899" 
url = clusterApiUrl('devnet');
const connection = new Connection(url, 'confirmed');
console.log(keypairFromHex.publicKey.toBase58())
// Load any of the keypairs and check the balance
// let balance = await (async ()=>{ return   await connection.getBalance(keypairFromHex.publicKey);})();
// console.log(
//   'Account Balance:',
//    balance
// );






// console.log("Program address" ,idl.address);

// //call program

// // Create a NodeWallet instance using your keypair (using keypairFromHex as an example)
// const wallet = new Wallet(keypairFromHex);

// const provider = new AnchorProvider(connection, wallet, {});
// setProvider(provider);
// console.log("Program metadata:", idl.metadata);


// // Add IDL validation before creating program instance
// console.log("IDL Structure:", JSON.stringify(idl, null, 2));

// const idl = JSON.parse(
//   require("fs").readFileSync("anchor/target/idl/pay_per_page.json", "utf8")
// );


const provider = new AnchorProvider(connection, new Wallet(keypairFromHex), {});
setProvider(provider);

const programId = new PublicKey(PAYPERPAGE_PROGRAM_ID);
    // Add missing required properties from idl.metadata
    const program = getBasicProgram(provider);

    console.log("Program successfully initialized");


articles.forEach(async (article) => {
  console.log(article.id)
  const [contentAccountKey, contentAccountBump] = getContentAddress(
    article.id,
    keypairFromHex.publicKey,
    program.programId
  );
  console.log(contentAccountKey.toBase58())
  // let contentAccountInfo = await program.account.contentAccount.fetch(
  //   contentAccountKey
  // );
  // if (contentAccountInfo) {
    
  //   console.log(article.id, 'already exists as', contentAccountKey.toBase58(),contentAccountInfo);
    
  // } else {
  try{
    const tx = await program.methods
    .upContentAccount(article.id, new BN(360), new BN(1_000_000))
      .accountsStrict({
        authority: keypairFromHex.publicKey,
        contentAccount: contentAccountKey,
        systemProgram: SystemProgram.programId
      })
      .signers([keypairFromHex])
      .rpc();
    console.log(article.id, tx);
  } catch(e){
    console.log(e,)
  }
  // // }


});


