import { useSyncExternalStore, type ReactNode } from "react";

import { NavigationGuardDialog } from "./navigation-guard-dialog";

interface DialogSnapshot {
  handleCancel: () => void;
  handleConfirm: () => void;
  message: string;
  open: boolean;
  title: string;
}

interface DialogStore {
  getSnapshot: () => DialogSnapshot | null;
  subscribe: (listener: () => void) => () => void;
  update: (next: DialogSnapshot) => void;
}

function NavigationGuardPortal({ store }: { store: DialogStore }): ReactNode {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  if (!state) {
    return null;
  }

  return (
    <NavigationGuardDialog
      message={state.message}
      onCancel={state.handleCancel}
      onConfirm={state.handleConfirm}
      open={state.open}
      title={state.title}
    />
  );
}

export { NavigationGuardPortal, type DialogSnapshot, type DialogStore };
