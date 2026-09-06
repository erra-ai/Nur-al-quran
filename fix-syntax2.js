const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const targetStr = `      ]
    }
  }
  },
  {
  "id": "kawthar",`;

const replaceStr = `      ]
    }
  },
  {
  "id": "kawthar",`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, replaceStr);
  fs.writeFileSync('app.html', html);
  console.log("Syntax error fixed via exact string match.");
} else {
  // try regex
  const regex = /      \]\r?\n    \}\r?\n  \}\r?\n  \},\r?\n  \{\r?\n  "id": "kawthar",/;
  if (regex.test(html)) {
      html = html.replace(regex, `      ]
    }
  },
  {
  "id": "kawthar",`);
      fs.writeFileSync('app.html', html);
      console.log("Syntax error fixed via regex match.");
  } else {
      console.log("Target string STILL not found in app.html");
  }
}
