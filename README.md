# Welcome to my next js sample work

- Deployed on Vercel [here](https://nextjsdemo-tau-five.vercel.app/)

## How I worked

I started by setting some stories and acceptance criteria - like one would in JIRA
![alt text](image.png)

### I worked on the back-end first:

- I deployed Supabase to a DigitalOcean Droplet and hosted it on a domain: https://jupiter-consulting.store
  - For the password if you wish to see, please contact me at my email.

Deploying a self-hosted server is really cool because it allows you to bypass bandwith, user number, and other arbitrary limits, giving you control over the deployment.
![alt text](image-2.png)

As well it is possible to set up backups:
![alt text](image-1.png)

- I worked on the API routes for getting data from GraphQL from Shopify. For this I use the `shopify-api-node` pacakge
- After settling on my desired grapql data, I created the table definitions in Supabase.
- I worked on the API routes for loading the data from graphql into Supabase, avoiding duplicates
- I worked on retrieving the data from Supabase into the console.

### Then I turned to the front end:

- Navigation Side Bar came first
- Then Products page and individual product
- Finally, I built the grid that would accept some chart items - but (gracefully) got some help from AI for this part, guiding it to create the graphs I want. This generated some errors, I have disabled ESlint for the deployment, but the charts page should be redone.
