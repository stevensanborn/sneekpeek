import { useState } from "react"

import { useEffect } from "react"

export default function Price({sol}:{sol:number}) {
    const [price ,setPrice] = useState("")
    const [solusd ,setSolusd] = useState(0)

    useEffect(()=>{
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)
        .then(res => res.json())
        .then(data => {
            setSolusd(data.solana.usd)
            
        }).catch(error => {
            console.error('Error fetching SOL price:', error)
            setSolusd(0) // Set a default value on error
        })
    },[])

    useEffect(()=>{
        if(solusd > 0){
            setPrice("$"+(sol*solusd).toFixed(3))
        }
    },[sol,solusd])

    return <span>{price} </span>
}