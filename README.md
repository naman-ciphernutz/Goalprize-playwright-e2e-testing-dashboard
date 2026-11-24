# Goalprize Admin — Playwright test dashboard

Piwi-style testing dashboard for Goalprize Admin.

## Local

```bash
npm install
npm run dev
```

- Dashboard: http://localhost:3010/dashboard  
- Click **Run tests** to execute the login + core suite in the UI  

## Suite (4 cases)

1. Login — admin sign-in page loads  
2. Login — required fields validation  
3. Login — valid admin credentials  
4. Core — statistics dashboard loads  

## Vercel

```bash
npx vercel
```

Root directory: this folder. Framework: Next.js. No special env required for the dashboard demo.
