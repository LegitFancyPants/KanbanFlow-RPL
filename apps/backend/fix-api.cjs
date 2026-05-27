const fs = require('fs');

const f = 'src/frontend/pages/Board.jsx';
let content = fs.readFileSync(f, 'utf8');

// Replace the API variable
content = content.replace(/const API = import\.meta\.env\.VITE_API_URL;/g, 'const API = "";');

// Remove the if (!API) block
content = content.replace(/if \(!API\) \{\s*throw new Error\('VITE_API_URL belum diset di file \.env frontend'\);\s*\}/g, '');

fs.writeFileSync(f, content);
console.log('Fixed API check in Board.jsx');
