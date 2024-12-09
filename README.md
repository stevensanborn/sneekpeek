
[Demo on Vercel](https://sneekpeek.vercel.app/) - (Devnet Only)

![sneekpeek](https://sneekpeek.vercel.app/images/logoLarge.png)


*Have you even wanted to see just a single article but not commit to an entire subscription ?

**SneekPeek is a platform  to allow payments for individual pieces of content using the Solana blockchain.**
  
In ths example we use a simple web app that exposes a list of sample articles. The article ids are stored on chain with a cost and duration. When a user clicks on an article, they can buy access to the article and then read it. The user state is stored on chain . When times is up the user has the option to buy again.


This app is deployed at https://sneekpeek.vercel.app/
It only exists on devnet and is not available on mainnet.



![Screen](https://sneekpeek.vercel.app/images/Scrn.png)
  
used solana-scaffold  

tests : tests/basic.spec.ts



Note: This is the front end of the app that can transact with pre-seeded accounts on the chain. The accounts were pre-seeded using the seed_articles.ts script (pnpm run seed). The CONTENT_ACCOUNT_AUTHORITY_ID is the authority of these accounts.  On devnet these accounts have been setup and are live.  The user can buy access to these content through interaction with the solana blockchain.  


# Running the app
pnpm install
pnpm run dev
