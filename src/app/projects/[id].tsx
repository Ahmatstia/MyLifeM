import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { getSqliteDb } from '@/db/connection';
import { getConvertedProjectTarget } from '@/db/project-consolidation';

export default function LegacyProjectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const targetId = id ? getConvertedProjectTarget(getSqliteDb(), id) : null;
  return <Redirect href={targetId ? { pathname: '/targets/[id]', params: { id: targetId } } : '/targets'} />;
}
