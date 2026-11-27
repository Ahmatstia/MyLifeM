import { isTaskOverdue } from '../domain/deadline';
import React, { useCallback, useState, useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Plus, ChevronRight, Check } from 'lucide-react-native';
import { Screen, AppText, Button, PillTabs, Banner, SproutCheck } from '@/shared/ui';
import { todayColors as c } from '@/theme/today';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { fontFamily } from '@/theme/tokens';
import { taskService, type UnifiedTask } from '../data/task.service';
import { formatLocalDate } from '@/shared/utils/local-date';

export function TaskListScreen() {
 const [items,setItems]=useState<UnifiedTask[]>([]),[filter,setFilter]=useState('INBOX'),[title,setTitle]=useState(''),[search,setSearch]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const saving=useRef(false);
 const load=useCallback(async()=>{try{setItems(await taskService.list());setError('');}catch{setError('Tugas belum dapat dimuat. Coba lagi.');}},[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 const act=async(work:()=>Promise<unknown>)=>{if(saving.current)return;saving.current=true;setBusy(true);try{await work();await load();}catch(e){setError(e instanceof Error?e.message:'Perubahan belum tersimpan.');}finally{saving.current=false;setBusy(false);}};
 const today=formatLocalDate();
 const visible=items.filter(item=>{
  const active=['TODO','IN_PROGRESS'].includes(item.status);
  const matches=filter==='ALL'?active:filter==='DONE'?item.status==='COMPLETED':filter==='CANCELLED'?item.status==='CANCELLED':filter==='TODAY'?active&&item.selectedDates.includes(today):active&&item.planningState===filter;
  return matches&&item.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
 });
 return <Screen insideTabs>
  <View style={styles.heading}><AppText accessibilityRole="header" variant="displayMedium" style={{fontFamily:fontFamily.display,flex:1}}>Tugas</AppText><Pressable accessibilityRole="button" accessibilityLabel="Tambah tugas" onPress={()=>router.push('/tasks/new')} style={styles.add}><Plus size={22} color={c.ink}/></Pressable></View>
  <View style={styles.capture}><TextInput accessibilityLabel="Catat tugas cepat" placeholder="Apa yang perlu kamu lakukan?" value={title} onChangeText={setTitle} style={[formInputBase,{flex:1}]} editable={!busy} onSubmitEditing={()=>void act(async()=>{await taskService.create({title});setTitle('');setFilter('INBOX');})}/><Button title="Simpan" disabled={busy||!title.trim()} onPress={()=>void act(async()=>{await taskService.create({title});setTitle('');setFilter('INBOX');})}/></View>
  <PillTabs options={[{value:'INBOX',label:'Kotak masuk'},{value:'TODAY',label:'Hari ini'},{value:'ALL',label:'Aktif'}]} value={filter} onChange={setFilter}/>
  <PillTabs options={[{value:'SOMEDAY',label:'Nanti'},{value:'WAITING',label:'Menunggu'},{value:'DONE',label:'Selesai'}]} value={filter} onChange={setFilter}/>
  <Button title="Tugas dibatalkan" variant={filter==='CANCELLED'?'tonal':'text'} onPress={()=>setFilter('CANCELLED')}/>
  <TextInput accessibilityLabel="Cari tugas" placeholder="Cari tugas…" value={search} onChangeText={setSearch} style={formInputBase}/>
  {error?<Banner variant="error" message={error} actionText="Coba lagi" onActionPress={load}/>:null}
  {visible.length===0?<View style={styles.empty}><Check size={28} color={c.mintInk}/><AppText variant="titleLarge">{filter==='INBOX'?'Pikiran boleh lebih lega':'Tidak ada tugas di pilihan ini'}</AppText><AppText color={c.muted}>Catat sesuatu di atas atau lihat seluruh tugas aktif.</AppText></View>:visible.map(item=><View key={item.id} style={styles.card}>
   <View style={styles.row}><SproutCheck checked={item.status==='COMPLETED'} disabled={busy} accessibilityLabel={(item.status==='COMPLETED'?'Buka kembali ':'Selesaikan ')+item.title} onPress={()=>void act(()=>taskService.setStatus(item.id,item.status==='COMPLETED'?'TODO':'COMPLETED'))}/><Pressable accessibilityRole="button" accessibilityLabel={'Buka tugas '+item.title} onPress={()=>router.push({pathname:'/tasks/[id]',params:{id:item.id}})} style={styles.copy}><AppText variant="titleMedium">{item.title}</AppText><AppText variant="bodySmall" color={c.muted}>{item.targetName??'Tugas mandiri'}{item.dueDate?' · Tenggat '+item.dueDate:''}</AppText>{isTaskOverdue(item.dueDate,item.profile?.deadlineTime,item.status)?<AppText variant="bodySmall" color={c.peachInk}>Tenggat terlewat. Pilih langkah berikutnya atau atur ulang waktu pengerjaan.</AppText>:null}{item.profile?.nextAction?<AppText variant="bodySmall" color={c.skyInk}>{item.profile.nextAction}</AppText>:null}</Pressable><ChevronRight size={18} color={c.muted}/></View>
   {['TODO','IN_PROGRESS'].includes(item.status)&&!item.selectedDates.includes(today)?<Button title="Pilih untuk hari ini" variant="tonal" disabled={busy} onPress={()=>void act(()=>taskService.select(item.id))}/>:item.selectedDates.includes(today)?<AppText variant="labelMedium" color={c.mintInk}>Dipilih untuk hari ini</AppText>:null}
  </View>)}
 </Screen>;
}
const styles=StyleSheet.create({heading:{flexDirection:'row',alignItems:'center',gap:12},add:{width:48,height:48,borderRadius:18,backgroundColor:c.gold,alignItems:'center',justifyContent:'center'},capture:{gap:8},card:{backgroundColor:c.card,borderRadius:24,padding:12,gap:8,borderWidth:1,borderColor:c.line},row:{flexDirection:'row',alignItems:'center',gap:8},copy:{flex:1,minHeight:48,justifyContent:'center',gap:4},empty:{padding:24,alignItems:'center',gap:12}});
