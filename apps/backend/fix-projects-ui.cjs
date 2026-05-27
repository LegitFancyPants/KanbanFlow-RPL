const fs = require('fs');
let code = fs.readFileSync('src/frontend/pages/Projects.jsx', 'utf8');

// 1. Add "use client" if missing
if (!code.includes('"use client"')) {
  code = '"use client";\n' + code;
}

// 2. Fix React Router imports to Next.js navigation
code = code.replace(/import\s*\{\s*Link,\s*useNavigate\s*\}\s*from\s*['"]react-router-dom['"];/, 'import Link from "next/link";\nimport { useRouter } from "next/navigation";');

// 3. Fix Vite API Env
code = code.replace(/const API = import\.meta\.env\.VITE_API_URL;/g, 'const API = "";');

// 4. Fix useNavigate -> useRouter
code = code.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
code = code.replace(/navigate\(/g, 'router.push(');

// 5. UI Updates: Make card clickable
code = code.replace(
  '<article className="bg-[var(--color-card)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1">',
  '<article onClick={() => onOpen(project.id_project)} className="bg-[var(--color-card)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer">'
);

// 6. UI Updates: Remove "Kelola Board" button safely using substring replacements instead of greedy regex
const btnStart = '        <button\\n          onClick={() => onOpen(project.id_project)}\\n          className="text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline text-sm"\\n        >\\n          Kelola Board\\n          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">\\n            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />\\n          </svg>\\n        </button>';
const regexBtn = /[\s]*<button\s+onClick=\{\(\) => onOpen\(project\.id_project\)\}\s+className="text-\[var\(--color-primary\)\] font-medium flex items-center gap-1 hover:underline text-sm"\s*>\s*Kelola Board\s*<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">\s*<path d="M13\.5 4\.5L21 12m0 0l-7\.5 7\.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" \/>\s*<\/svg>\s*<\/button>/g;

code = code.replace(regexBtn, '');

fs.writeFileSync('src/frontend/pages/Projects.jsx', code, 'utf8');
console.log('Successfully applied all patches to Projects.jsx');
