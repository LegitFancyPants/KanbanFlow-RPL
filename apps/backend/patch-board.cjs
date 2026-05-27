const fs = require('fs');

let code = fs.readFileSync('src/frontend/pages/Board.jsx', 'utf8');

// Add inviteRole state
code = code.replace(
  /const \[inviteEmail,\s*setInviteEmail\]\s*=\s*useState\(''\);/,
  "const [inviteEmail,   setInviteEmail]   = useState('');\n  const [inviteRole,    setInviteRole]    = useState('member');"
);

// Update API call
// Replace `/api/members` with `/api/invitations`
// Replace `body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId) })`
// with `body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId), role: inviteRole })`
code = code.replace(
  /const res = await fetch\(`\$\{API\}\/api\/members`, \{[\s\S]*?body: JSON.stringify\(\{ email: inviteEmail, id_project: Number\(projectId\) \}\),/m,
  `const res = await fetch(\`\${API}/api/invitations\`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId), role: inviteRole }),`
);

// Add select dropdown before the button
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

fs.writeFileSync('src/frontend/pages/Board.jsx', code, 'utf8');
console.log('Board.jsx patched for invitations API');
