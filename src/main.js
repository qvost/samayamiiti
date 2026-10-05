import './style.css';
import confetti from 'canvas-confetti';
import { digitalClock, WORLD_CITIES } from './modules/digitalClock.js';
import {
  generateCalendarGrid,
  getCurrentNepaliDate,
  NEPALI_MONTHS,
  DAYS_OF_WEEK,
  toNepaliNumeral,
  toEnglishNumeral
} from './modules/nepaliCalendar.js';
import { soundFx } from './modules/audioSynthesizer.js';
import { convertBsToAd, convertAdToBs } from './modules/dateConverter.js';
import { eventsStore } from './modules/eventsStore.js';
import { calculateSunTimes } from './modules/astronomy.js';

// Application State
const state = {
  currentBsDate: getCurrentNepaliDate(),
  viewBsYear: 2083,
  viewBsMonth: 5, // 0-indexed: 5 = Ashwin
  useNepaliDigits: false,
  selectedDayData: null,
  activeTab: 'festivalsTab',
  theme: localStorage.getItem('patro_theme') || 'dark',
  fullscreenTheme: 'theme-amber',
  // Stopwatch
  stopwatch: {
    running: false,
    startTime: 0,
    elapsedTime: 0,
    timerId: null,
    laps: []
  },
  // Timer
  timer: {
    running: false,
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    timerId: null
  }
};

// Initialize year and month from current date
state.viewBsYear = state.currentBsDate.year;
state.viewBsMonth = state.currentBsDate.month;

// Apply theme
document.documentElement.setAttribute('data-theme', state.theme);

