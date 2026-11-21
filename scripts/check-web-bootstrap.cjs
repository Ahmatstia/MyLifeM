const assert = require('node:assert/strict');
const { loader } = require('./check-backup.cjs');
async function main() {
  const before = process.env.EXPO_OS; process.env.EXPO_OS = 'web';
  try {
    let resolve, asyncOpens = 0, syncOpens = 0; const queries = [];
    const database = { execSync: sql => queries.push(sql) };
    const connection = loader({ 'expo-sqlite': {
      openDatabaseAsync: () => { asyncOpens++; return new Promise(done => { resolve = done; }); },
      openDatabaseSync: () => { syncOpens++; throw new Error('Worker not ready'); },
    } })('src/db/connection.ts');
    const a = connection.prepareSqliteDb(), b = connection.prepareSqliteDb();
    assert.equal(asyncOpens, 1); assert.equal(syncOpens, 0); assert.equal(queries.length, 0);
    resolve(database); await Promise.all([a, b]); assert.ok(queries.includes('PRAGMA foreign_keys = ON;'));
    assert.equal(connection.getSqliteDb(), database); assert.equal(syncOpens, 0);
    let attempts = 0;
    const retry = loader({ 'expo-sqlite': { openDatabaseAsync: async () => { if (++attempts === 1) throw new Error('Worker failed'); return database; } } })('src/db/connection.ts');
    await assert.rejects(retry.prepareSqliteDb(), /Worker failed/); await retry.prepareSqliteDb(); assert.equal(attempts, 2);
  } finally { if (before === undefined) delete process.env.EXPO_OS; else process.env.EXPO_OS = before; }
  const routes = []; let hasHistory = false;
  const back = loader({ 'expo-router': { router: { canGoBack: () => hasHistory, back: () => routes.push('back'), replace: route => routes.push(route) } } })('src/shared/utils/back-or-home.ts').backOrHome;
  back(); hasHistory = true; back(); assert.deepEqual(routes, ['/(tabs)', 'back']);
  const config = require('../metro.config'); let handled = 0; const headers = {};
  config.server.enhanceMiddleware(() => { handled++; })({}, { setHeader: (key, value) => { headers[key] = value; } }, () => {});
  assert.equal(headers['Cross-Origin-Opener-Policy'], 'same-origin'); assert.equal(headers['Cross-Origin-Embedder-Policy'], 'credentialless'); assert.equal(handled, 1);
  console.log('PASS: web worker awaited/shared, failed initialization retry, foreign keys and Metro isolation headers; mocked worker only.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
