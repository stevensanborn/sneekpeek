import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';

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
        // console.log("WebSocket message received", message)
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
  export { getContentAddress, getContentUserAddress ,CONTENT_ACCOUNT_AUTHORITY_ID, createWebSocketConnection,onFinalizedSignature};



