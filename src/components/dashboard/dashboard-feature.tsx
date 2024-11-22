'use client'

import Link from 'next/link'
import { AppHero } from '../ui/ui-layout'


export default function DashboardFeature() {
  return (
    <div>
      
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <img src="images/logoLarge.png" alt='sneek peek'></img>
        <div className="space-y-2 m-10">
          <p className='text-lg italic opacity-50'>Sneek Peek is a platform for creating micro transactions to timed access content.</p>
        </div>
        <Link href={'/articles'} >
        <button className="btn btn-primary">Get Started w Demo </button>
        </Link>
      </div>
    </div>
  )
}
