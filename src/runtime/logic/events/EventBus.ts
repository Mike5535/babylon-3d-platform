type EventHandler<T> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventHandler<any>>>();

  on<T>(event: string, handler: EventHandler<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off<T>(event: string, handler: EventHandler<T>) {
    this.listeners.get(event)?.delete(handler);
  }

  emit<T>(event: string, payload: T) {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}
