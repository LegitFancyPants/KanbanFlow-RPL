const fs = require('fs');

// 1. Fix the route file
let routeFile = 'src/app/api/invitations/[id]/route.js';
let routeCode = fs.readFileSync(routeFile, 'utf8');
routeCode = routeCode.replace(/message: `Undangan \$\{action === 'accept' \? 'diterima' : 'ditolak'\}`/, 'message: `Undangan ${action === "accept" ? "diterima" : "ditolak"}`');
fs.writeFileSync(routeFile, routeCode, 'utf8');

// 2. Fix the component import
const pages = ['src/frontend/pages/Board.jsx', 'src/frontend/pages/Projects.jsx', 'src/frontend/pages/Dashboard.jsx'];
pages.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/@\/backend\/src\/frontend\/components\/NotificationBell/g, '@/frontend/components/NotificationBell');
  
  // Fix the div syntax error.
  // The syntax error is: Expected '</', got 'jsx text'
  // I replaced: `          )}\n        </div>\n      </nav>`
  // With: `          )}\n        </div>\n        </div>\n      </nav>`
  // But wait! If I injected `<div className="flex items-center gap-2">` right before `<NotificationBell />`, it means I needed one more `</div>`.
  // Why did it break? Let's check Board.jsx error:
  //   545 |           )}
  //   546 |         </div>
  // > 547 |         </div>
  //       |               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // > 548 |       </nav>
  // Wait, there's trailing whitespace or something? "Expected '</', got 'jsx text'". Maybe there is text between `</div>` and `</nav>`?
  // Let me just look at Board.jsx in that area exactly.
  
  fs.writeFileSync(file, code, 'utf8');
});
console.log('Fixed imports and route.');
