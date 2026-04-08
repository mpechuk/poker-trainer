const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'poker-trainer.html'), 'utf8');
let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    failures++;
  }
}

console.log('Favicon tests:');
assert(/<link[^>]+rel=["']icon["']/.test(html), 'Has <link rel="icon"> tag');
assert(/<link[^>]+type=["']image\/svg\+xml["']/.test(html), 'Favicon type is image/svg+xml');
assert(/<link[^>]+href=["']data:image\/svg\+xml,/.test(html), 'Favicon uses inline SVG data URI');
assert(/M50 5L90 50L50 95L10 50Z/.test(html), 'SVG contains diamond shape path');
assert(/%23c0392b|#c0392b/.test(html), 'SVG uses red suit color');

console.log(`\n${failures === 0 ? 'All tests passed.' : `${failures} test(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