// DOM Elements
const el = {
  // Navigation
  btnSoundToggle: document.getElementById('btnSoundToggle'),
  soundIcon: document.getElementById('soundIcon'),
  soundLabel: document.getElementById('soundLabel'),
  btnNumeralsToggle: document.getElementById('btnNumeralsToggle'),
  numeralToggleLabel: document.getElementById('numeralToggleLabel'),
  btnThemeToggle: document.getElementById('btnThemeToggle'),
  themeIcon: document.getElementById('themeIcon'),
  btnFullscreenOpen: document.getElementById('btnFullscreenOpen'),

  // Digital Clock Hero
  clockTzLabel: document.getElementById('clockTzLabel'),
  btnTimeModeToggle: document.getElementById('btnTimeModeToggle'),
  btnFormatToggle: document.getElementById('btnFormatToggle'),
  btnTickSoundToggle: document.getElementById('btnTickSoundToggle'),
  clockHours: document.getElementById('clockHours'),
  clockMinutes: document.getElementById('clockMinutes'),
  clockSeconds: document.getElementById('clockSeconds'),
  clockAmPm: document.getElementById('clockAmPm'),
  clockSecondBar: document.getElementById('clockSecondBar'),
  clockNepaliDate: document.getElementById('clockNepaliDate'),
  clockTithiTag: document.getElementById('clockTithiTag'),
  clockGregorianDate: document.getElementById('clockGregorianDate'),
  clockNakshatra: document.getElementById('clockNakshatra'),

  // Solar & Moon
  solarCountdownBadge: document.getElementById('solarCountdownBadge'),
  sunPositionIndicator: document.getElementById('sunPositionIndicator'),
  statSunrise: document.getElementById('statSunrise'),
  statSunset: document.getElementById('statSunset'),
  statDayLength: document.getElementById('statDayLength'),
  statSolarNoon: document.getElementById('statSolarNoon'),
  statDawn: document.getElementById('statDawn'),
  statDusk: document.getElementById('statDusk'),
  moonPhaseName: document.getElementById('moonPhaseName'),
  moonPhaseNepali: document.getElementById('moonPhaseNepali'),
  moonIllumination: document.getElementById('moonIllumination'),
  moonLitPath: document.getElementById('moonLitPath'),

  // Mini World Clocks
  miniWorldClocksContainer: document.getElementById('miniWorldClocksContainer'),
  btnOpenWorldTab: document.getElementById('btnOpenWorldTab'),

  // Calendar
  calBsMonthYear: document.getElementById('calBsMonthYear'),
  calBsMonthEn: document.getElementById('calBsMonthEn'),
  calGregorianRange: document.getElementById('calGregorianRange'),
  calSeasonBadge: document.getElementById('calSeasonBadge'),
  btnPrevMonth: document.getElementById('btnPrevMonth'),
  btnCurrentMonth: document.getElementById('btnCurrentMonth'),
  btnNextMonth: document.getElementById('btnNextMonth'),
  selectBsYear: document.getElementById('selectBsYear'),
  selectBsMonth: document.getElementById('selectBsMonth'),
  calendarDaysMatrix: document.getElementById('calendarDaysMatrix'),

  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-content-panel'),
  festivalsListContainer: document.getElementById('festivalsListContainer'),

  // Converter
  inputBsYear: document.getElementById('inputBsYear'),
  selectConvBsMonth: document.getElementById('selectConvBsMonth'),
  inputBsDay: document.getElementById('inputBsDay'),
  btnConvertBsToAd: document.getElementById('btnConvertBsToAd'),
  resultBsToAd: document.getElementById('resultBsToAd'),

  inputAdYear: document.getElementById('inputAdYear'),
  selectConvAdMonth: document.getElementById('selectConvAdMonth'),
  inputAdDay: document.getElementById('inputAdDay'),
  btnConvertAdToBs: document.getElementById('btnConvertAdToBs'),
  resultAdToBs: document.getElementById('resultAdToBs'),

  // World Observatory Tab
  expandedWorldClocksGrid: document.getElementById('expandedWorldClocksGrid'),

  // Tools (Stopwatch & Timer)
  stopwatchDisplay: document.getElementById('stopwatchDisplay'),
  btnSwStart: document.getElementById('btnSwStart'),
  btnSwLap: document.getElementById('btnSwLap'),
  btnSwReset: document.getElementById('btnSwReset'),
  stopwatchLapsList: document.getElementById('stopwatchLapsList'),

  timerDisplay: document.getElementById('timerDisplay'),
  btnTimerStart: document.getElementById('btnTimerStart'),
  btnTimerPause: document.getElementById('btnTimerPause'),
  btnTimerReset: document.getElementById('btnTimerReset'),
  presetTimerButtons: document.querySelectorAll('.btn-preset-timer'),

  // Modal
  dayDetailModal: document.getElementById('dayDetailModal'),
  btnCloseDayModal: document.getElementById('btnCloseDayModal'),
  modalBsDate: document.getElementById('modalBsDate'),
  modalAdDate: document.getElementById('modalAdDate'),
  modalTithi: document.getElementById('modalTithi'),
  modalPaksha: document.getElementById('modalPaksha'),
  modalNakshatra: document.getElementById('modalNakshatra'),
  modalSunTimes: document.getElementById('modalSunTimes'),
  modalFestivalsContainer: document.getElementById('modalFestivalsContainer'),
  inputModalNote: document.getElementById('inputModalNote'),
  btnAddModalNote: document.getElementById('btnAddModalNote'),
  modalNotesList: document.getElementById('modalNotesList'),

  // Fullscreen
  fullscreenClockOverlay: document.getElementById('fullscreenClockOverlay'),
  btnFullscreenClose: document.getElementById('btnFullscreenClose'),
  fsHours: document.getElementById('fsHours'),
  fsMinutes: document.getElementById('fsMinutes'),
  fsSeconds: document.getElementById('fsSeconds'),
  fsAmPm: document.getElementById('fsAmPm'),
  fsNepaliDate: document.getElementById('fsNepaliDate'),
  fsGregorianDate: document.getElementById('fsGregorianDate'),
  fsTithi: document.getElementById('fsTithi'),
  fsBottomTicker: document.getElementById('fsBottomTicker'),
  fsThemeDots: document.querySelectorAll('.theme-pill-dot'),
  btnFsFormatToggle: document.getElementById('btnFsFormatToggle')
};

// ============================================================================
// 1. POPULATE DROPDOWNS
// ============================================================================
function initDropdowns() {
  // Calendar Year select (2000 to 2090 BS)
  el.selectBsYear.innerHTML = '';
  for (let y = 2090; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = state.useNepaliDigits ? `${toNepaliNumeral(y)} वि.सं.` : `${y} BS`;
    if (y === state.viewBsYear) opt.selected = true;
    el.selectBsYear.appendChild(opt);
  }

  // Calendar Month select (12 months)
  el.selectBsMonth.innerHTML = '';
  NEPALI_MONTHS.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${m.nameNp} (${m.nameEn})`;
    if (idx === state.viewBsMonth) opt.selected = true;
    el.selectBsMonth.appendChild(opt);
  });

  // Converter Month select
  el.selectConvBsMonth.innerHTML = '';
  NEPALI_MONTHS.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${idx + 1}. ${m.nameNp} (${m.nameEn})`;
    if (idx === 5) opt.selected = true; // Ashwin default
    el.selectConvBsMonth.appendChild(opt);
  });
}

