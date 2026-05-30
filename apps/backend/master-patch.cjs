const fs = require('fs');

const pages = [
  { path: 'src/frontend/pages/Dashboard.jsx', type: 'dashboard' },
  { path: 'src/frontend/pages/Projects.jsx', type: 'projects' },
  { path: 'src/frontend/pages/Board.jsx', type: 'board' }
];

pages.forEach(p => {
  let code = fs.readFileSync(p.path, 'utf8');

  // Common Next.js migration
  if (!code.includes('"use client"')) code = '"use client";\n' + code;
  code = code.replace(/import\s*\{\s*Link,\s*useNavigate,\s*useParams\s*\}\s*from\s*['"]react-router-dom['"];/, 'import Link from "next/link";\nimport { useRouter, useParams } from "next/navigation";\nimport NotificationBell from "@/frontend/components/NotificationBell";');
  code = code.replace(/import\s*\{\s*Link,\s*useNavigate\s*\}\s*from\s*['"]react-router-dom['"];/, 'import Link from "next/link";\nimport { useRouter } from "next/navigation";\nimport NotificationBell from "@/frontend/components/NotificationBell";');
  code = code.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
  code = code.replace(/navigate\(/g, 'router.push(');
  code = code.replace(/to=(['"{])/g, 'href=$1');
  code = code.replace(/const API = import\.meta\.env\.VITE_API_URL;/g, 'const API = "";');
  code = code.replace(/\$\{API\}/g, '');

  // Inject Notification Bell
  // Finding `<div className="relative">` directly inside nav (the User Profile wrapper).
  // All 3 files have this structure:
  /*
        {/* User Profile *\/}
        <div className="relative">
          <div
  */
  // We want to turn it into:
  /*
        {/* User Profile *\/}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="relative">
            <div
  */
  // And then close `</div>` later.
  // Instead of closing later, we can just replace the innermost `relative` div that contains the bell AND profile.
  // Actually, the simplest way is to inject `<NotificationBell />` BEFORE the profile `div.relative`.
  code = code.replace(
    /\{\/\* User Profile \*\/\}\s*<div className="relative">/,
    '{/* User Profile */}\n        <div className="flex items-center gap-2">\n          <NotificationBell />\n          <div className="relative">'
  );

  // Close the flex container at the end of the profile dropdown block.
  // It ends with: `          )}\n        </div>` inside a `<nav>` or `<header>`.
  code = code.replace(
    /          \)\}\n        <\/div>\n      <\/nav>/,
    '          )}\n        </div>\n        </div>\n      </nav>'
  );
  code = code.replace(
    /          \)\}\n        <\/div>\n      <\/header>/,
    '          )}\n        </div>\n        </div>\n      </header>'
  );

  if (p.type === 'dashboard') {
    code = code.replace(/import React, \{ useState \} from 'react';/, 'import React, { useState, useEffect } from "react";');
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
    code = code.replace(/Kamu memiliki \d+ tugas prioritas tinggi yang perlu ditinjau\./, 'Kamu memiliki {stats.overdueTasks} tugas terlewat yang perlu ditinjau.');
    code = code.replace(/<span className="text-5xl font-black text-slate-900 leading-none">21<\/span>/, '<span className="text-5xl font-black text-slate-900 leading-none">{String(stats.completedTasks).padStart(2, "0")}</span>');
    code = code.replace(/<span className="text-5xl font-black text-slate-900 leading-none">03<\/span>/, '<span className="text-5xl font-black text-slate-900 leading-none">{String(stats.activeProjects).padStart(2, "0")}</span>');
    code = code.replace(/<span className="text-5xl font-black text-white leading-none drop-shadow-sm">02<\/span>/, '<span className="text-5xl font-black text-white leading-none drop-shadow-sm">{String(stats.overdueTasks).padStart(2, "0")}</span>');
  }

  if (p.type === 'projects') {
    code = code.replace(
      /<article className="bg-\[var\(--color-card\)\] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1">/,
      '<article onClick={() => onOpen(project.id_project)} className="bg-[var(--color-card)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer">'
    );
    const regexBtn = /[\s]*<button\s+onClick=\{\(\) => onOpen\(project\.id_project\)\}\s+className="text-\[var\(--color-primary\)\] font-medium flex items-center gap-1 hover:underline text-sm"\s*>\s*Kelola Board\s*<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">\s*<path d="M13\.5 4\.5L21 12m0 0l-7\.5 7\.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" \/>\s*<\/svg>\s*<\/button>/g;
    code = code.replace(regexBtn, '');
  }

  if (p.type === 'board') {
    code = code.replace(
      /const \[inviteEmail,\s*setInviteEmail\]\s*=\s*useState\(''\);/,
      "const [inviteEmail,   setInviteEmail]   = useState('');\n  const [inviteRole,    setInviteRole]    = useState('member');"
    );
    code = code.replace(
      /const res = await fetch\(`\/api\/members`, \{[\s\S]*?body: JSON.stringify\(\{ email: inviteEmail, id_project: Number\(projectId\) \}\),/m,
      `const res = await fetch(\`/api/invitations\`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId), role: inviteRole }),`
    );
    code = code.replace(
      /<button\s*type="submit"\s*disabled=\{inviteLoading\}/,
      `<select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    <option value="member">Anggota</option>
                    <option value="viewer">Penonton</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteLoading}`
    );
    // Note: I also need to make sure Drag and drop css fixes in Board.jsx are applied since I reverted Board.jsx.
    // The DND fix: Remove `scale-105` and padding transition from `Droppable` and `Draggable`.
    code = code.replace(
      /className={`border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer \$\{/,
      'className={`border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${'
    );
    code = code.replace(
      /snapshot\.isDragging \? 'opacity-90 scale-105 z-50 shadow-xl' : ''/,
      "snapshot.isDragging ? 'opacity-90 z-50 shadow-xl' : ''"
    );
    code = code.replace(
      /className={`bg-white rounded-2xl shadow-sm border flex-1 min-h-\[500px\] transition-all \$\{/,
      'className={`bg-white rounded-2xl shadow-sm border flex-1 min-h-[500px] ${'
    );
    code = code.replace(
      /snapshot\.isDraggingOver \? 'border-\[var\(--color-primary\)\] bg-teal-50\/30 p-2 -mx-2' : 'border-slate-100'/,
      "snapshot.isDraggingOver ? 'border-[var(--color-primary)] bg-teal-50/30' : 'border-slate-100'"
    );
  }

  fs.writeFileSync(p.path, code, 'utf8');
  console.log(`Re-patched ${p.local}`);
});
