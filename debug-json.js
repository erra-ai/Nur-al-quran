const fs = require('fs');

const html = fs.readFileSync('app.html', 'utf8');
const startIndex = html.indexOf('const surahs = [');

let endIndex = -1;
for (let i = html.length - 1; i >= 0; i--) {
  if (html.substring(i, i+2) === '];') {
    endIndex = i;
    break;
  }
}

const arrayStr = html.substring(startIndex + 'const surahs = '.length, endIndex + 1);

try {
  JSON.parse(arrayStr);
  console.log("JSON is valid");
} catch(e) {
  console.error("Syntax Error at:", e.message);
  
  // Try to find the exact line
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = arrayStr.substring(0, pos).split('\n');
    console.error("Error is around line", lines.length);
    console.error("Line content:", lines[lines.length-1]);
    
    // print some lines around it
    const allLines = arrayStr.split('\n');
    for(let i=Math.max(0, lines.length-5); i < Math.min(allLines.length, lines.length+5); i++) {
        console.error(`${i+1}: ${allLines[i]}`);
    }
  }
}
