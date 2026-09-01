const fs = require('fs');
const content = fs.readFileSync('tmp/tsc_errors.txt', 'utf16le');
content.split(/\r?\n/).forEach((l) => {
  if (l.includes('error TS')) {
    console.log(l);
  }
});
