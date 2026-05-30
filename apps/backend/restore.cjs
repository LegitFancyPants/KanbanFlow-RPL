const cp = require('child_process');
const fs = require('fs');

const pages = [
  { git: 'apps/frontend/src/pages/Dashboard.jsx', local: 'src/frontend/pages/Dashboard.jsx' },
  { git: 'apps/frontend/src/pages/Projects.jsx', local: 'src/frontend/pages/Projects.jsx' },
  { git: 'apps/frontend/src/pages/Board.jsx', local: 'src/frontend/pages/Board.jsx' }
];

pages.forEach(p => {
  let content = cp.execSync(`git show HEAD:${p.git}`).toString('utf8');
  fs.writeFileSync(p.local, content, 'utf8');
  console.log('Restored', p.local);
});