// ============================================================================
// 2. CALENDAR RENDERING ENGINE
// ============================================================================
function renderCalendar() {
  const calData = generateCalendarGrid(state.viewBsYear, state.viewBsMonth);

  // Update Header Titles
  const yearStr = state.useNepaliDigits ? toNepaliNumeral(calData.bsYear) : calData.bsYear;
  el.calBsMonthYear.textContent = `${calData.monthNameNp} ${yearStr}`;
  el.calBsMonthEn.textContent = `(${calData.monthNameEn} ${calData.bsYear})`;
  el.calGregorianRange.textContent = calData.adRange;
  el.calSeasonBadge.textContent = calData.season;

  el.selectBsYear.value = state.viewBsYear;
  el.selectBsMonth.value = state.viewBsMonth;

  // Clear and Render Days Grid
  el.calendarDaysMatrix.innerHTML = '';

  calData.grid.forEach(cell => {
    const cellEl = document.createElement('div');
    cellEl.className = 'calendar-day-cell';

    if (!cell.isCurrentMonth) cellEl.classList.add('other-month');
    if (cell.isSaturday) cellEl.classList.add('saturday');
    if (cell.isHoliday) cellEl.classList.add('holiday');
    if (cell.isToday) cellEl.classList.add('today');

    // Display Day Number
    const dayNumber = state.useNepaliDigits ? toNepaliNumeral(cell.bsDate) : cell.bsDate;

    // Check if user has notes for this day
    const hasNotes = eventsStore.hasEvents(cell.bsYear, cell.bsMonth, cell.bsDate);

    // Festival tag
    let festivalBadgeHtml = '';
    if (cell.festivals && cell.festivals.length > 0) {
      festivalBadgeHtml = `<div class="cell-festival-tag" title="${cell.festivals[0].name}">${cell.festivals[0].name}</div>`;
    }

    cellEl.innerHTML = `
      ${cell.isToday ? '<span class="today-chip">आज</span>' : ''}
      <div class="cell-top-row">
        <span class="bs-day-number">${dayNumber}</span>
        <span class="ad-day-number">${cell.adDay}</span>
      </div>
      <div class="cell-bottom-row">
        <span class="cell-tithi">${cell.tithi.name}</span>
        ${festivalBadgeHtml}
      </div>
      ${hasNotes ? '<span class="note-indicator-dot" title="Has personal note"></span>' : ''}
    `;

    // Click handler -> Open Day Detail Modal
    cellEl.addEventListener('click', () => {
      openDayDetailModal(cell);
      if (cell.festivals && cell.festivals.length > 0) {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 }
        });
      }
    });

    el.calendarDaysMatrix.appendChild(cellEl);
  });

  renderFestivalsTab(calData);
}

