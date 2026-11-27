const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { loader } = require('./check-backup.cjs');
let checks = 0;
const oldZone = process.env.TZ;
try {
  for (const zone of ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']) {
    process.env.TZ = zone;
    const { getTodayPrayerTimes: read } = loader()('src/features/prayer-times/data/services/prayer-times.service.ts');
    const base = read(new Date('2026-11-22T12:00:00'));
    const [fajr, dhuhr, asr, , isha] = base.prayers;
    const afterFajr = read(new Date(fajr.time.getTime() + 60_000));
    assert.equal(afterFajr.nextPrayer.key, 'dhuhr'); assert.equal(afterFajr.currentPrayer.key, 'fajr');
    assert.equal(afterFajr.nextPrayer.time.getDate(), fajr.time.getDate()); checks++;
    assert.equal(read(new Date(dhuhr.time)).nextPrayer.key, 'asr');
    assert.equal(read(new Date(dhuhr.time)).currentPrayer.key, 'dhuhr'); checks++;
    assert.equal(read(new Date(fajr.time.getTime() - 60_000)).nextPrayer.key, 'fajr'); checks++;
    const late = read(new Date(isha.time.getTime() + 60_000));
    assert.equal(late.nextPrayer.key, 'fajr'); assert.ok(late.nextPrayer.time > isha.time); checks++;
    assert.equal(read(new Date(asr.time.getTime() - 60_000)).nextPrayer.key, 'asr'); checks++;
  }
} finally { if (oldZone === undefined) delete process.env.TZ; else process.env.TZ = oldZone; }

function visitFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { visitFiles(file); continue; }
    if (!file.endsWith('.tsx')) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(source) === 'TextInput') {
        const label = node.attributes.properties.find(attr => attr.name?.getText(source) === 'accessibilityLabel');
        assert.ok(label?.initializer && ((ts.isStringLiteral(label.initializer) && label.initializer.text.trim()) || (ts.isJsxExpression(label.initializer) && label.initializer.expression)), 'Missing persistent input name: ' + file);
        checks++;
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
visitFiles(path.resolve(__dirname, '../src'));
const fingerprintPath = require.resolve('@expo/fingerprint');
const { createRequire } = require('node:module');
const fingerprintRequire = createRequire(fingerprintPath);
assert.ok(fingerprintRequire('minimatch').minimatch('src/app/index.tsx', '**/*.tsx')); checks++;
const matching = require(path.join(path.dirname(fingerprintPath), 'utils/Path.js'));
const patterns = matching.buildPathMatchObjects(['**/node_modules/**', '**/*.tmp', '!keep.tmp']);
assert.equal(matching.isIgnoredPathWithMatchObjects('node_modules/pkg/index.js', patterns), true);
assert.equal(matching.isIgnoredPathWithMatchObjects('src/app/index.tsx', patterns), false);
assert.equal(matching.isIgnoredPathWithMatchObjects('data.tmp', patterns), true);
assert.equal(matching.isIgnoredPathWithMatchObjects('keep.tmp', patterns), false); checks++;
const dirs = matching.buildDirMatchObjects(matching.buildPathMatchObjects(['**/node_modules/**', 'build/**/*', '!build/keep.js']));
assert.equal(matching.isIgnoredPathWithMatchObjects('node_modules', dirs), true); checks++;
console.log(`PASS: ${checks} prayer/input accessibility/fingerprint compatibility checks; no user database accessed.`);
