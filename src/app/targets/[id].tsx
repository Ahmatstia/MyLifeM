import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TargetDetailScreen } from '@/features/targets/presentation/screens/target-detail-screen';

export default function TargetDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TargetDetailScreen targetId={id as string} />;
}
