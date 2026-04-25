// This runs at Vercel build time to inject the API key
const fs = require('fs');
const key = process.env.GEMINI_API_KEY || '';
if (key) {
  let app = fs.readFileSync('app.js', 'utf8');
  app = app.replace(
    "apiKey: localStorage.getItem('vf_api_key') || '',",
    `apiKey: localStorage.getItem('vf_api_key') || '${key}',`
  );
  fs.writeFileSync('app.js', app);
  console.log('API key injected successfully');
}
