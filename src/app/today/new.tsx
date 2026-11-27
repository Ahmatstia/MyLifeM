import { Redirect } from 'expo-router';
export default function LegacyToday(){return <Redirect href={{pathname:'/tasks/new',params:{today:'1'}}}/>;}
