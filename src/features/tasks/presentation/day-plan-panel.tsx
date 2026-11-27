import React, { useCallback, useState, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText, Button, Banner } from '@/shared/ui';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { todayColors as c } from '@/theme/today';
import { taskService, type UnifiedTask } from '../data/task.service';
import { formatLocalDate } from '@/shared/utils/local-date';

export function DayPlanPanel({revision,onChange}:{revision:string;onChange:()=>Promise<void>}) {
 const today=formatLocalDate();
 const saving=useRef(false);
 const [items,setItems]=useState<UnifiedTask[]>([]),[capacity,setCapacity]=useState('120'),[available,setAvailable]=useState(120),[expanded,setExpanded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{try{const [all,minutes]=await Promise.all([taskService.list(),taskService.plan(today)]);setItems(all);setCapacity(String(minutes));setAvailable(minutes);}catch{setError('Rencana belum dapat dimuat.');}},[today]);
 useFocusEffect(useCallback(()=>{if (revision !== undefined) void load();},[load,revision]));
 const pending=items.filter(t=>['TODO','IN_PROGRESS'].includes(t.status)&&t.selectedDates.includes(today));
 const known=pending.reduce((sum,t)=>sum+(t.estimate??0),0),unknown=pending.filter(t=>t.estimate===null).length;
 const suggestions=items.filter(t=>['TODO','IN_PROGRESS'].includes(t.status)&&!t.selectedDates.includes(today)&&!['SOMEDAY','WAITING'].includes(t.planningState)).sort((a,b)=>Number(b.selectedDates.some(d=>d<today))-Number(a.selectedDates.some(d=>d<today))||(a.dueDate??'9999').localeCompare(b.dueDate??'9999')).slice(0,3);
 const act=async(work:()=>Promise<unknown>)=>{if(saving.current)return;saving.current=true;setBusy(true);try{await work();await load();await onChange();setError('');}catch(e){setError(e instanceof Error?e.message:'Rencana belum tersimpan.');}finally{saving.current=false;setBusy(false);}};
 return <View style={{backgroundColor:c.mint,borderRadius:24,padding:16,gap:12}}>
 <AppText variant="headlineSmall">Ruang untuk hari ini</AppText>
 <AppText>{pending.length} tugas dipilih · {known} menit diketahui{unknown?' · '+unknown+' belum diestimasi':''}</AppText>
 <AppText color={c.mintInk}>Waktu fokus tersedia: {available} menit.</AppText>
 {known>available?<AppText color={c.peachInk}>Rencana melampaui waktu tersedia. Pilih yang paling penting atau jadwalkan sebagian untuk hari lain.</AppText>:null}
 {pending.length>3?<AppText color={c.mintInk}>Tiga prioritas adalah titik awal. Kamu tetap bisa menyesuaikan jumlahnya.</AppText>:null}
 <Button title={expanded?'Tutup perencanaan':'Atur rencana hari ini'} variant="outlined" onPress={()=>setExpanded(!expanded)}/>
 {error?<Banner variant="error" message={error}/>:null}
 {expanded&&<>
 <AppText color={c.mintInk}>Isi waktu yang benar-benar tersedia di luar kuliah, kerja, istirahat, dan janji tetap.</AppText>
 <TextInput accessibilityLabel="Waktu fokus tersedia dalam menit" keyboardType="number-pad" value={capacity} onChangeText={setCapacity} style={formInputBase}/><Button title="Simpan waktu tersedia" disabled={busy} onPress={()=>void act(()=>taskService.setCapacity(Number(capacity),today))}/>
 <AppText variant="titleMedium">Pilih yang masuk akal hari ini</AppText>
 {suggestions.map(item=><View key={item.id} style={{gap:8,backgroundColor:c.card,padding:12,borderRadius:18}}><AppText variant="titleSmall">{item.title}</AppText><AppText color={c.muted}>{item.selectedDates.some(d=>d<today)?'Pernah dipilih sebelumnya. Lanjutkan jika masih relevan.':'Belum dipilih untuk hari ini.'}</AppText><Button title={'Pilih '+item.title} variant="tonal" disabled={busy} onPress={()=>void act(()=>taskService.select(item.id))}/></View>)}
 <Button title="Lihat semua tugas" variant="text" onPress={()=>router.push('/(tabs)/tasks')}/>
 </>}
 <Button title="Tinjau hari ini dan minggu ini" variant="text" onPress={()=>router.push('/review')}/>
 </View>;
}
