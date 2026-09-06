const fs = require('fs');
const maun = require('./build-maun.js');

let html = fs.readFileSync('app.html', 'utf8');

const maunIdRegex = /\{\s*"id":\s*"maun",/;
const kawtharIdRegex = /\{\s*"id":\s*"kawthar",/;

const matchMaun = html.match(maunIdRegex);
if (!matchMaun) {
  console.error("Could not find maun");
  process.exit(1);
}
const startIndex = matchMaun.index;

const matchKawthar = html.match(kawtharIdRegex);
if (!matchKawthar) {
  console.error("Could not find kawthar");
  process.exit(1);
}
const endIndex = matchKawthar.index;

const before = html.substring(0, startIndex);
const endOfMaun = html.lastIndexOf('  },', endIndex);
if (endOfMaun === -1) {
    console.error("Could not find end of maun object");
    process.exit(1);
}
const after = html.substring(endOfMaun + 4);

const newMaun = JSON.stringify(maun, null, 2).replace(/\n/g, '\n  ') + '\n  },';

const finalHtml = before + newMaun + after;
fs.writeFileSync('app.html', finalHtml);
console.log('Replaced successfully');
