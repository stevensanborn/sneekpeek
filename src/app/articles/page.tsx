
"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
const getArticles = async () => {
  const articles = await fetch(`/api/articles/`,{cache: 'no-store' })
  return articles.json()
}


export default async function Page() {
    const router = useRouter()
    const [articles,setState] = useState([])
    const {publicKey} = useWallet();
    useEffect(() => {
        const fetchData = async () => {
            const data = await getArticles()
            setState(data)
        }
        fetchData()
    },[])
  return (
    <div>
      
      <div className='text-2xl font-bold my-4'>Articles</div>

      {articles.map((article: any) => (
        <div key={article.id}>

           <div className="max-w-screen-md my-4 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex flex-row">
                
             
                <div className='w-5/6 mr-4'>
                <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{article.title}</h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">  {article.synopsis}</p>
                
                <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={(e) => {
                    e.preventDefault()
                    router.push(`/articles/${article.id}`)
                }}
                >
                    Read more
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </a>
                </div>
                <img src={`/images/${article.id}.jpeg`} className="h-30 rounded-lg object-cover w-1/6 border-r border-" alt={""+article.title}/>

            </div>
        </div>
      ))}
    </div>
  )
}
