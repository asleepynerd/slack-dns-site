# Using slack logins to manage a DNS.

I made this site so that people part of the hack club slack can get free subdomains for their projects.

It's made using shadcn, cloudflare, nextjs and tailwind.

The login is restricted to people part of the hack club workspace only, but this can be changed by editing the nextauth options.

You can also change what domains are avaliable in the @/lib/cloudflare.ts and .env files.

Eventually i'll add a better README.md and an emailing feature.
