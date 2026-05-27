const fs = require('fs');
const path = require('path');

const pages = ['login', 'signup', 'dashboard', 'projects'];
pages.forEach(p => {
  fs.mkdirSync(path.join('src/app', p), { recursive: true });
  const ComponentName = p === 'signup' ? 'SignUp' : p.charAt(0).toUpperCase() + p.slice(1);
  const content = `import dynamic from 'next/dynamic';

const ${ComponentName} = dynamic(() => import('@/frontend/pages/${ComponentName}'), { ssr: false });

export default function ${ComponentName}Page() { return <${ComponentName} />; }`;
  fs.writeFileSync(path.join('src/app', p, 'page.jsx'), content);
});

fs.mkdirSync('src/app/board/[projectId]', { recursive: true });
fs.writeFileSync('src/app/board/[projectId]/page.jsx', `import dynamic from 'next/dynamic';

const Board = dynamic(() => import('@/frontend/pages/Board'), { ssr: false });

export default function BoardPage() { return <Board />; }`);

fs.writeFileSync('src/app/page.jsx', `import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/frontend/App'), { ssr: false });

export default function HomePage() { return <App />; }`);