// ============================================================================
// 3. FESTIVALS TAB RENDERING
// ============================================================================
function renderFestivalsTab(calData) {
  el.festivalsListContainer.innerHTML = '';

  const monthFestivals = [];
  calData.grid.filter(c => c.isCurrentMonth).forEach(cell => {
    if (cell.festivals && cell.festivals.length > 0) {
      cell.festivals.forEach(f => {
        monthFestivals.push({
          ...f,
          bsYear: cell.bsYear,
          bsMonth: cell.bsMonth,
          bsDay: cell.bsDate,
          adDate: cell.adDate,
          dayOfWeek: cell.dayOfWeek
        });
      });
    }
  });

  if (monthFestivals.length === 0) {
    el.festivalsListContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-dim);">
        यस महिनामा कुनै विशेष राष्ट्रिय चाडपर्व परेको छैन।
      </div>
    `;
    return;
  }

  monthFestivals.forEach(fest => {
    const card = document.createElement('div');
    card.className = 'festival-item-card';

    const dayStr = state.useNepaliDigits ? toNepaliNumeral(fest.bsDay) : fest.bsDay;
    const monthName = NEPALI_MONTHS[fest.bsMonth].nameNp;
    const dayName = DAYS_OF_WEEK[fest.dayOfWeek].nameNp;

    card.innerHTML = `
      <div class="festival-date-badge">
        <span class="f-badge-day">${dayStr}</span>
        <span class="f-badge-month">${monthName}</span>
      </div>
      <div class="festival-info">
        <span class="festival-name">${fest.name}</span>
        <span class="festival-en-name">${fest.nameEn} • ${dayName}</span>
        ${fest.isHoliday ? '<span class="festival-tag-chip">सार्वजनिक बिदा (Holiday)</span>' : '<span class="festival-tag-chip" style="background: rgba(56,189,248,0.15); color: var(--clock-digit-color);">धार्मिक / सांस्कृतिक पर्व</span>'}
      </div>
    `;

    card.addEventListener('click', () => {
      const cell = calData.grid.find(c => c.isCurrentMonth && c.bsDate === fest.bsDay);
      if (cell) openDayDetailModal(cell);
    });

    el.festivalsListContainer.appendChild(card);
  });
}

// ============================================================================
// 4. DAY DETAIL MODAL & NOTES
// ============================================================================
function openDayDetailModal(dayCell) {
  state.selectedDayData = dayCell;

  const bsDay = state.useNepaliDigits ? toNepaliNumeral(dayCell.bsDate) : dayCell.bsDate;
  const bsYear = state.useNepaliDigits ? toNepaliNumeral(dayCell.bsYear) : dayCell.bsYear;
  const monthName = NEPALI_MONTHS[dayCell.bsMonth].nameNp;
  const dayNameNp = DAYS_OF_WEEK[dayCell.dayOfWeek].nameNp;
  const dayNameEn = DAYS_OF_WEEK[dayCell.dayOfWeek].nameEn;

  el.modalBsDate.textContent = `${bsDay} ${monthName} ${bsYear}, ${dayNameNp}`;
  el.modalAdDate.textContent = `${dayCell.adDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (${dayNameEn})`;

  el.modalTithi.textContent = dayCell.tithi.name;
  el.modalPaksha.textContent = dayCell.tithi.paksha;
  el.modalNakshatra.textContent = dayCell.tithi.nakshatra;

  // Sun times for this date in Kathmandu
  const sun = calculateSunTimes(dayCell.adDate);
  el.modalSunTimes.textContent = `${sun.sunrise} / ${sun.sunset}`;

  // Festivals container
  el.modalFestivalsContainer.innerHTML = '';
  if (dayCell.festivals && dayCell.festivals.length > 0) {
    dayCell.festivals.forEach(f => {
      const fBox = document.createElement('div');
      fBox.style.cssText = 'padding: 0.75rem; border-radius: 8px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239,68,68,0.3); margin-bottom: 0.5rem;';
      fBox.innerHTML = `
        <div style="font-weight: 700; color: #fca5a5; font-size: 0.95rem;">${f.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${f.nameEn} ${f.desc ? `• ${f.desc}` : ''}</div>
      `;
      el.modalFestivalsContainer.appendChild(fBox);
    });
  } else if (dayCell.isSaturday) {
    const satBox = document.createElement('div');
    satBox.style.cssText = 'padding: 0.6rem; border-radius: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; font-size: 0.85rem; font-weight: 600;';
    satBox.textContent = 'शनिबार (साप्ताहिक बिदा / Official Weekend)';
    el.modalFestivalsContainer.appendChild(satBox);
  }

  renderModalNotes();
  el.dayDetailModal.classList.add('active');
}

function closeDayDetailModal() {
  el.dayDetailModal.classList.remove('active');
  state.selectedDayData = null;
  el.inputModalNote.value = '';
}

function renderModalNotes() {
  if (!state.selectedDayData) return;
  const { bsYear, bsMonth, bsDate } = state.selectedDayData;
  const notes = eventsStore.getEventsForDate(bsYear, bsMonth, bsDate);

  el.modalNotesList.innerHTML = '';
  if (notes.length === 0) {
    el.modalNotesList.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-dim);">कुनै व्यक्तिगत नोट राखिएको छैन।</div>';
    return;
  }

  notes.forEach(note => {
    const item = document.createElement('div');
    item.className = 'note-item';
    item.innerHTML = `
      <span>📌 ${note.title}</span>
      <button class="btn-delete-note" title="Delete note">🗑️</button>
    `;
    item.querySelector('.btn-delete-note').addEventListener('click', () => {
      eventsStore.deleteEvent(note.id);
      renderModalNotes();
      renderCalendar();
    });
    el.modalNotesList.appendChild(item);
  });
}

// Add Note Button
el.btnAddModalNote.addEventListener('click', () => {
  const text = el.inputModalNote.value.trim();
  if (!text || !state.selectedDayData) return;
  const { bsYear, bsMonth, bsDate } = state.selectedDayData;
  eventsStore.addEvent(bsYear, bsMonth, bsDate, text);
  el.inputModalNote.value = '';
  renderModalNotes();
  renderCalendar();
});

el.inputModalNote.addEventListener('keydown', e => {
  if (e.key === 'Enter') el.btnAddModalNote.click();
});

el.btnCloseDayModal.addEventListener('click', closeDayDetailModal);
el.dayDetailModal.addEventListener('click', e => {
  if (e.target === el.dayDetailModal) closeDayDetailModal();
});

// ============================================================================
// 5. CLOCK & ASTRONOMY SYNCHRONIZATION (EVERY SECOND)
// ============================================================================
digitalClock.subscribe(clock => {
  // Update Hero Clock Digits
  el.clockHours.textContent = clock.hours;
  el.clockMinutes.textContent = clock.minutes;
  el.clockSeconds.textContent = clock.seconds;
  el.clockAmPm.textContent = clock.ampm;
  el.clockAmPm.style.display = clock.is24Hour ? 'none' : 'block';

  // Second progress bar
  el.clockSecondBar.style.width = `${clock.secondProgress}%`;

  // Timezone label
  el.clockTzLabel.textContent = clock.tzLabel;

  // Dual dates
  const todayBs = getCurrentNepaliDate();
  const bsDay = state.useNepaliDigits ? toNepaliNumeral(todayBs.date) : todayBs.date;
  const bsYear = state.useNepaliDigits ? toNepaliNumeral(todayBs.year) : todayBs.year;
  const monthName = NEPALI_MONTHS[todayBs.month].nameNp;
  const dayNameNp = DAYS_OF_WEEK[todayBs.day].nameNp;

  el.clockNepaliDate.textContent = `${bsYear} ${monthName} ${bsDay}, ${dayNameNp}`;
  el.clockGregorianDate.textContent = clock.dateGregorian;

  // Tithi & Nakshatra
  const tithiInfo = clock.sunTimes ? clock.moonPhase : null;
  // Use vedic tithi calculated for today
  const calGrid = generateCalendarGrid(todayBs.year, todayBs.month);
  const todayCell = calGrid.grid.find(c => c.isToday);
  if (todayCell) {
    el.clockTithiTag.textContent = todayCell.tithi.fullName;
    el.clockNakshatra.textContent = `नक्षत्र: ${todayCell.tithi.nakshatra}`;
  }

  // Solar & Daylight Stats
  const st = clock.sunTimes;
  if (st) {
    el.statSunrise.textContent = st.sunrise;
    el.statSunset.textContent = st.sunset;
    el.statDayLength.textContent = st.dayLength;
    el.statSolarNoon.textContent = st.solarNoon;
    el.statDawn.textContent = st.dawn;
    el.statDusk.textContent = st.dusk;
    el.solarCountdownBadge.textContent = `${st.nextEvent} ${st.timeRemaining}`;

    // Update Sun Arc visual indicator
    // Arc path is: M 20 70 A 130 60 0 0 1 280 70
    // Parametric angle theta from PI to 0
    const p = st.daylightProgress / 100;
    const theta = Math.PI - (p * Math.PI);
    const sunX = 150 + 130 * Math.cos(theta);
    const sunY = 70 - 55 * Math.sin(theta);
    el.sunPositionIndicator.setAttribute('cx', Math.round(sunX));
    el.sunPositionIndicator.setAttribute('cy', Math.round(sunY));
  }

  // Moon Phase
  const mp = clock.moonPhase;
  if (mp) {
    el.moonPhaseName.textContent = mp.phaseName;
    el.moonPhaseNepali.textContent = mp.phaseNameNepali;
    el.moonIllumination.textContent = `${mp.illumination}% Illumination • Age: ${mp.ageDays} days`;
  }

  // Mini World Clocks
  renderMiniWorldClocks(clock.worldClocks);

  // Fullscreen Clock (if open)
  if (digitalClock.isFullscreen) {
    updateFullscreenClock(clock, todayCell);
  }
});

// Start Clock engine
digitalClock.start();

// ============================================================================
// 6. WORLD CLOCKS RENDERING
// ============================================================================
function renderMiniWorldClocks(cities) {
  // Show 4 representative cities in mini card
  const miniCities = cities.filter(c => ['delhi', 'dubai', 'london', 'newyork'].includes(c.id));
  el.miniWorldClocksContainer.innerHTML = '';

  miniCities.forEach(city => {
    const card = document.createElement('div');
    card.className = 'world-clock-mini-card';
    card.innerHTML = `
      <div class="wc-city-row">
        <span>${city.flag} ${city.name}</span>
        <span>${city.isDay ? '☀️' : '🌙'}</span>
      </div>
      <div class="wc-time-row">
        <span class="wc-digits">${city.hours}:${city.minutes}</span>
        <span class="wc-diff">${city.diff}</span>
      </div>
    `;
    el.miniWorldClocksContainer.appendChild(card);
  });
}

function renderExpandedWorldClocks() {
  const cities = WORLD_CITIES.map(city => {
    const timeInfo = digitalClock.getCityTime(city.timezone);
    const diff = digitalClock.getTimeDifferenceFromKathmandu(city.timezone);
    return { ...city, ...timeInfo, diff };
  });

  el.expandedWorldClocksGrid.innerHTML = '';
  cities.forEach(city => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '1.25rem';
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">${city.flag}</span>
          <div>
            <div style="font-weight: 700; font-size: 1.05rem;">${city.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${city.country} • ${city.timezone}</div>
          </div>
        </div>
        <span style="font-size: 1.25rem;">${city.isDay ? '☀️' : '🌙'}</span>
      </div>

      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 1rem;">
        <div style="font-family: var(--font-clock); font-size: 2.2rem; font-weight: 700; color: var(--clock-digit-color); line-height: 1;">
          ${city.hours}:${city.minutes}<span style="font-size: 1.1rem; color: var(--accent-gold); margin-left: 0.25rem;">:${city.seconds}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">${city.ampm}</div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-glass); font-size: 0.78rem;">
        <span style="color: var(--text-muted);">${city.dateStr}</span>
        <span style="color: var(--accent-gold); font-weight: 500;">${city.diff}</span>
      </div>
    `;
    el.expandedWorldClocksGrid.appendChild(card);
  });
}

