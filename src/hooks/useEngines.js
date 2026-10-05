import { useEffect, useState, useSyncExternalStore } from 'react';
import { digitalClock } from '../modules/digitalClock.js';
import { eventsStore } from '../modules/eventsStore.js';

/** Live clock state, updated every second by the clock engine. */
export function useClock() {
  const [clock, setClock] = useState(null);
  useEffect(() => {
    const unsub = digitalClock.subscribe(setClock);
    digitalClock.start();
    return unsub;
  }, []);
  return clock;
}

/** User notes, reactive. */
export function useEvents() {
  return useSyncExternalStore(
    (cb) => eventsStore.subscribe(cb),
    () => eventsStore.events
  );
}
