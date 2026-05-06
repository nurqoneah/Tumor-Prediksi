'use client';

import { useSyncExternalStore, useCallback } from 'react';

// Empty subscribe function for useSyncExternalStore
const emptySubscribe = () => () => {};

// Get snapshot for client-side
function getSnapshot() {
  return true;
}

// Get server snapshot
function getServerSnapshot() {
  return false;
}

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
