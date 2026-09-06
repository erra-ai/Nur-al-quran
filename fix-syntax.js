const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const targetStr = `    }
  }
  },
  {
  "id": "kawthar",`;

const replaceStr = `    }
  },
  {
  "id": "kawthar",`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, replaceStr);
  fs.writeFileSync('app.html', html);
  console.log("Syntax error fixed");
} else {
  console.log("Target string not found in app.html");
}
