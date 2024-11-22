import { NextResponse } from 'next/server'
// import articles from '../../../setup/data/articles'

export async function GET(request: Request) {
    let data = require('../../../setup/data/articles.json');
    return NextResponse.json(data)
    
  }
  