// ============================================================================
// 7. FULLSCREEN MODE (LIKE timeanddate.com)
// ============================================================================
function openFullscreen() {
  digitalClock.isFullscreen = true;
  el.fullscreenClockOverlay.classList.add('active');

  // Request browser full screen if supported
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  // Update immediately
  digitalClock.tick();
}

function closeFullscreen() {
  digitalClock.isFullscreen = false;
  el.fullscreenClockOverlay.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreenClock(clock, todayCell) {
  el.fsHours.textContent = clock.hours;
  el.fsMinutes.textContent = clock.minutes;
  el.fsSeconds.textContent = clock.seconds;
  el.fsAmPm.textContent = clock.ampm;
  el.fsAmPm.style.display = clock.is24Hour ? 'none' : 'block';

  const todayBs = getCurrentNepaliDate();
  const bsDay = state.useNepaliDigits ? toNepaliNumeral(todayBs.date) : todayBs.date;
  const bsYear = state.useNepaliDigits ? toNepaliNumeral(todayBs.year) : todayBs.year;
  const monthName = NEPALI_MONTHS[todayBs.month].nameNp;
  const dayNameNp = DAYS_OF_WEEK[todayBs.day].nameNp;

  el.fsNepaliDate.textContent = `${bsYear} ${monthName} ${bsDay}, ${dayNameNp}`;
  el.fsGregorianDate.textContent = clock.dateGregorian;

  if (todayCell) {
    el.fsTithi.textContent = todayCell.tithi.fullName;
  }

  // Bottom Ticker
  el.fsBottomTicker.innerHTML = '';
  clock.worldClocks.slice(0, 6).forEach(c => {
    const item = document.createElement('div');
    item.className = 'fs-ticker-item';
    item.innerHTML = `
      <span class="fs-ticker-city">${c.flag} ${c.name}</span>
      <span class="fs-ticker-time">${c.hours}:${c.minutes} ${c.ampm}</span>
    `;
    el.fsBottomTicker.appendChild(item);
  });
}

// Fullscreen Event Listeners
el.btnFullscreenOpen.addEventListener('click', openFullscreen);
el.btnFullscreenClose.addEventListener('click', closeFullscreen);

// Fullscreen theme dots
el.fsThemeDots.forEach(dot => {
  dot.addEventListener('click', () => {
    el.fsThemeDots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    const themeClass = dot.getAttribute('data-theme');
    el.fullscreenClockOverlay.className = `fullscreen-overlay active ${themeClass}`;
    state.fullscreenTheme = themeClass;
  });
});

// Fullscreen 12h/24h toggle
el.btnFsFormatToggle.addEventListener('click', () => {
  digitalClock.toggle24Hour();
  el.btnFsFormatToggle.textContent = digitalClock.is24Hour ? '24H' : '12H';
  el.btnFormatToggle.textContent = digitalClock.is24Hour ? '24H' : '12H';
  el.btnFormatToggle.classList.toggle('active', digitalClock.is24Hour);
});

// Keyboard shortcuts: 'F' for fullscreen, 'Escape' to exit
document.addEventListener('keydown', e => {
  if ((e.key === 'f' || e.key === 'F') && !digitalClock.isFullscreen) {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      openFullscreen();
    }
  } else if (e.key === 'Escape') {
    if (digitalClock.isFullscreen) closeFullscreen();
    if (el.dayDetailModal.classList.contains('active')) closeDayDetailModal();
  }
});

