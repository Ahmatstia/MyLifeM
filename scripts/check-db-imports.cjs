/* global __dirname */
// Detect runtime import cycles reachable from the public database entry point, before Metro does.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const visited = new Set();
function visit(filename, stack = []) {
  assert.ok(!stack.includes(filename), 'Runtime require cycle: ' + [...stack, filename].map(file => path.relative(root, file)).join(' -> '));
  if (visited.has(filename)) return;
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const node of source.statements) {
    if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || node.isTypeOnly || node.importClause?.isTypeOnly || !node.moduleSpecifier) continue;
    const specifier = node.moduleSpecifier.text;
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) continue;
    const base = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
    const dependency = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(file => fs.existsSync(file));
    assert.ok(dependency, 'Unresolved local module: ' + specifier);
    visit(dependency, [...stack, filename]);
  }
  visited.add(filename);
}
visit(path.join(root, 'src/db/client.ts'));
console.log(`PASS: ${visited.size} database dependency modules have no static runtime import cycles.`);
