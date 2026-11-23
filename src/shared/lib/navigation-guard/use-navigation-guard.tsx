import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  NavigationGuardPortal,
  type DialogSnapshot,
  type DialogStore,
} from "./navigation-guard-portal";

interface UseNavigationGuardOptions {
  message?: string | undefined;
  shouldBlock: boolean;
  title?: string | undefined;
}

function createDialogStore(): DialogStore {
  let snapshot: DialogSnapshot | null = null;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update: (next: DialogSnapshot) => {
      snapshot = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

function createBoundDialogRenderer(store: DialogStore) {
  return function renderBoundDialog(): ReactNode {
    return <NavigationGuardPortal store={store} />;
  };
}

function useSyncedDialog(snapshot: DialogSnapshot) {
  const store = useMemo(() => createDialogStore(), []);

  useEffect(() => {
    store.update(snapshot);
  }, [snapshot, store]);

  return useMemo(() => createBoundDialogRenderer(store), [store]);
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
}

function useBeforeUnload(shouldBlock: boolean) {
  useEffect(() => {
    if (shouldBlock) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (shouldBlock) {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, [shouldBlock]);
}

function useNavigationGuard({
  message = "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
  shouldBlock,
  title = "Unsaved changes",
}: UseNavigationGuardOptions) {
  const [open, setOpen] = useState(false);

  if (!shouldBlock && open) {
    setOpen(false);
  }

  const isOpen = shouldBlock && open;
  const blocker = useBlocker({
    disabled: !shouldBlock,
    enableBeforeUnload: false,
    shouldBlockFn: () => {
      setOpen(true);
      return true;
    },
    withResolver: true,
  });

  useBeforeUnload(shouldBlock);

  const handleCancel = useCallback(() => {
    setOpen(false);
    blocker.reset?.();
  }, [blocker]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    blocker.proceed?.();
  }, [blocker]);

  const snapshot = useMemo(
    () => ({ handleCancel, handleConfirm, message, open: isOpen, title }),
    [handleCancel, handleConfirm, isOpen, message, title],
  );

  return {
    NavigationGuardDialog: useSyncedDialog(snapshot),
    open: isOpen,
  };
}

export { useNavigationGuard };
