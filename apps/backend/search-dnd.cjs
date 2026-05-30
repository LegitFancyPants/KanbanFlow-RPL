const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\gatfa\\.gemini\\antigravity\\brain\\caa9c3b4-71be-40aa-8633-71f00fb54aef\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('@hello-pangea/dnd') || line.includes('react-beautiful-dnd') || line.includes('DragDropContext')) {
      console.log('Found reference in step!');
      try {
        const step = JSON.parse(line);
        if (step.tool_calls) {
          for (const call of step.tool_calls) {
            if (call.name === 'replace_file_content' || call.name === 'write_to_file' || call.name === 'multi_replace_file_content') {
              fs.appendFileSync('d:\\Kuliah\\Project\\KanbanFlow\\apps\\backend\\dnd-log.txt', JSON.stringify(call.args, null, 2) + '\n---\n');
            }
          }
        }
      } catch (e) {}
    }
  }
}

processLineByLine();
