const fs = require('fs');

const files = [
  'src/frontend/pages/Dashboard.jsx',
  'src/frontend/pages/Projects.jsx',
  'src/frontend/pages/Board.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Undo previous messed up closing tags first if any!
  code = code.replace(/<\/div>\s*<\/div>\s*<\/nav>/g, '</div>\n      </nav>');
  code = code.replace(/<\/div>\s*<\/div>\s*<\/header>/g, '</div>\n      </header>');

  // Check if we need to add the NotificationBell import
  if (!code.includes('NotificationBell')) {
    code = code.replace(/import \{ useRouter \} from "next\/navigation";/, 'import { useRouter } from "next/navigation";\nimport NotificationBell from "@/frontend/components/NotificationBell";');
  }

  // Find the exact injection point. We inject `<NotificationBell />` right before the `div` containing `getInitials(username)`
  // Wait, the dropdown `onClick` is usually right after `<div className="relative">`
  
  // Let's use a VERY specific regex that matches exactly what we need for all 3:
  // `{/* User Profile */}` followed by `<div className="relative">`
  if (!code.includes('<NotificationBell />')) {
    code = code.replace(
      /<div className="relative">\s*<div\s*className="flex items-center/g,
      '<div className="flex items-center gap-2"><NotificationBell /><div className="relative">\n          <div className="flex items-center'
    );
    // Since we added an OPENING `<div className="flex items-center gap-2">`, we MUST add a closing `</div>`.
    // We add it exactly before `</nav>` or `</header>`.
    code = code.replace(
      /(\s*)<\/nav>/,
      '$1  </div>\n$1</nav>'
    );
    code = code.replace(
      /(\s*)<\/header>/,
      '$1  </div>\n$1</header>'
    );
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed', file);
});
