// Read-only checks of application source and generated audit bundles.
// Writes only an audit evidence JSON document next to this script.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
const baseline = read('audit-evidence.json');
const sourceChanges = baseline.sourceInventory.filter(item => {
  const current = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, item.file))).digest('hex');
  return current !== item.sha256;
}).map(item => item.file);
const bundles = ['android', 'ios'].map(platform => {
  const output = path.join(root, '.expo', 'audit-' + platform);
  const metadata = JSON.parse(fs.readFileSync(path.join(output, 'metadata.json'), 'utf8'));
  const bundle = metadata.fileMetadata[platform];
  const bytes = fs.statSync(path.join(output, bundle.bundle)).size;
  return { platform, exportStatus: 'PASS', bytecode: false, bundle: bundle.bundle, bytes, assets: bundle.assets.length, nativeBinaryBuilt: false };
});
const layout = read('browser-layout-evidence.json');
const suites = read('continued-suite-results.json');
const report = {
  date: '2026-11-21',
  checkedAt: new Date().toISOString(),
  sourcePreservation: { files: baseline.sourceInventory.length, unchanged: sourceChanges.length === 0, changes: sourceChanges },
  bundles,
  suites: suites.checks.map(item => ({ name: item.name, exitCode: item.exit_code })),
  layout: {
    platform: layout.platform,
    cases: layout.cases.length,
    casesWithOverflow: layout.cases.filter(item => item.overflow.length > 0).length,
    screens: [...new Set(layout.cases.map(item => item.name))],
    widths: [...new Set(layout.cases.map(item => item.width))],
    fontScales: [...new Set(layout.cases.map(item => item.fontScale))],
    interpretation: 'Rendering and geometry only; mocked hooks, no hydration or native QA.'
  },
  native: {
    userWorkflow: 'Expo Go; no MyLife APK/development build yet',
    cachedHost: 'Expo-Go-58.0.5.apk',
    hostInstalledForAudit: false,
    attempted: 'New isolated MyLifeAudit AVD; existing system image API36; no user data copied',
    status: 'BLOCKED before Android boot',
    blocker: 'WHPX Failed to setup partition hr=80070005; failed to initialize WHPX',
    additionalSetupError: 'GPU mode software unsupported by installed emulator; swiftshader_indirect is advertised',
    deviceConnected: false,
    applicationTested: false,
    logs: '.expo/audit-native/emulator-out.log and emulator-err.log (ignored, local only)'
  }
};
fs.writeFileSync(path.join(__dirname, 'continuation-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (sourceChanges.length) process.exitCode = 1;