// ============================================================================
// 8. CONTROLS & NAVIGATION LISTENERS
// ============================================================================

// Sound Chime toggle
el.btnSoundToggle.addEventListener('click', () => {
  soundFx.hourlyChimeEnabled = !soundFx.hourlyChimeEnabled;
  if (soundFx.hourlyChimeEnabled) {
    el.soundIcon.textContent = '🔔';
    el.soundLabel.textContent = 'Chime: On';
    el.btnSoundToggle.style.color = 'var(--accent-gold)';
    soundFx.playTibetanBowl(280, 2.5); // Preview chime
  } else {
    el.soundIcon.textContent = '🔕';
    el.soundLabel.textContent = 'Chime: Off';
    el.btnSoundToggle.style.color = 'var(--text-muted)';
  }
});

// Numerals Toggle (नेपाली ⇄ English)
el.btnNumeralsToggle.addEventListener('click', () => {
  state.useNepaliDigits = !state.useNepaliDigits;
  digitalClock.useNepaliDigits = state.useNepaliDigits;
  el.numeralToggleLabel.textContent = state.useNepaliDigits ? 'अंक: English' : 'अंक: १२३';
  initDropdowns();
  renderCalendar();
  digitalClock.tick();
});

// Dark/Light Theme toggle
el.btnThemeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('patro_theme', state.theme);
  el.themeIcon.textContent = state.theme === 'dark' ? '🌓' : '☀️';
});

