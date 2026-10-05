// Astronomy calculations for Kathmandu, Nepal
// Coordinates: 27.7172° N, 85.3240° E, Altitude: ~1400m
// Timezone: UTC +5:45 (Nepal Standard Time)

export const KATHMANDU_COORDS = {
  lat: 27.7172,
  lng: 85.3240,
  elevation: 1400,
  tzOffsetMinutes: 5 * 60 + 45 // +345 minutes (+5:45)
};

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function getJulianDay(date) {
  const time = date.getTime();
  return (time / 86400000) + 2440587.5;
}

export function calculateSunTimes(date = new Date(), lat = KATHMANDU_COORDS.lat, lng = KATHMANDU_COORDS.lng) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jd = getJulianDay(startOfDay);
  const T = (jd - 2451545.0) / 36525.0;

  // Mean anomaly of the Sun
  const M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) % 360;
  const Mrad = M * RAD;

  // Equation of center
  const C = (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);

  // True longitude
  const L0 = 280.46646 + T * (36000.76983 + 0.0003032 * T);
  const sunTrueLon = (L0 + C) % 360;

  // Apparent longitude
  const omega = 125.04 - 1934.136 * T;
  const lambda = (sunTrueLon - 0.00569 - 0.00478 * Math.sin(omega * RAD)) % 360;

  // Mean obliquity
  const eps0 = 23 + (26 + ((21.448 - T * (46.8150 + T * (0.00059 - T * 0.001813)))) / 60) / 60;
  const eps = (eps0 + 0.00256 * Math.cos(omega * RAD)) * RAD;

  // Declination and Right Ascension
  const sinDec = Math.sin(eps) * Math.sin(lambda * RAD);
  const dec = Math.asin(sinDec);
  const cosDec = Math.cos(dec);

  // Equation of Time (in minutes)
  const y = Math.tan(eps / 2) * Math.tan(eps / 2);
  const L0rad = (L0 % 360) * RAD;
  const Etime = 4 * DEG * (
    y * Math.sin(2 * L0rad)
    - 2 * 0.016708634 * Math.sin(Mrad)
    + 4 * 0.016708634 * y * Math.sin(Mrad) * Math.cos(2 * L0rad)
    - 0.5 * y * y * Math.sin(4 * L0rad)
    - 1.25 * 0.016708634 * 0.016708634 * Math.sin(2 * Mrad)
  );

  // Solar noon in UTC hours
  const solarNoonUTC = (720 - 4 * lng - Etime) / 60;

  // Helper for zenith
  function getHourAngle(zenithDeg) {
    const latRad = lat * RAD;
    const cosHA = (Math.cos(zenithDeg * RAD) - Math.sin(latRad) * sinDec) / (Math.cos(latRad) * cosDec);
    if (cosHA > 1) return null; // Polar night
    if (cosHA < -1) return null; // Midnight sun
    return Math.acos(cosHA) * DEG / 15; // in hours
  }

  // Standard sunrise/sunset zenith with atmospheric refraction is 90.833°
  // For altitude ~1400m, dip correction = 0.0293 * sqrt(1400) ≈ 1.09° -> zenith ≈ 91.9°
  const haStandard = getHourAngle(90.833 + 0.03 * Math.sqrt(KATHMANDU_COORDS.elevation));
  const haCivilTwilight = getHourAngle(96.0); // -6 degrees

  // Nepal offset is +5.75 hours
  const tzOffset = 5.75;
  const solarNoonLocal = (solarNoonUTC + tzOffset + 24) % 24;

  let sunriseLocal = 6.0;
  let sunsetLocal = 18.0;
  let dawnLocal = 5.5;
  let duskLocal = 18.5;

  if (haStandard !== null) {
    sunriseLocal = (solarNoonUTC - haStandard + tzOffset + 24) % 24;
    sunsetLocal = (solarNoonUTC + haStandard + tzOffset + 24) % 24;
  }

  if (haCivilTwilight !== null) {
    dawnLocal = (solarNoonUTC - haCivilTwilight + tzOffset + 24) % 24;
    duskLocal = (solarNoonUTC + haCivilTwilight + tzOffset + 24) % 24;
  }

  const dayLengthHours = (sunsetLocal >= sunriseLocal) ? (sunsetLocal - sunriseLocal) : (24 - sunriseLocal + sunsetLocal);

  function formatTime(decimalHours) {
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  function formatTime24(decimalHours) {
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const dayHours = Math.floor(dayLengthHours);
  const dayMins = Math.round((dayLengthHours - dayHours) * 60);

  // Current status
  const currentNepalDate = getNepalCurrentDate();
  const currentHours = currentNepalDate.getHours() + currentNepalDate.getMinutes() / 60 + currentNepalDate.getSeconds() / 3600;

  const isDay = currentHours >= sunriseLocal && currentHours < sunsetLocal;
  let progress = 0;
  if (isDay) {
    progress = Math.min(100, Math.max(0, ((currentHours - sunriseLocal) / dayLengthHours) * 100));
  } else {
    // Night progress
    const nightLength = 24 - dayLengthHours;
    let nightElapsed = 0;
    if (currentHours >= sunsetLocal) {
      nightElapsed = currentHours - sunsetLocal;
    } else {
      nightElapsed = (24 - sunsetLocal) + currentHours;
    }
    progress = Math.min(100, Math.max(0, (nightElapsed / nightLength) * 100));
  }

  // Next event
  let nextEvent = '';
  let nextEventTime = '';
  let timeRemaining = '';

  if (currentHours < sunriseLocal) {
    nextEvent = 'Sunrise';
    nextEventTime = formatTime(sunriseLocal);
    const diffMins = Math.round((sunriseLocal - currentHours) * 60);
    timeRemaining = `in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  } else if (currentHours < sunsetLocal) {
    nextEvent = 'Sunset';
    nextEventTime = formatTime(sunsetLocal);
    const diffMins = Math.round((sunsetLocal - currentHours) * 60);
    timeRemaining = `in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  } else {
    nextEvent = 'Sunrise';
    nextEventTime = formatTime(sunriseLocal);
    const diffMins = Math.round((24 - currentHours + sunriseLocal) * 60);
    timeRemaining = `in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  }

  return {
    sunrise: formatTime(sunriseLocal),
    sunrise24: formatTime24(sunriseLocal),
    sunset: formatTime(sunsetLocal),
    sunset24: formatTime24(sunsetLocal),
    solarNoon: formatTime(solarNoonLocal),
    dawn: formatTime(dawnLocal),
    dusk: formatTime(duskLocal),
    dayLength: `${dayHours}h ${dayMins}m`,
    dayLengthDecimal: dayLengthHours,
    isDay,
    daylightProgress: Math.round(progress),
    nextEvent,
    nextEventTime,
    timeRemaining
  };
}

export function getNepalCurrentDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Nepal is UTC + 5:45
  return new Date(utc + (5.75 * 3600000));
}

export function calculateMoonPhase(date = new Date()) {
  // Known reference new moon: January 11, 2024 at 11:57 UTC
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.53058770576; // days
  const now = date.getTime();
  const diffDays = (now - refNewMoon) / (1000 * 60 * 60 * 24);
  const phaseCycle = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const phaseFraction = phaseCycle / synodicMonth; // 0 to 1

  // Illumination calculation (0 to 100%)
  const illumination = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

  let phaseName = '';
  let phaseNameNepali = '';
  let iconClass = 'moon';

  if (phaseFraction < 0.03 || phaseFraction > 0.97) {
    phaseName = 'New Moon';
    phaseNameNepali = 'औंसी (Amavasya)';
    iconClass = 'moon-new';
  } else if (phaseFraction < 0.22) {
    phaseName = 'Waxing Crescent';
    phaseNameNepali = 'शुक्ल प्रतिपदा - तृतीया';
    iconClass = 'moon-waxing-crescent';
  } else if (phaseFraction < 0.28) {
    phaseName = 'First Quarter';
    phaseNameNepali = 'शुक्ल अष्टमी';
    iconClass = 'moon-first-quarter';
  } else if (phaseFraction < 0.47) {
    phaseName = 'Waxing Gibbous';
    phaseNameNepali = 'शुक्ल एकादशी - चतुर्दशी';
    iconClass = 'moon-waxing-gibbous';
  } else if (phaseFraction < 0.53) {
    phaseName = 'Full Moon';
    phaseNameNepali = 'पूर्णिमा (Purnima)';
    iconClass = 'moon-full';
  } else if (phaseFraction < 0.72) {
    phaseName = 'Waning Gibbous';
    phaseNameNepali = 'कृष्ण प्रतिपदा - चतुर्थी';
    iconClass = 'moon-waning-gibbous';
  } else if (phaseFraction < 0.78) {
    phaseName = 'Last Quarter';
    phaseNameNepali = 'कृष्ण अष्टमी';
    iconClass = 'moon-last-quarter';
  } else {
    phaseName = 'Waning Crescent';
    phaseNameNepali = 'कृष्ण एकादशी - चतुर्दशी';
    iconClass = 'moon-waning-crescent';
  }

  return {
    phaseFraction,
    ageDays: phaseCycle.toFixed(1),
    illumination,
    phaseName,
    phaseNameNepali,
    iconClass,
    isFullMoon: phaseName === 'Full Moon',
    isNewMoon: phaseName === 'New Moon'
  };
}

// Vedic Tithi calculation based on Sun-Moon angular elongation
export function calculateVedicTithi(date = new Date()) {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525.0;

  // Moon's mean longitude
  const Lprime = 218.3164477 + 481267.88123421 * T;
  // Moon's mean elongation
  const D = 297.8501921 + 445267.1114034 * T;
  // Sun's mean anomaly
  const M = 357.5291092 + 35999.0502909 * T;
  // Moon's mean anomaly
  const Mprime = 134.9633964 + 477198.8675055 * T;

  // Longitudinal correction for Moon
  const dRad = D * RAD;
  const mRad = M * RAD;
  const mpRad = Mprime * RAD;

  const moonLon = Lprime 
    + 6.288774 * Math.sin(mpRad)
    + 1.274027 * Math.sin(2 * dRad - mpRad)
    + 0.658309 * Math.sin(2 * dRad)
    + 0.213618 * Math.sin(2 * mpRad)
    - 0.185116 * Math.sin(mRad);

  // Sun's true longitude
  const sunLon = (280.46646 + 36000.76983 * T + (1.9146 - 0.004817 * T) * Math.sin(mRad)) % 360;

  // Angular difference: Moon - Sun
  let diff = (moonLon - sunLon) % 360;
  if (diff < 0) diff += 360;

  // Each tithi is 12 degrees
  const tithiIndex = Math.floor(diff / 12); // 0 to 29
  const paksha = tithiIndex < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const pakshaEn = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  
  const tithiNames = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'औंसी'
  ];

  const tithiNamesEn = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
  ];

  // Nakshatras (27 lunar mansions)
  const nakshatraNames = [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
    'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
    'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
    'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
    'पूर्वाभाद्रपदा', 'उत्तराभाद्रपदा', 'रेवती'
  ];

  const nakshatraIndex = Math.floor(((moonLon % 360 + 360) % 360) / (360 / 27));

  return {
    tithiNumber: (tithiIndex % 15) + 1,
    rawIndex: tithiIndex,
    name: tithiNames[tithiIndex],
    nameEn: tithiNamesEn[tithiIndex],
    paksha,
    pakshaEn,
    fullName: `${paksha} ${tithiNames[tithiIndex]}`,
    fullNameEn: `${pakshaEn} ${tithiNamesEn[tithiIndex]}`,
    nakshatra: nakshatraNames[nakshatraIndex % 27]
  };
}
