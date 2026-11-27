import React, { useCallback, useState, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Screen, AppText, Button, Banner, FormScreenHeader } from '@/shared/ui';
import { taskService, type UnifiedTask } from '../data/task.service';
import { formatLocalDate } from '@/shared/utils/local-date';
import { formInputBase, formTextArea } from '@/shared/ui/form-control-styles';
import { backOrHome } from '@/shared/utils/back-or-home';
import { todayColors as c } from '@/theme/today';

export function ReviewScreen() {
 const today=formatLocalDate();
 const saving=useRef(false);
 const [data,setData]=useState<Awaited<ReturnType<typeof taskService.review>>>(),[items,setItems]=useState<UnifiedTask[]>([]),[day,setDay]=useState(today),[notes,setNotes]=useState({accomplishment:'',obstacle:'',nextAction:''}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const loadedDay=useRef<string|null>(null),currentDay=useRef(day);
 const load=useCallback(async()=>{try{const [review,all]=await Promise.all([taskService.review(day),taskService.list()]);if(currentDay.current!==day)return;setData(review);setItems(all);if(loadedDay.current!==day){loadedDay.current=day;setNotes({accomplishment:review.note?.accomplishment??'',obstacle:review.note?.obstacle??'',nextAction:review.note?.nextAction??''});}setError('');}catch(e){setError(e instanceof Error?e.message:'Tinjauan belum dapat dimuat.');}},[day]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 const act=async(work:()=>Promise<unknown>)=>{if(saving.current)return;saving.current=true;setBusy(true);try{await work();await load();}catch(e){setError(e instanceof Error?e.message:'Keputusan belum tersimpan.');}finally{saving.current=false;setBusy(false);}};
 const unfinished=items.filter(t=>['TODO','IN_PROGRESS'].includes(t.status)&&t.selectedDates.includes(day));
 return <Screen><FormScreenHeader title="Tinjauan" onBack={backOrHome}/>
 <AppText accessibilityRole="header" variant="headlineLarge">Apa yang sudah bergerak?</AppText>
 <AppText color={c.muted}>Lihat hasil, lalu putuskan langkah berikutnya. Hari yang terlewat tidak menghapus kemajuanmu.</AppText>
 <TextInput accessibilityLabel="Tanggal tinjauan" value={day} onChangeText={value=>{currentDay.current=value;setData(undefined);setDay(value);setSaved(false);}} style={formInputBase}/>
 {error?<Banner variant="error" message={error} actionText="Coba lagi" onActionPress={load}/>:null}
 {data&&<View style={{padding:16,gap:8,borderRadius:24,backgroundColor:c.sky}}><AppText variant="headlineSmall">Tujuh hari sampai {day}</AppText><AppText>{data.completed.length} tugas selesai · {data.sessions.reduce((sum,item)=>sum+item.durationMinutes,0)} menit sesi tercatat</AppText><AppText color={c.skyInk}>Menit menunjukkan waktu yang tercatat, bukan nilai kualitas pekerjaanmu.</AppText>{data.completed.map(t=><AppText key={t.id}>✓ {t.title}</AppText>)}</View>}
 <AppText variant="headlineSmall">Rencana yang belum selesai</AppText>
 {unfinished.length===0?<AppText color={c.muted}>Tidak ada tugas aktif yang dipilih pada tanggal ini.</AppText>:unfinished.map(item=><View key={item.id} style={{backgroundColor:c.card,borderRadius:22,padding:16,gap:8}}><AppText variant="titleMedium">{item.title}</AppText><Button title="Lanjut besok" variant="tonal" disabled={busy} onPress={()=>void act(async()=>{const {shiftDate}=await import('@/shared/utils/local-date');await taskService.moveDay(item.id,day,shiftDate(day,1));})}/><Button title="Atur ulang atau pecah langkah" variant="text" onPress={()=>router.push({pathname:'/tasks/[id]',params:{id:item.id}})}/><Button title="Simpan untuk nanti" variant="text" disabled={busy} onPress={()=>void act(()=>taskService.park(item.id,'SOMEDAY'))}/></View>)}
 {(['accomplishment','obstacle','nextAction'] as const).map((key,index)=><View key={key} style={{gap:8}}><AppText variant="labelLarge">{['Hasil yang berarti','Apa yang menghambat?','Langkah berikutnya'][index]}</AppText><TextInput accessibilityLabel={key === 'accomplishment' ? 'Hasil yang berarti' : key === 'obstacle' ? 'Hambatan' : 'Langkah berikutnya'} value={notes[key]} onChangeText={value=>{setNotes(n=>({...n,[key]:value}));setSaved(false);}} multiline style={[formInputBase,formTextArea]} editable={!busy}/></View>)}
 <Button title="Simpan tinjauan" loading={busy} onPress={()=>void act(async()=>{await taskService.saveReview(day,notes.accomplishment,notes.obstacle,notes.nextAction);setSaved(true);})}/>
 {saved?<AppText accessibilityLiveRegion="polite" color={c.mintInk}>Tinjauan tersimpan.</AppText>:null}
 {data?.actions.length?<><AppText variant="headlineSmall">Keputusan terakhir</AppText>{data.actions.slice(0,15).map(item=><AppText key={item.id} color={c.muted}>{item.date} · {({SELECT:'Dipilih',REMOVE:'Dilepas dari rencana',COMPLETE:'Selesai',REOPEN:'Dibuka kembali',SOMEDAY:'Disimpan untuk nanti',WAITING:'Menunggu',CANCEL:'Dibatalkan',SCHEDULE:'Dijadwalkan'} as Record<string,string>)[item.action]}: {item.taskTitle}</AppText>)}</>:null}
 </Screen>;
}
