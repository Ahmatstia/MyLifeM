const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) res.push(p);
  }
  return res;
}

const files = walk('src');
const iconUsage = {};
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').filter(l => l.includes('lucide-react-native') || l.includes('@expo/vector-icons'));
  if (lines.length) {
    iconUsage[f] = lines.map(l => l.trim());
  }
}
console.log(JSON.stringify(iconUsage, null, 2));

