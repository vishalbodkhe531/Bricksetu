const fs = require('fs');
const content = fs.readFileSync('tmp/tsc_errors.txt', 'utf16le');
const lines = content.split('\n');
console.log(`Total errors: ${lines.length}`);
lines.forEach((line, index) => {
  if (line.trim()) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
