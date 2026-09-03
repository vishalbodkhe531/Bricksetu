const fs = require('fs');
const text = fs.readFileSync('tmp/tsc_errors.txt', 'utf16le');
const chunks = text.split(/\r?\n/);
for (const chunk of chunks) {
  if (chunk.trim()) {
    console.log(chunk.substring(0, 120));
  }
}
