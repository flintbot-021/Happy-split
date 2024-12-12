'use client';

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

export interface ToasterToast extends ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

interface State {
  toasts: ToasterToast[];
}

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

class ToastStore {
  private state: State = { toasts: [] };
  private listeners = new Set<(state: State) => void>();
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  subscribe(listener: (state: State) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach(listener => listener(this.state));
  }

  addToast(toast: Omit<ToasterToast, "id">) {
    const id = genId();

    this.state = {
      ...this.state,
      toasts: [
        { ...toast, id },
        ...this.state.toasts
      ].slice(0, TOAST_LIMIT),
    };

    this.emit();
    return id;
  }

  dismissToast(toastId?: string) {
    this.state = {
      ...this.state,
      toasts: this.state.toasts.map(t => 
        (t.id === toastId || toastId === undefined)
          ? { ...t, open: false }
          : t
      ),
    };

    this.emit();

    if (toastId) {
      this.scheduleRemoval(toastId);
    } else {
      this.state.toasts.forEach(t => this.scheduleRemoval(t.id));
    }
  }

  private scheduleRemoval(toastId: string) {
    if (this.timeouts.has(toastId)) return;

    const timeout = setTimeout(() => {
      this.timeouts.delete(toastId);
      this.removeToast(toastId);
    }, TOAST_REMOVE_DELAY);

    this.timeouts.set(toastId, timeout);
  }

  private removeToast(toastId?: string) {
    this.state = {
      ...this.state,
      toasts: toastId 
        ? this.state.toasts.filter(t => t.id !== toastId)
        : [],
    };
    this.emit();
  }

  getState() {
    return this.state;
  }
}

export const toastStore = new ToastStore();