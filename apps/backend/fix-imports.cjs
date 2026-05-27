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
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('@/backend//')) {
    content = content.replace(/@\/backend\/\//g, '@/backend/lib/');
    changed = true;
  }
  
  if (content.includes('@/lib/') && !content.includes('@/backend/lib/')) {
    content = content.replace(/@\/lib\//g, '@/backend/lib/');
    changed = true;
  }
  
  if (content.includes('@/services/') && !content.includes('@/backend/services/')) {
    content = content.replace(/@\/services\//g, '@/backend/services/');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed backend imports');
