import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {
    // No-op cleanup
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
