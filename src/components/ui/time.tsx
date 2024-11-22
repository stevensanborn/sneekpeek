import { useState } from "react"
import { useEffect } from "react"

export default function Time({seconds}:{seconds:number}) {
    const [time,setTime] = useState("")
    
    useEffect(()=>{
        // Convert seconds to days, hours, minutes, seconds
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;

        // Build the time string
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
        
        setTime(parts.join(' '));   
    },[seconds])            
    
    return <span>{time}</span>
}