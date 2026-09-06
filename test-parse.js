const fs = require('fs');
const html = fs.readFileSync('app.html', 'utf8');

const startIndex = html.indexOf('const surahs = [');
const endIndex = html.indexOf('];\n', startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find array");
  process.exit(1);
}

const arrayStr = html.substring(startIndex + 'const surahs = '.length, endIndex + 1);

try {
  JSON.parse(arrayStr);
  console.log("Valid JSON");
} catch (e) {
  console.error(e);
}
