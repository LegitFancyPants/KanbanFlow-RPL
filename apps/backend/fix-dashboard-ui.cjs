const fs = require('fs');
let code = fs.readFileSync('src/frontend/pages/Dashboard.jsx', 'utf8');

// 1. Add "use client" if missing
if (!code.includes('"use client"')) {
  code = '"use client";\n' + code;
}

// 2. Fix React Router imports and add useEffect
code = code.replace(/import\s*\{\s*Link,\s*useNavigate\s*\}\s*from\s*['"]react-router-dom['"];/, 'import Link from "next/link";\nimport { useRouter } from "next/navigation";\nimport { useEffect } from "react";');
code = code.replace(/import\s+React,\s*\{\s*useState\s*\}\s+from\s*['"]react['"];/, 'import React, { useState, useEffect } from "react";');

// 3. Fix useNavigate -> useRouter
code = code.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
code = code.replace(/navigate\(/g, 'router.push(');

// 4. Fix Link 'to=' -> 'href='
code = code.replace(/<Link([^>]*?)to=(['"{])/g, '<Link$1href=$2');

// 5. Inject Stats State and useEffect inside Dashboard
const statsLogic = `
  const [stats, setStats] = useState({ activeProjects: 0, completedTasks: 0, overdueTasks: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
  }, []);
`;
code = code.replace(/const \[dropdownOpen, setDropdownOpen\] = useState\(false\);/, 'const [dropdownOpen, setDropdownOpen] = useState(false);' + statsLogic);

// 6. Update HTML numbers
// Replace "Kamu memiliki 2 tugas prioritas tinggi yang perlu ditinjau."
code = code.replace(
  /Kamu memiliki \d+ tugas prioritas tinggi yang perlu ditinjau\./,
  'Kamu memiliki {stats.overdueTasks} tugas terlewat yang perlu ditinjau.'
);

// Replace "21" tasks
code = code.replace(
  /<span className="text-5xl font-black text-slate-900 leading-none">21<\/span>/,
  '<span className="text-5xl font-black text-slate-900 leading-none">{String(stats.completedTasks).padStart(2, "0")}</span>'
);

// Replace "03" projects
code = code.replace(
  /<span className="text-5xl font-black text-slate-900 leading-none">03<\/span>/,
  '<span className="text-5xl font-black text-slate-900 leading-none">{String(stats.activeProjects).padStart(2, "0")}</span>'
);

// Replace "02" overdue
code = code.replace(
  /<span className="text-5xl font-black text-white leading-none drop-shadow-sm">02<\/span>/,
  '<span className="text-5xl font-black text-white leading-none drop-shadow-sm">{String(stats.overdueTasks).padStart(2, "0")}</span>'
);

fs.writeFileSync('src/frontend/pages/Dashboard.jsx', code, 'utf8');
console.log('Successfully patched Dashboard.jsx');
