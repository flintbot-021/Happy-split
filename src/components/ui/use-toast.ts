'use client';

import { useState, useEffect } from "react";
import { toastStore, type ToasterToast } from "@/lib/state/toast-store";

export function useToast() {
  const [state, setState] = useState(toastStore.getState());

  useEffect(() => {
    return toastStore.subscribe(setState);
  }, []);

  function toast(props: Omit<ToasterToast, "id">) {
    const id = toastStore.addToast({
      ...props,
      open: true,
      onOpenChange: (open) => {
        if (!open) toastStore.dismissToast(id);
      },
    });

    return {
      id,
      dismiss: () => toastStore.dismissToast(id),
      update: (props: ToasterToast) => {
        toastStore.addToast({ ...props, id });
      },
    };
  }

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => toastStore.dismissToast(toastId),
  };
}