// Format toggle (12h/24h)
el.btnFormatToggle.addEventListener('click', () => {
  digitalClock.toggle24Hour();
  el.btnFormatToggle.classList.toggle('active', digitalClock.is24Hour);
  el.btnFormatToggle.textContent = digitalClock.is24Hour ? '24H' : '12H';
  el.btnFsFormatToggle.textContent = digitalClock.is24Hour ? '24H' : '12H';
});

// Time mode toggle (Kathmandu NPT ⇄ Device Local)
el.btnTimeModeToggle.addEventListener('click', () => {
  digitalClock.toggleTimeMode();
  el.btnTimeModeToggle.textContent = digitalClock.timeMode === 'kathmandu' ? 'NPT' : 'LOCAL';
  el.btnTimeModeToggle.classList.toggle('active', digitalClock.timeMode === 'kathmandu');
});

// Clock tick sound toggle
el.btnTickSoundToggle.addEventListener('click', () => {
  soundFx.tickSoundEnabled = !soundFx.tickSoundEnabled;
  el.btnTickSoundToggle.classList.toggle('active', soundFx.tickSoundEnabled);
});

// Calendar Month & Year Navigation
el.btnPrevMonth.addEventListener('click', () => {
  if (state.viewBsMonth === 0) {
    state.viewBsMonth = 11;
    state.viewBsYear--;
  } else {
    state.viewBsMonth--;
  }
  renderCalendar();
});

el.btnNextMonth.addEventListener('click', () => {
  if (state.viewBsMonth === 11) {
    state.viewBsMonth = 0;
    state.viewBsYear++;
  } else {
    state.viewBsMonth++;
  }
  renderCalendar();
});

el.btnCurrentMonth.addEventListener('click', () => {
  const now = getCurrentNepaliDate();
  state.viewBsYear = now.year;
  state.viewBsMonth = now.month;
  renderCalendar();
});

el.selectBsYear.addEventListener('change', e => {
  state.viewBsYear = parseInt(e.target.value, 10);
  renderCalendar();
});

el.selectBsMonth.addEventListener('change', e => {
  state.viewBsMonth = parseInt(e.target.value, 10);
  renderCalendar();
});

// Tab Navigation
el.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    el.tabButtons.forEach(b => b.classList.remove('active'));
    el.tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'worldClockTab') {
      renderExpandedWorldClocks();
    }
  });
});

el.btnOpenWorldTab.addEventListener('click', () => {
  const worldTabBtn = document.querySelector('[data-tab="worldClockTab"]');
  if (worldTabBtn) worldTabBtn.click();
});

// ============================================================================
// 9. DATE CONVERTER ENGINE
// ============================================================================
el.btnConvertBsToAd.addEventListener('click', () => {
  const y = parseInt(el.inputBsYear.value, 10);
  const m = parseInt(el.selectConvBsMonth.value, 10);
  const d = parseInt(el.inputBsDay.value, 10);

  const res = convertBsToAd(y, m, d);
  el.resultBsToAd.style.display = 'flex';
  if (!res.success) {
    el.resultBsToAd.innerHTML = `<span style="color: var(--accent-red);">${res.error}</span>`;
    return;
  }

  el.resultBsToAd.innerHTML = `
    <div class="result-primary-text">📅 ${res.adDate.formatted}</div>
    <div class="result-secondary-text">${res.adDate.dayNameNp} • ${res.tithi.fullName} (${res.tithi.nameEn})</div>
    <div class="result-secondary-text" style="color: var(--accent-gold); font-weight: 600;">⏱️ ${res.diffText}</div>
  `;
});

