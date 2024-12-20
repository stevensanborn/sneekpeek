import { NextResponse } from 'next/server'

// const getArticles = async () => {
    
//     console.log("getting articles ", `https://${process.env.URL}/api/articles/`)
//     try{
//         // const articles = await fetch(`https://${process.env.URL}/api/articles/`,{cache: 'no-store' })
//         let data = require('../../../setup/data/articles.json');
    
//         return data.json()
//     }catch(error){
//         console.error("Error getting articles", error)
//         return []
//     }
// }

export async function GET(request: Request) {
    let articles =  require('../../../setup/data/articles.json')

    const url = new URL(request.url)
    const articleId = url.searchParams.get('article')

    let article = articles.find((article: any) => article.id === articleId)
    if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    return NextResponse.json(article)
    // const {article} = request.query.searchParams
    // let data = [
    //     {
    //         "id": "1-crypto-markets-2024",
    //         "title": "The Future of Cryptocurrency Markets in 2024",
    //         "description": "An in-depth analysis of cryptocurrency market trends...",
    //         "synopsis": "Exploring the potential trajectories of major cryptocurrencies and the impact of regulatory changes in 2024."
    //     }
    // ]
    // return NextResponse.json(data)
    
  }
  