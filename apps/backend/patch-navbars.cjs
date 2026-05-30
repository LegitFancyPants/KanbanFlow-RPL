const fs = require('fs');

const files = [
  'src/frontend/pages/Dashboard.jsx',
  'src/frontend/pages/Projects.jsx',
  'src/frontend/pages/Board.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('NotificationBell')) {
    code = code.replace(/import \{ useRouter \} from "next\/navigation";/, 'import { useRouter } from "next/navigation";\nimport NotificationBell from "@/backend/src/frontend/components/NotificationBell";');
  }

  // Wrap the NotificationBell and the User Profile into a flex container
  // Replace:
  /*
        {/* User Profile *\/}
        <div className="relative">
  */
  // With:
  /*
        {/* User Profile & Notifications *\/}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="relative">
  */
  
  code = code.replace(
    /\{\/\*\s*User Profile\s*\*\/\}\s*<div className="relative">/g,
    '{/* User Profile & Notifications */}\n        <div className="flex items-center gap-2">\n          <NotificationBell />\n          <div className="relative">'
  );

  // But we must also close the newly added `div className="flex items-center gap-2"`!
  // It should be closed right after the User Profile block.
  // The block ends with:
  /*
          )}
        </div>
      </nav>
  */
  // Wait, in `Board.jsx` it might be:
  /*
          )}
        </div>
      </header>
  */
  // Let's replace:
  /*
          )}
        </div>
      </nav>
  */
  // With:
  /*
          )}
        </div>
        </div>
      </nav>
  */
  // I will just use a safer replacement.
  code = code.replace(
    /          \)\}\n        <\/div>\n      <\/nav>/g,
    '          )}\n        </div>\n        </div>\n      </nav>'
  );
  code = code.replace(
    /          \)\}\n        <\/div>\n      <\/header>/g,
    '          )}\n        </div>\n        </div>\n      </header>'
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log(`Patched ${file}`);
});
