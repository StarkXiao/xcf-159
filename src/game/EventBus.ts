type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(callback);
    return () => {
      this.off(eventName, callback);
    };
  }

  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(eventName: string, ...args: any[]): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  clear(): void {
    this.events.clear();
  }
}

export const eventBus = new EventBus();
