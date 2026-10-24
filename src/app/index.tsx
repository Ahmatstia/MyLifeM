import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root index route: immediately redirects into the primary (tabs) group
 */
export default function IndexRoute() {
  return <Redirect href="/(tabs)" />;
}
