import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';
import * as crypto from 'crypto';
const CONTENT_ACCOUNT_SEED = "content_account";
const CONTENT_ACCOUNT_USER_SEED = "content_account_user";
const CONTENT_ACCOUNT_AUTHORITY_ID = new PublicKey("Bg1fXNB6zEVLmPCk7vGawo5uJ7wmydc71HSuCDrUeGqD");

function getContentAddress(name: string, signer: PublicKey, programID: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(CONTENT_ACCOUNT_SEED),
        anchor.utils.bytes.utf8.encode(name),
        signer.toBuffer()
      ], programID);
  }
  async function hashName(input: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    let hexString = await crypto.subtle.digest('SHA-256',data)

    const hashArray = Array.from(new Uint8Array(hexString));
    const hash = hashArray
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("");
    return hash;
  }
  
  function getContentUserAddress(contentAccount: PublicKey, signer: PublicKey, programID: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(CONTENT_ACCOUNT_USER_SEED),
        contentAccount.toBuffer(),
        signer.toBuffer()
      ], programID);
  }
  
  function createWebSocketConnection(url: string,{onerror,onmessage,onclose,onopen}:{onerror:Function|null,onmessage:Function|null,onclose:Function|null,onopen:Function|null}){
    let ws = new WebSocket(url)
    ws.addEventListener('open', ()=>{
        console.log("WebSocket connection opened")
        if(onopen){
            onopen()
        }
    })
    ws.addEventListener('message', (message)=>{
        console.log("WebSocket message received", message)
        if(onmessage){
            onmessage(message)
        }
    })
    ws.addEventListener('error', (error)=>{
        console.log("WebSocket error", error)
        if(onerror){
            onerror(error)
        }
    })
    ws.addEventListener('close', ()=>{
        console.log("WebSocket connection closed")
        if(onclose){
            onclose()
        }
    })

    return ws
  }

  function onFinalizedSignature(txid: string, clusterApiUrl:string,callback:Function){
    let wsId:any ={}
    let data = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "signatureSubscribe",
      "params": [
        txid,
        {
          "commitment": "finalized",
          "enableReceivedNotification": false
        }
      ]
    }
    function onMessage(message:MessageEvent){
        console.log("WebSocket message received", message)
        callback({result:{event:'message',message:message,wsId:wsId}})
    }
    function onError(error:Error){
        callback({result:{event:'error',error:error,wsId:wsId}})
    }
    function onClose(){
      callback({result:{event:'closed',wsId:wsId}})
    }
    function onOpen (){
      callback({result:{event:'open',wsId:wsId}})
      console.log("sending data",data)
      wsId = ws.send(JSON.stringify(data))
    }
    let ws = createWebSocketConnection(clusterApiUrl,{onmessage:onMessage,onerror:onError,onclose:onClose,onopen:onOpen})
  

  }

  async function getSignatureStatus(txid:string,connection:Connection){
    return new Promise(async (resolve,reject)=>{
    const method = "getSignatureStatuses"
    try {
      const response = await fetch(connection.rpcEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: method,
          params: [[txid]], // Add parameters if required by the method
        }),
      });
  
      const data = await response.json();
      console.log(data);
      if(data.error && data.error.code){
        console.error(data.error)
        reject(data.error)
      }
      else{
        resolve(data)
      }
    } catch (error) {
      console.error("Error making RPC request:", error);
      reject(error)
    }
    })
  }


  async function getTransactionStatus(txid:string,connection:Connection){
    return new Promise(async (resolve,reject)=>{
    const method = "getTransaction"
    try {
      const response = await fetch(connection.rpcEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: method,
          params: [txid,{commitment:'finalized'}], // Add parameters if required by the method
        }),
      });
  
      const data = await response.json();
      console.log(data);
      if(data.error && data.error.code){
        console.error(data.error)
        reject(data.error)
      }
      else{
        resolve(data)
      }
    } catch (error) {
      console.error("Error making RPC request:", error);
      reject(error)
    }
    })
  }
  async function checkSignatureComplete(txid:string,connection:Connection){
    return new Promise(async (resolve,reject)=>{
      let signatureStatus = false
      do{
        try{
          getSignatureStatus(txid,connection).then((data:any)=>{
            if (data.result.value[0] && data.result.value[0].confirmationStatus === 'finalized'){
              signatureStatus = true
            }
          }).catch((e:any)=>{
            console.log("REJECTION",e)
            signatureStatus = true
            reject(e)
          })
        }catch(e){
          console.log("REJECTION")
          signatureStatus = true
          reject(e)
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }while(!signatureStatus)
      resolve(true)
    })
  }
  async function checkTransactionComplete(txid:string,connection:Connection){
    return new Promise(async (resolve,reject)=>{
    
      let transactionStatus = false
      do{
        try{
          getTransactionStatus(txid,connection).then((data:any)=>{
            if (data.result.blockTime){
            console.log("transaction confirmed")
            transactionStatus = true
            }
          }).catch((e:any)=>{
            console.log("REJECTION",e)
            transactionStatus = true
            reject(e)
          })
        }catch(e){
          transactionStatus = true
          reject(e)
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }while(!transactionStatus)
      resolve(true)
    })
  }
  export { getContentAddress, hashName, getContentUserAddress ,CONTENT_ACCOUNT_AUTHORITY_ID, createWebSocketConnection,onFinalizedSignature,checkSignatureComplete,checkTransactionComplete};



