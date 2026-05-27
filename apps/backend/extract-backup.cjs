const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\gatfa\\.gemini\\antigravity\\brain\\caa9c3b4-71be-40aa-8633-71f00fb54aef\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let bestContent = null;
  let lastTimestamp = null;

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      if (step.tool_calls) {
        for (const call of step.tool_calls) {
          // If this was a full write of Board.jsx
          if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('Board.jsx')) {
            bestContent = call.args.CodeContent;
            lastTimestamp = step.created_at;
          }
          // Note: if there were replace_file_content calls AFTER the last write_to_file, we might miss them, but getting a recent version is a good start.
        }
      }
    } catch (e) {}
  }
  
  if (bestContent) {
    fs.writeFileSync('d:\\Kuliah\\Project\\KanbanFlow\\apps\\backend\\Board_backup.jsx', bestContent, 'utf8');
    console.log('Successfully extracted Board_backup.jsx from ' + lastTimestamp);
  } else {
    console.log('No full write_to_file found for Board.jsx');
  }
}

processLineByLine();
