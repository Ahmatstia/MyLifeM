// Audit renderer: actual screen components, fixture hooks, no application database.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const requireFromProject = require('node:module').createRequire(path.join(root, 'package.json'));
const React = requireFromProject('react');
const { renderToStaticMarkup } = requireFromProject('react-dom/server');
const original = fs.readFileSync(path.join(root, 'scripts/check-ui.cjs'), 'utf8');
// Reuse the existing audit fixture loader; stop before its assertions/side effects.
const prefix = original.slice(0, original.indexOf('const load = createLoader();'));
const toolkit = new Function('require', 'module', 'exports', '__dirname', prefix + '\nreturn { createLoader, native, target, project, task, categories, base, setViewport(w,s){width=w;fontScale=s;} };')(
  requireFromProject, { exports: {} }, {}, path.join(root, 'scripts'));
const output = path.join(root, '.expo/audit-all-ui');
fs.mkdirSync(path.join(output, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
let fonts = '';
for (const [pkg, weights] of [['quicksand',['500Medium','600SemiBold']],['fredoka',['600SemiBold','700Bold']],['plus-jakarta-sans',['400Regular','500Medium','600SemiBold','700Bold']]]) {
  for (const weight of weights) {
    const base = path.join(root, 'node_modules/@expo-google-fonts', pkg, weight);
    const file = fs.readdirSync(base).find(file => file.endsWith('.ttf'));
    fs.copyFileSync(path.join(base, file), path.join(output, 'fonts', file));
    fonts += '@font-face{font-family:' + file.slice(0,-4) + ';src:url(fonts/' + file + ')}';
  }
}
for (const file of fs.readdirSync(path.join(root, 'assets/images/mascot'))) fs.copyFileSync(path.join(root,'assets/images/mascot',file),path.join(output,'assets',file));
const specs = [
 ['today','today-focus/presentation/screens/today-focus-screen.tsx','TodayFocusScreen'],
 ['targets','targets/presentation/screens/target-list-screen.tsx','TargetListScreen'],
 ['projects','projects/presentation/screens/project-list-screen.tsx','ProjectListScreen'],
 ['agenda','agenda/presentation/screens/agenda-screen.tsx','AgendaScreen'],
 ['target-detail','targets/presentation/screens/target-detail-screen.tsx','TargetDetailScreen',{targetId:'target'}],
 ['project-detail','projects/presentation/screens/project-detail-screen.tsx','ProjectDetailScreen',{projectId:'project'}],
 ['settings','settings/presentation/screens/settings-screen.tsx','SettingsScreen'],
 ['create-target','targets/presentation/screens/create-target-screen.tsx','CreateTargetScreen'],
 ['create-project','projects/presentation/screens/create-project-screen.tsx','CreateProjectScreen'],
 ['create-priority','today-focus/presentation/screens/create-priority-screen.tsx','CreatePriorityScreen'],
 ['create-agenda','agenda/presentation/screens/create-agenda-screen.tsx','CreateAgendaScreen'],
 ['task-manager','task-manager/presentation/screens/task-manager-screen.tsx','TaskManagerScreen'],
 ['create-managed-task','task-manager/presentation/screens/create-managed-task-screen.tsx','CreateManagedTaskScreen'],
 ['quick-add','quick-add/presentation/screens/quick-add-screen.tsx','QuickAddScreen'],
];
const noop = () => {};
const tracks = [{id:'builtin-siren-energize',name:'Alarm bawaan',uri:'builtin://siren-energize',isBuiltIn:true}];
const managed = {id:'mtask-fixture',title:'Selesaikan laporan praktikum dan tinjau hasil',courseOrContext:'Pemrograman',categoryType:'COLLEGE',notes:'Catatan fixture audit',priority:'HIGH',estimatedMinutes:60,executionDate:'2026-11-21',executionTime:'19:00',deadlineDate:'2026-11-23',deadlineTime:'23:59',alertMode:'ALARM',alarmTrackId:tracks[0].id,alarmTrackName:tracks[0].name,alarmTrackUri:tracks[0].uri,snoozeMinutes:10,autoAddToToday:true,subtasks:[{id:'sub1',title:'Tinjau data',isCompleted:false}],isCompleted:false,completedAt:null};
const overrides = {
  'lucide-react-native': requireFromProject('lucide-react-native'),
  'expo-image': { Image: props => React.createElement(toolkit.native.Image, {...props, source: typeof props.source==='string' ? {uri:'assets/'+path.basename(props.source)} : props.source}) },
  '@/features/categories/data/repositories/category.repository.impl': { categoryRepository: {getAll:async()=>toolkit.categories} },
  '@/features/projects/data/repositories/project.repository.impl': { projectRepository: {createProject:noop} },
  '@/features/task-manager/presentation/hooks/use-managed-tasks': {useManagedTasks:()=>({tasks:[managed],alarmTracks:tracks,isLoading:false,error:null,todayDate:'2026-11-21',previewingTrackId:null,refresh:noop,addTask:noop,toggleTask:noop,toggleSubtask:noop,deleteTask:noop,pickAndSaveCustomSong:noop,togglePreviewTrack:noop,stopPreview:noop,simulateAlarm:noop})},
  '@/features/task-manager/data/repositories/managed-task.repository': {managedTaskRepository:{},subscribeRingingAlarm:()=>noop},
};
const manifest = [];
for (const scale of [1,2]) {
  toolkit.setViewport(360,scale);
  const load = toolkit.createLoader(overrides);
  for (const width of [320,360,412,768]) {
    toolkit.setViewport(width,scale);
    for (const [name,file,exported,props={}] of specs) {
      const Component = load('src/features/'+file)[exported];
      const markup = renderToStaticMarkup(React.createElement(Component,props));
      const css = toolkit.native.StyleSheet.getSheet().textContent;
      const filename = `${name}-${width}-${scale}x.html`;
      const html = '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Audit fixture: '+name+'</title><style>'+fonts+css+'body{margin:0}.phone{position:relative;width:'+width+'px;height:844px;display:flex;overflow:auto;background:#FAF6EC}</style><body><main class="phone">'+markup+'</main></body></html>';
      fs.writeFileSync(path.join(output,filename),html);
      manifest.push({name,width,fontScale:scale,file:filename,source:'src/features/'+file,mode:'SSR fixture; hooks mocked; no DB'});
    }
  }
}
fs.writeFileSync(path.join(__dirname,'ui-fixture-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({screens:specs.length,renders:manifest.length,widths:[320,360,412,768],fontScales:[1,2],output,nativeQa:false}));
