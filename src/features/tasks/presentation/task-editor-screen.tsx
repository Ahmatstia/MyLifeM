import React, { useCallback, useState, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Screen, AppText, FormScreenHeader, Button, Banner, PillTabs } from '@/shared/ui';
import { formInputBase, formTextArea } from '@/shared/ui/form-control-styles';
import { taskService, type TaskDraft } from '../data/task.service';
import { formatLocalDate } from '@/shared/utils/local-date';
import { backOrHome } from '@/shared/utils/back-or-home';

export function TaskEditorScreen() {
 const {id,today,target}=useLocalSearchParams<{id?:string;today?:string;target?:string}>();
 const saving=useRef(false);
 const [draft,setDraft]=useState<TaskDraft>({title:'',targetId:target??null}),[advanced,setAdvanced]=useState(false),[owners,setOwners]=useState<{id:string;title:string}[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(!!id);
 useFocusEffect(useCallback(()=>{let alive=true;void (async()=>{try{const owners=await taskService.targets();if(alive)setOwners(owners);if(id){const item=(await taskService.list()).find(t=>t.id===id);if(!item)throw new Error('Tugas tidak ditemukan.');if(alive){setDraft({title:item.title,description:item.description??'',targetId:item.owner,estimatedMinutes:item.estimate,dueDate:item.dueDate,deadlineTime:item.profile?.deadlineTime,nextAction:item.profile?.nextAction??'',priority:item.priority as TaskDraft['priority']});setAdvanced(true);}}}catch(e){if(alive)setError(e instanceof Error?e.message:'Tugas belum dapat dimuat.');}finally{if(alive)setLoading(false);}})();return()=>{alive=false;};},[id]));
 const field=(key:'title'|'description'|'nextAction'|'dueDate'|'deadlineTime',label:string,placeholder:string,multiline=false)=><View style={{gap:8}}><AppText variant="labelLarge">{label}</AppText><TextInput accessibilityLabel={label || "Rincian tugas"} value={draft[key]??''} placeholder={placeholder} onChangeText={value=>setDraft(d=>({...d,[key]:value}))} multiline={multiline} style={[formInputBase,multiline&&formTextArea]} editable={!busy}/></View>;
 const save=async()=>{if(saving.current)return;saving.current=true;setBusy(true);setError('');try{const task=id?(await taskService.update(id,draft),id):await taskService.create(draft,today==='1'?formatLocalDate():undefined);router.replace({pathname:'/tasks/[id]',params:{id:task}});}catch(e){setError(e instanceof Error?e.message:'Tugas belum tersimpan.');}finally{saving.current=false;setBusy(false);}};
 return <Screen><FormScreenHeader title={id?'Ubah tugas':'Catat tugas'} onBack={()=>{if(!saving.current)backOrHome();}}/>
  {error?<Banner variant="error" message={error}/>:null}
  {field('title','Nama tugas','Misalnya: selesaikan laporan praktikum')}
  <AppText color="onSurfaceVariant">Cukup nama untuk menyimpan. Rincian lainnya bisa menyusul.</AppText>
  <Button title={advanced?'Sembunyikan rincian':'Tambahkan rincian (opsional)'} variant="text" onPress={()=>setAdvanced(!advanced)}/>
  {advanced&&<>
   {field('nextAction','Langkah pertama','Misalnya: tulis tiga pokok pembahasan')}
   {field('description','Catatan','Keterangan atau hasil yang ingin dicapai',true)}
   <AppText variant="labelLarge">Target (opsional)</AppText><PillTabs options={[{value:'',label:'Mandiri'},...owners.map(t=>({value:t.id,label:t.title}))]} value={draft.targetId??''} onChange={value=>setDraft(d=>({...d,targetId:value||null}))}/>
   <AppText variant="labelLarge">Estimasi menit (opsional)</AppText><TextInput accessibilityLabel="Estimasi menit" keyboardType="number-pad" value={draft.estimatedMinutes==null?'':String(draft.estimatedMinutes)} placeholder="Belum diketahui" onChangeText={value=>setDraft(d=>({...d,estimatedMinutes:value.trim()?Number(value):null}))} style={formInputBase} editable={!busy}/>
   {field('dueDate','Tanggal tenggat','TTTT-BB-HH, boleh kosong')}{field('deadlineTime','Jam tenggat','HH:mm, boleh kosong')}
   <PillTabs options={[{value:'LOW',label:'Santai'},{value:'MEDIUM',label:'Utama'},{value:'HIGH',label:'Penting'},{value:'URGENT',label:'Mendesak'}]} value={draft.priority??'MEDIUM'} onChange={value=>setDraft(d=>({...d,priority:value as TaskDraft['priority']}))}/>
  </>}
  <Button title="Simpan tugas" loading={busy} disabled={loading} onPress={save}/>
 </Screen>;
}