el.btnConvertAdToBs.addEventListener('click', () => {
  const y = parseInt(el.inputAdYear.value, 10);
  const m = parseInt(el.selectConvAdMonth.value, 10);
  const d = parseInt(el.inputAdDay.value, 10);

  const res = convertAdToBs(y, m, d);
  el.resultAdToBs.style.display = 'flex';
  if (!res.success) {
    el.resultAdToBs.innerHTML = `<span style="color: var(--accent-red);">${res.error}</span>`;
    return;
  }

  el.resultAdToBs.innerHTML = `
    <div class="result-primary-text">📅 ${res.bsDate.formattedNp} वि.सं. (${res.bsDate.formattedEn} BS)</div>
    <div class="result-secondary-text">${res.adDate.dayNameNp} • ${res.tithi.fullName}</div>
    <div class="result-secondary-text" style="color: var(--accent-gold); font-weight: 600;">⏱️ ${res.diffText}</div>
  `;
});

// ============================================================================
// 10. STOPWATCH & FOCUS TIMER
// ============================================================================

// Stopwatch
function formatStopwatch(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

el.btnSwStart.addEventListener('click', () => {
  if (!state.stopwatch.running) {
    state.stopwatch.running = true;
    state.stopwatch.startTime = performance.now() - state.stopwatch.elapsedTime;
    el.btnSwStart.textContent = 'Pause';
    el.btnSwStart.classList.replace('btn-primary', 'btn');

    state.stopwatch.timerId = setInterval(() => {
      state.stopwatch.elapsedTime = performance.now() - state.stopwatch.startTime;
      el.stopwatchDisplay.textContent = formatStopwatch(state.stopwatch.elapsedTime);
    }, 10);
  } else {
    state.stopwatch.running = false;
    clearInterval(state.stopwatch.timerId);
    el.btnSwStart.textContent = 'Resume';
    el.btnSwStart.classList.replace('btn', 'btn-primary');
  }
});

el.btnSwLap.addEventListener('click', () => {
  if (state.stopwatch.elapsedTime === 0) return;
  const lapTime = formatStopwatch(state.stopwatch.elapsedTime);
  state.stopwatch.laps.unshift(lapTime);

  el.stopwatchLapsList.innerHTML = state.stopwatch.laps
    .map((lap, idx) => `<div style="display:flex; justify-content:space-between; padding: 0.25rem 0; border-bottom: 1px solid var(--border-glass);"><span>Lap ${state.stopwatch.laps.length - idx}</span><span>${lap}</span></div>`)
    .join('');
});

el.btnSwReset.addEventListener('click', () => {
  state.stopwatch.running = false;
  clearInterval(state.stopwatch.timerId);
  state.stopwatch.elapsedTime = 0;
  state.stopwatch.laps = [];
  el.stopwatchDisplay.textContent = '00:00.00';
  el.btnSwStart.textContent = 'Start';
  el.btnSwStart.className = 'btn btn-primary';
  el.stopwatchLapsList.innerHTML = '';
});

// Focus Countdown Timer
function formatCountdown(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

el.btnTimerStart.addEventListener('click', () => {
  if (!state.timer.running) {
    state.timer.running = true;
    el.btnTimerStart.style.display = 'none';
    el.btnTimerPause.style.display = 'inline-flex';

    state.timer.timerId = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        el.timerDisplay.textContent = formatCountdown(state.timer.remainingSeconds);
      } else {
        clearInterval(state.timer.timerId);
        state.timer.running = false;
        el.btnTimerStart.style.display = 'inline-flex';
        el.btnTimerPause.style.display = 'none';

        soundFx.playAlarmSound();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        alert('⏱️ Timer completed!');
      }
    }, 1000);
  }
});

el.btnTimerPause.addEventListener('click', () => {
  state.timer.running = false;
  clearInterval(state.timer.timerId);
  el.btnTimerStart.style.display = 'inline-flex';
  el.btnTimerPause.style.display = 'none';
});

el.btnTimerReset.addEventListener('click', () => {
  state.timer.running = false;
  clearInterval(state.timer.timerId);
  state.timer.remainingSeconds = state.timer.totalSeconds;
  el.timerDisplay.textContent = formatCountdown(state.timer.remainingSeconds);
  el.btnTimerStart.style.display = 'inline-flex';
  el.btnTimerPause.style.display = 'none';
});

el.presetTimerButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const mins = parseInt(btn.getAttribute('data-minutes'), 10);
    state.timer.totalSeconds = mins * 60;
    state.timer.remainingSeconds = state.timer.totalSeconds;
    el.timerDisplay.textContent = formatCountdown(state.timer.remainingSeconds);
    if (state.timer.running) {
      el.btnTimerPause.click();
    }
  });
});

// Hide pause button initially
el.btnTimerPause.style.display = 'none';

// ============================================================================
// 11. INITIAL BOOT
// ============================================================================
initDropdowns();
renderCalendar();
