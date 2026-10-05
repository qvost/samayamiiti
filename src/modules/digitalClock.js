// Digital Clock Engine with Nepal Standard Time (NPT), World Clocks, and Fullscreen Mode
import { soundFx } from './audioSynthesizer.js';
import { toNepaliNumeral } from './nepaliCalendar.js';
import { calculateSunTimes, calculateMoonPhase } from './astronomy.js';

export const WORLD_CITIES = [
  { id: 'kathmandu', name: 'Kathmandu', country: 'Nepal', timezone: 'Asia/Kathmandu', flag: '🇳🇵', isHome: true },
  { id: 'delhi', name: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'london', name: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧' },
  { id: 'newyork', name: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'paris', name: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' }
];

export class DigitalClockEngine {
  constructor() {
    this.is24Hour = false;
    this.showSeconds = true;
    this.useNepaliDigits = false;
    this.timeMode = 'kathmandu'; // 'kathmandu' | 'local'
    this.fullscreenTheme = 'amber'; // 'amber' | 'cyan' | 'oled' | 'sunset' | 'matrix'
    this.isFullscreen = false;
    this.timerId = null;
    this.listeners = [];
  }

  start() {
    if (this.timerId) return;
    this.tick();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(data) {
    this.listeners.forEach(fn => fn(data));
  }

  getKathmanduDate() {
    const now = new Date();
    // Use Intl to format exactly in Asia/Kathmandu
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu',
        hour12: false,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).formatToParts(now);

      const d = {};
      parts.forEach(p => d[p.type] = parseInt(p.value, 10));
      return new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second);
    } catch (e) {
      // Fallback UTC+5:45
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      return new Date(utc + (5.75 * 3600000));
    }
  }

  getCityTime(timezone) {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).formatToParts(now);

      const d = {};
      parts.forEach(p => d[p.type] = parseInt(p.value, 10));
      const cityDate = new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second);

      const h = cityDate.getHours();
      const m = cityDate.getMinutes();
      const s = cityDate.getSeconds();
      const isDay = h >= 6 && h < 18;

      let displayH = h;
      let ampm = '';
      if (!this.is24Hour) {
        ampm = h >= 12 ? 'PM' : 'AM';
        displayH = h % 12 === 0 ? 12 : h % 12;
      }

      return {
        hours: displayH.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
        rawHours: h,
        ampm,
        isDay,
        dateStr: cityDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      };
    } catch (err) {
      return {
        hours: '--',
        minutes: '--',
        seconds: '--',
        rawHours: 12,
        ampm: '',
        isDay: true,
        dateStr: ''
      };
    }
  }

  getTimeDifferenceFromKathmandu(cityTimezone) {
    if (cityTimezone === 'Asia/Kathmandu') return 'Home (Local)';
    const now = new Date();
    try {
      // Get offset minutes for both
      const dKtm = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
      const dCity = new Date(now.toLocaleString('en-US', { timeZone: cityTimezone }));
      const diffMs = dCity.getTime() - dKtm.getTime();
      const diffMinutes = Math.round(diffMs / 60000);

      if (diffMinutes === 0) return 'Same time';

      const absMins = Math.abs(diffMinutes);
      const hours = Math.floor(absMins / 60);
      const mins = absMins % 60;

      const sign = diffMinutes > 0 ? '+' : '-';
      let formatted = `${sign}`;
      if (hours > 0) formatted += `${hours}h `;
      if (mins > 0 || hours === 0) formatted += `${mins}m`;

      return `${formatted.trim()} vs NPT`;
    } catch (e) {
      return '';
    }
  }

  tick() {
    const ktmDate = this.getKathmanduDate();
    const localDate = new Date();
    const activeDate = this.timeMode === 'kathmandu' ? ktmDate : localDate;

    const rawHours = activeDate.getHours();
    const rawMinutes = activeDate.getMinutes();
    const rawSeconds = activeDate.getSeconds();

    // Check hourly chime
    soundFx.checkHourlyChime(rawHours, rawMinutes, rawSeconds);
    // Play tick if enabled
    soundFx.playClockTick();

    let displayHours = rawHours;
    let ampm = '';

    if (!this.is24Hour) {
      ampm = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12 === 0 ? 12 : rawHours % 12;
    }

    let hStr = displayHours.toString().padStart(2, '0');
    let mStr = rawMinutes.toString().padStart(2, '0');
    let sStr = rawSeconds.toString().padStart(2, '0');

    if (this.useNepaliDigits) {
      hStr = toNepaliNumeral(hStr);
      mStr = toNepaliNumeral(mStr);
      sStr = toNepaliNumeral(sStr);
    }

    // World clocks
    const worldClocks = WORLD_CITIES.map(city => {
      const timeInfo = this.getCityTime(city.timezone);
      const diff = this.getTimeDifferenceFromKathmandu(city.timezone);
      return {
        ...city,
        ...timeInfo,
        diff
      };
    });

    const sunTimes = calculateSunTimes(ktmDate);
    const moonPhase = calculateMoonPhase(ktmDate);

    const clockState = {
      hours: hStr,
      minutes: mStr,
      seconds: sStr,
      rawHours,
      rawMinutes,
      rawSeconds,
      ampm,
      is24Hour: this.is24Hour,
      showSeconds: this.showSeconds,
      timeMode: this.timeMode,
      tzLabel: this.timeMode === 'kathmandu' ? 'Nepal Time (NPT) • UTC +5:45' : 'Local Device Time',
      secondProgress: ((rawSeconds / 60) * 100).toFixed(1),
      sunTimes,
      moonPhase,
      worldClocks,
      dateGregorian: activeDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    this.notify(clockState);
  }

  toggle24Hour() {
    this.is24Hour = !this.is24Hour;
    this.tick();
  }

  toggleTimeMode() {
    this.timeMode = this.timeMode === 'kathmandu' ? 'local' : 'kathmandu';
    this.tick();
  }

  toggleNepaliDigits() {
    this.useNepaliDigits = !this.useNepaliDigits;
    this.tick();
  }

  setFullscreenTheme(theme) {
    this.fullscreenTheme = theme;
  }
}

export const digitalClock = new DigitalClockEngine();
