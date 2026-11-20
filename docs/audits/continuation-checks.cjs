// Additional audit cases; only SQLite :memory: and controlled React hooks.
require('./native-boundary-stub.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {environment}=require(path.join(root,'scripts/check-integrity.cjs'));
const {loader}=require(path.join(root,'scripts/check-backup.cjs'));
const results=[];
function hooks(stubs){
 const state=[];let index=0;
 const React={useState(initial){const i=index++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useRef(initial){const i=index++;return state[i]??={current:initial};},useCallback:fn=>fn,useMemo:fn=>fn(),useEffect:()=>{}};
 const load=loader({react:React,'expo-router':{useFocusEffect:()=>{},router:{replace:()=>{}}},...stubs});
 return {load,render(fn){index=0;return fn();}};
}
async function main(){
 let e=environment();
 try{
  await e.client.initDatabase();
  const repo=e.load('src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts').weeklyScheduleRepository;
  const h=hooks({'../../data/repositories/weekly-schedule.repository.impl':{weeklyScheduleRepository:repo}});
  const useWeekly=h.load('src/features/agenda/presentation/hooks/use-weekly-schedules.ts').useWeeklySchedules;
  const model=h.render(useWeekly);let inserts=0;
  e.fault(sql=>{if(/^insert into "weekly_schedules"/i.test(sql)&&++inserts===2)throw new Error('AUDIT simulated disk full on second day');});
  const input={title:'Audit multi-day',startTime:'08:00',endTime:'09:00',scheduleType:'WORK'};
  const first=await model.addSchedulesForDays([1,2],input);
  e.fault(()=>{});
  const afterFailure=e.raw.getFirstSync('SELECT count(*) n FROM weekly_schedules').n;
  const retry=await h.render(useWeekly).addSchedulesForDays([1,2],input);
  const afterRetry=e.raw.getFirstSync('SELECT count(*) n FROM weekly_schedules').n;
  assert.equal(first,false);assert.equal(afterFailure,1);assert.equal(retry,true);assert.equal(afterRetry,3);
  results.push({id:'C01-weekly-partial-save',verified:true,firstReportedSuccess:first,rowsAfterFailure:afterFailure,retryReportedSuccess:retry,rowsAfterRetry:afterRetry,expectedRows:2});
 }finally{e.close();}
 {
  const original={pomodoroMinutes:25,deepFlowMinutes:50,hapticsEnabled:true,keepAwakeEnabled:true,prayerCity:'Jakarta',prayerLatitude:-6.2,prayerLongitude:106.8};
  const h=hooks({'../../data/repositories/settings.repository.impl':{settingsRepository:{saveSettings:async()=>{throw new Error('AUDIT disk full');},getSettings:async()=>original,getDatabaseStats:async()=>({})}},'../../data/services/backup-file.service':{},'@/db/data-revision':{},'@/features/agenda/data/services/agenda-notification.service':{},'@/features/prayer-times/data/prayer-location-store':{setPrayerLocation:()=>{}}});
  const useSettings=h.load('src/features/settings/presentation/hooks/use-settings.ts').useSettings;
  const returned=await h.render(useSettings).updateSetting({pomodoroMinutes:60});
  await Promise.resolve();await Promise.resolve();
  const after=h.render(useSettings);
  assert.equal(returned,undefined);assert.equal(after.settings.pomodoroMinutes,25);
  assert.equal(after.error,undefined);assert.equal(after.backupError,null);
  results.push({id:'C02-setting-error-hidden',verified:true,promiseResolvesWithoutFailureSignal:true,persistedValue:25,errorFieldAvailable:false,backupError:after.backupError});
 }
 e=environment();
 try{
  await e.client.initDatabase();
  const repo=e.load('src/features/categories/data/repositories/category.repository.impl.ts').categoryRepository;
  await Promise.all([repo.create({name:'AuditCaseRace'}),repo.create({name:'AUDITCASERACE'})]);
  const rows=e.raw.getAllSync("SELECT name FROM categories WHERE lower(name)=lower('AuditCaseRace')");
  assert.equal(rows.length,2);
  let backupError;try{e.format.parseBackup(e.format.serializeBackup(e.store.readBackupData(e.raw)));}catch(error){backupError=error.message;}
  assert.match(backupError,/duplikat/);
  results.push({id:'C03-category-case-race',verified:true,names:rows.map(r=>r.name),backupError});
 }finally{e.close();}
 e=environment();
 try{
  await e.client.initDatabase();
  const now=new Date().toISOString();
  for(const type of ['NUMERIC','MAINTENANCE'])e.raw.runSync('INSERT INTO targets (id,title,type,target_value,current_value,unit,start_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',type,type,type,100,75,'unit',now,now,now);
  const repo=e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository;
  const mapped=await repo.getTargets();
  const backup=e.format.parseBackup(e.format.serializeBackup(e.store.readBackupData(e.raw)));
  assert.equal(backup.data.targets.length,2);assert.ok(backup.data.targets.every(t=>t.currentValue===75&&t.targetValue===100));
  results.push({id:'C04-legacy-target-preservation',verified:true,backupPreservesValues:true,uiEntity:mapped.map(t=>({id:t.id,progressPercent:t.progressPercent,exposesType:Object.hasOwn(t,'type'),exposesNumericValue:Object.hasOwn(t,'currentValue')})),note:'Preservation proven; numeric/maintenance UI remains unavailable rather than claiming a working metric editor.'});
 }finally{e.close();}
 fs.writeFileSync(path.join(__dirname,'continuation-evidence.json'),JSON.stringify({date:'2026-11-21',isolation:'SQLite memory / mock hooks',results},null,2));
 console.log(JSON.stringify(results,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
