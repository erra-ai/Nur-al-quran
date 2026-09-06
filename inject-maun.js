const fs = require('fs');
const maun = require('./build-maun.js');

let html = fs.readFileSync('app.html', 'utf8');

// Find the boundaries of the surahs array
const startIndex = html.indexOf('const surahs = [');
const endIndexStr = '];\n';
let endIndex = -1;
for (let i = html.length - 1; i >= 0; i--) {
  if (html.substring(i, i+2) === '];') {
    endIndex = i;
    break;
  }
}

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find surahs array boundaries");
  process.exit(1);
}

const prefix = html.substring(0, startIndex + 'const surahs = '.length);
const arrayStr = html.substring(startIndex + 'const surahs = '.length, endIndex + 1);
const suffix = html.substring(endIndex + 1);

try {
  const surahs = JSON.parse(arrayStr);
  const maunIndex = surahs.findIndex(s => s.id === 'maun');
  if (maunIndex === -1) {
    console.error("maun not found in array");
    process.exit(1);
  }
  surahs[maunIndex] = maun;
  
  const newArrayStr = JSON.stringify(surahs, null, 2);
  fs.writeFileSync('app.html', prefix + newArrayStr + suffix);
  console.log("Successfully injected maun using proper JSON parsing!");
} catch(e) {
  console.error("Error parsing or stringifying array:", e);
  process.exit(1);
}
