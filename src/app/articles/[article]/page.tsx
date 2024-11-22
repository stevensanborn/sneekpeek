"use client"
import { useEffect } from "react"
import { useState } from "react"
import {useWallet} from "@solana/wallet-adapter-react"
import GetArticleModal from "@/components/articles/GetArticleModal"
import ContentStatus from "@/components/articles/ContentStatus"
import { useAnchorProvider } from "@/components/solana/solana-provider"
import { getBasicProgram } from "@project/anchor"
import { PublicKey,LAMPORTS_PER_SOL, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js"
import { CONTENT_ACCOUNT_AUTHORITY_ID, getContentAddress, getContentUserAddress, onFinalizedSignature } from "@/utils/utils"
import Price from "@/components/ui/price"
import Time from "@/components/ui/time"
import {CircleX,LoaderCircle} from 'lucide-react'
import {ContentStatusEnum} from "@/components/articles/ContentStatus"

type Article = {
    title: string | null;
    synopsis: string | null;
    body: string | null;
}

const enum transactionStatusEnum {
    IDLE = "IDLE",
    LOADING = "LOADING",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}


export default  function ArticlePage({params}:any) {
    // const article = await fetch(`/api/article?article=${params.article}`,{cache: 'no-store' })
    const [article, setArticle] = useState<Article>({title: null, synopsis: null, body: null})
   
    const { publicKey, signTransaction } = useWallet(); 
    
    const [checkAccess, setCheckAccess] = useState(false)
    const provider = useAnchorProvider();
    const program = getBasicProgram(provider);
    const [articleInfo, setArticleInfo] = useState<any>(null);
    const [contentUserAccountKey, setContentUserAccountKey] = useState<PublicKey | null>(null);
    const [contentUserState, setContentUserState] = useState<any>(null);
    
    const [contentStatus, setContentStatus] = useState(ContentStatusEnum.NO_ACCESS)

    const [transactionStatus, setTransactionStatus] = useState(transactionStatusEnum.IDLE)

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch(`/api/article?article=${params.article}`,{cache: 'no-store' })
            setArticle(await data.json())
        }
        fetchData()
    },[])

    useEffect(()=>{
        console.log("publicKey", publicKey?.toBase58())
    },[publicKey])


    //content account key
    const  [contentAccountKey, setContentAccountKey] = useState<PublicKey | null>(null);
    useEffect(()=>{
        console.log(publicKey?.toBase58())
        if(!publicKey) return;
        let [contentAccountKey, contentAccountBump] = getContentAddress(params.article, CONTENT_ACCOUNT_AUTHORITY_ID, program.programId);
        setContentAccountKey(contentAccountKey);
    },[params.article,publicKey])

    //get content account
    const fGetContentAccount = async ()=>{
        if(!publicKey || !contentAccountKey) return;

        console.log("contentId",params.article)
      
        try {
            let contentAccountInfo = await program.account.contentAccount.fetch(contentAccountKey);
            console.log("contentAccountInfo", contentAccountInfo);
            setArticleInfo(contentAccountInfo);
        } catch (error) {
            console.log("Error fetching content account:", error);
            setArticleInfo(null);
            setContentStatus(ContentStatusEnum.NO_ACCESS);
        }
    }
    useEffect(()=>{ fGetContentAccount()},[params.article,contentAccountKey,publicKey])    
    
    //get content user state
    const fCheckAccess = async ()=>{
        console.log("checking access")
        try{
            let contentUserAccountInfo = await program.account.contentUserState.fetch(contentUserAccountKey!);
            setContentUserState(contentUserAccountInfo);
            console.log("contentUserAccountInfo", contentUserAccountInfo);
            console.log(contentUserAccountInfo.time.toNumber() + articleInfo.duration.toNumber())
            console.log(Date.now()/1000)
            if(contentUserAccountInfo.time.toNumber() > 0 && 
                contentUserAccountInfo.time.toNumber() + articleInfo.duration.toNumber() > Date.now()/1000
                ){

                setContentStatus(ContentStatusEnum.ACCESSIBLE);
            }else{
                setContentStatus(ContentStatusEnum.EXPIRED);
            }
        }catch(error){
            console.log("Error fetching content user account:", error);
            setContentStatus(ContentStatusEnum.NO_ACCESS);
        }
     }
     useEffect(()=>{
        if(!contentUserAccountKey) return;
        fCheckAccess();
        
     },[contentUserAccountKey,checkAccess])

    useEffect(()=>{
        if(!publicKey || !articleInfo ||!contentAccountKey) return;
        {
            let [userAccountKey, contentUserAccountBump] = getContentUserAddress( contentAccountKey , publicKey!, program.programId);
            setContentUserAccountKey(userAccountKey);
        }
    },[articleInfo,contentAccountKey,publicKey])

        //check if account is expired
    useEffect(()=>{
        if(contentUserState){
            if(contentUserState.time.toNumber() + articleInfo.duration.toNumber() < Date.now()/1000){
                setContentStatus(ContentStatusEnum.EXPIRED);
            }else{
                setContentStatus(ContentStatusEnum.ACCESSIBLE);
            }
        }
    },[contentUserState,articleInfo])

    const fBuyArticle = async () => {
        if(!contentUserAccountKey) return;
        
        setTransactionStatus(transactionStatusEnum.LOADING)

        // Create a v0 Transaction
        const tx = new Transaction();
        console.log("pub "+publicKey!.toBase58())
        console.log("contentAccount"+contentAccountKey!.toBase58())
        console.log("contentUserAccount"+contentUserAccountKey!.toBase58())
        
        //initialize content user account
        if(!contentUserState){
            tx.add(await program.methods.initContentState().accountsStrict({
                payer: publicKey!,
                contentAccount: contentAccountKey!,
                contentPayUserAccount: contentUserAccountKey!,
                systemProgram: SystemProgram.programId
            }).instruction());
        }
        //buy content account
        tx.add(await program.methods.buyContentAccount().accountsStrict({
            payer: publicKey!,
            contentAccount: contentAccountKey!,
            authority: CONTENT_ACCOUNT_AUTHORITY_ID,
            contentPayUserAccount: contentUserAccountKey!,
            systemProgram: SystemProgram.programId
        }).instruction());
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey!;

        // Convert to VersionedTransaction
        try {
            const versionedTx = new VersionedTransaction(tx.compileMessage());
            const signedTx = await signTransaction!(versionedTx)
            // Send the transaction
            const txid = await provider.connection.sendTransaction(signedTx, {
                maxRetries: 5,
                skipPreflight: true,
                preflightCommitment: 'processed'
            });
            

            provider.connection.onSignature(txid, (signatureInfo, context)=>{
                console.log("signatureInfo", signatureInfo)
                if(signatureInfo.err){
                    setTransactionStatus(transactionStatusEnum.ERROR)
                }
                
            })
            //subscribe to signature
            onFinalizedSignature(txid,provider.connection.rpcEndpoint,(result:any)=>{
                console.log("result", result)
                if(result.result.event === 'message'){
                    console.log("success",result.result.message)
                    setTransactionStatus(transactionStatusEnum.SUCCESS)
                    setCheckAccess(!checkAccess) //trigger check access
                }
                if(result.result.event === 'error'){
                    console.log("error",result.result.error)
                    setTransactionStatus(transactionStatusEnum.ERROR)
                }
            })
            
            // setTimeout(()=>{
            //     setTransactionStatus(transactionStatusEnum.SUCCESS)
            //     setCheckAccess(!checkAccess) //trigger check access
            // },1000)
        } catch (error) {
            
            setTransactionStatus(transactionStatusEnum.IDLE)

            console.error("Error sending transaction:", error);
            if (error instanceof Error) {
                // @ts-ignore - getLogs() might exist on the error
                const logs = error.logs;
                if (logs) {
                    console.error("Transaction logs:", logs);
                }
            }
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8 relative" >
               
                <div className="flex justify-between items-center absolute bg-transparent rounded-full" style={{top:-20,left:-20}}>
                    <button onClick={()=>{window.history.back()}} className="bg-blue-500 hover:bg-blue-600 text-white m-2 rounded-full"><CircleX size={30}></CircleX></button>
                </div>
                <img src={`/images/${params.article}.jpeg`} className="max-w-full rounded-lg" alt={""+article.title}/>

                    <h1 className="text-4xl font-bold text-gray-800 my-6 ">{article.title}</h1>
        
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Synopsis</h2>
                    <p className="text-gray-600 leading-relaxed">{article.synopsis}</p>
                </div>
                
                <div className="mt-8">
                    
                {contentStatus !== ContentStatusEnum.ACCESSIBLE && (
                    <div className="flex flex-col items-center  my-4 bg-gray-100 rounded-lg p-4">
                        <h2 className="text-md  text-gray-700 mb-2">
                            { !contentUserState &&( "In order to view this article, you need to get access. ")} 
                            { contentUserState &&( "Your access to this article expired.  ")} 
                        </h2>
                        {!publicKey && (
                            <p className="text-gray-600 leading-relaxed">Please connect your wallet to view this article</p>
                        )}
                        {articleInfo &&(
                        <button onClick={() => 
                            fBuyArticle()
                        } className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap inline">

                            {
                            transactionStatus === transactionStatusEnum.LOADING && <LoaderCircle size={20} className="animate-spin mr-2 inline" />
                            
                            }
                            Get Access ,  <Price sol={articleInfo?.cost.toNumber()/LAMPORTS_PER_SOL} />
                            for <Time seconds={articleInfo?.duration.toNumber() ?? 0} />
                        </button>
                        )}
                        
                        
                    </div>
                )}
                
                    { contentStatus === ContentStatusEnum.ACCESSIBLE &&
                        <ContentStatus  articleInfo={articleInfo} contentUserState={contentUserState} contentStatus={contentStatus} triggerCheckAccess={()=>{setCheckAccess(!checkAccess)}} />
                    }
                </div>


                { contentStatus === ContentStatusEnum.ACCESSIBLE && (
                <div>
                    <div 
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: article.body || '' }}
                    />
                </div>
                )}
               
            </div>  
            
        </div>
    )
}

// export {ContentStatusEnum}