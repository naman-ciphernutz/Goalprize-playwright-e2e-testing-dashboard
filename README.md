# Goalprize Admin — Playwright test dashboard

Operations-style console for Goalprize Admin login and core checks (client demo).

## Local

```bash
npm install
npm run dev
```

- Console: http://localhost:3010/
- Click **Run suite** to stream the admin login → 2FA → statistics flow

## Suite (4 checks)

1. Login — admin sign-in page loads  
2. Login — required fields validation  
3. Login — valid admin credentials  
4. Core — statistics dashboard loads  

## Vercel

```bash
npx vercel
```

Root directory: this folder. Framework: Next.js. No special env required for the dashboard demo.
