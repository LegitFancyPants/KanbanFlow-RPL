const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/frontend');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('"use client"')) {
    content = '"use client";\n' + content;
  }
  
  content = content.replace(/import\s+\{.*\}\s+from\s+['"]react-router-dom['"];?/g, match => {
    let newImports = '';
    if (match.includes('Link')) {
      newImports += 'import Link from "next/link";\n';
    }
    if (match.includes('useNavigate')) {
      newImports += 'import { useRouter } from "next/navigation";\n';
    }
    if (match.includes('useParams')) {
      newImports += 'import { useParams } from "next/navigation";\n';
    }
    return newImports;
  });
  
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  content = content.replace(/const navigate =/g, 'const router =');
  content = content.replace(/navigate\(/g, 'router.push(');
  content = content.replace(/to=(['"{])/g, 'href=$1');
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}/g, '');
  
  fs.writeFileSync(file, content);
});
console.log('Fixed frontend syntax');
