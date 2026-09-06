const fs = require('fs');
const maun = require('./build-maun.js');

let html = fs.readFileSync('app.html', 'utf8');

const regex = /\{\s*"id":\s*"maun",[\s\S]*?\},\s*\{\s*"id":\s*"kawthar",/;

if (regex.test(html)) {
  const replacement = JSON.stringify(maun, null, 2).replace(/\n/g, '\n  ') + ',\n  {\n  "id": "kawthar",';
  
  // Wait, JSON.stringify starts with { and ends with }. 
  // If we replace \n with \n  , the whole object is indented.
  // The first { is NOT indented by stringify (it has no \n before it). 
  // Let's prepend it with two spaces.
  const indented = '  ' + JSON.stringify(maun, null, 2).replace(/\n/g, '\n  ');
  
  html = html.replace(regex, indented + ',\n  {\n  "id": "kawthar",');
  fs.writeFileSync('app.html', html);
  console.log("Successfully injected using regex!");
} else {
  console.log("Regex didn't match!");
}
