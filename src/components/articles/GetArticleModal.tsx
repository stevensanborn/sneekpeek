import {X} from 'lucide-react'
import { useState } from 'react';

export default function GetArticleModal(params: {title: string, id: string, synopsis: string, setShowModal: (showModal: boolean) => void}) {
    
    const [state, setState] = useState("")

    function onClickGetAccess() {
        setState("connecting")
    }
    
    return (
        <div className="fixed w-full h-full  top-0 left-0  bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm" onClick={(e) => {e.preventDefault();params.setShowModal(false);}}>
        <div className=" inset-0 flex items-center justify-center z-50 max-w-xl" >
            
                <div className="bg-white  rounded-lg place-self-end pointer-events-all py-4 px-6 " onClick={(e) => {e.preventDefault();e.stopPropagation()}}>
                   
                <div className="cursor-pointer justify-self-end" onClick={(e) => {e.preventDefault();params.setShowModal(false);}}><button><X size={30} /></button></div>

                <h1 className=" gap-2 text-2xl font-bold my-3"> Get Access to {params.title} {params.id}</h1>

                <h2 className="text-gray-600 leading-relaxed my-3">{params.synopsis}</h2>

                <div onClick={(e) => {e.preventDefault();onClickGetAccess();}} className="cursor-pointer pointer-events-auto">
                    { state ==="" &&<button  className="bg-blue-500 text-white px-4 py-2 rounded-md my-3">Get Access</button>}
                    { state ==="connecting" && <button  className="bg-gray-500 text-white px-4 py-2 rounded-md my-3">Loading...</button>}
                </div>
            </div>
            </div>
        </div>
    )
}