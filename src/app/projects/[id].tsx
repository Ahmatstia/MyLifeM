import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProjectDetailScreen } from '@/features/projects/presentation/screens/project-detail-screen';

/**
 * Thin Route Adapter for Stack: Project Detail Screen
 */
export default function ProjectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProjectDetailScreen projectId={id || ''} />;
}
