// LocalStorage store for user calendar notes and reminders

const STORAGE_KEY = 'patro_user_events_v1';

export class EventsStore {
  constructor() {
    this.events = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load events', e);
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
      this.notify();
    } catch (e) {
      console.error('Failed to save events', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.events));
  }

  addEvent(bsYear, bsMonth, bsDay, title, time = '', tag = 'personal') {
    const newEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      bsYear: Number(bsYear),
      bsMonth: Number(bsMonth),
      bsDay: Number(bsDay),
      title: title.trim(),
      time,
      tag,
      createdAt: new Date().toISOString()
    };
    this.events.push(newEvent);
    this.save();
    return newEvent;
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.save();
  }

  getEventsForDate(bsYear, bsMonth, bsDay) {
    return this.events.filter(
      e => e.bsYear === Number(bsYear) && e.bsMonth === Number(bsMonth) && e.bsDay === Number(bsDay)
    );
  }

  hasEvents(bsYear, bsMonth, bsDay) {
    return this.events.some(
      e => e.bsYear === Number(bsYear) && e.bsMonth === Number(bsMonth) && e.bsDay === Number(bsDay)
    );
  }

  getAllEvents() {
    return [...this.events].sort((a, b) => {
      if (a.bsYear !== b.bsYear) return a.bsYear - b.bsYear;
      if (a.bsMonth !== b.bsMonth) return a.bsMonth - b.bsMonth;
      return a.bsDay - b.bsDay;
    });
  }
}

export const eventsStore = new EventsStore();
