import NepaliDatePackage from 'nepali-date-converter';
import { calculateVedicTithi } from './astronomy.js';

const NepaliDate = NepaliDatePackage.default?.default || NepaliDatePackage.default || NepaliDatePackage;

export const NEPALI_MONTHS = [
  { nameNp: 'वैशाख', nameEn: 'Baisakh', shortEn: 'Bai', season: 'वसन्त (Spring)' },
  { nameNp: 'जेठ', nameEn: 'Jestha', shortEn: 'Jes', season: 'ग्रीष्म (Summer)' },
  { nameNp: 'असार', nameEn: 'Ashadh', shortEn: 'Ash', season: 'वर्षा (Monsoon)' },
  { nameNp: 'साउन', nameEn: 'Shrawan', shortEn: 'Shr', season: 'वर्षा (Monsoon)' },
  { nameNp: 'भदौ', nameEn: 'Bhadra', shortEn: 'Bha', season: 'शरद (Autumn)' },
  { nameNp: 'असोज', nameEn: 'Ashwin', shortEn: 'Asw', season: 'शरद (Autumn)' },
  { nameNp: 'कात्तिक', nameEn: 'Kartik', shortEn: 'Kar', season: 'हेमन्त (Pre-Winter)' },
  { nameNp: 'मङ्सिर', nameEn: 'Mangsir', shortEn: 'Man', season: 'हेमन्त (Pre-Winter)' },
  { nameNp: 'पुस', nameEn: 'Poush', shortEn: 'Pou', season: 'शिशिर (Winter)' },
  { nameNp: 'माघ', nameEn: 'Magh', shortEn: 'Mag', season: 'शिशिर (Winter)' },
  { nameNp: 'फागुन', nameEn: 'Falgun', shortEn: 'Fal', season: 'वसन्त (Spring)' },
  { nameNp: 'चैत', nameEn: 'Chaitra', shortEn: 'Cha', season: 'वसन्त (Spring)' }
];

export const DAYS_OF_WEEK = [
  { nameNp: 'आइतबार', shortNp: 'आइत', nameEn: 'Sunday', shortEn: 'Sun', color: 'normal' },
  { nameNp: 'सोमबार', shortNp: 'सोम', nameEn: 'Monday', shortEn: 'Mon', color: 'normal' },
  { nameNp: 'मङ्गलबार', shortNp: 'मङ्गल', nameEn: 'Tuesday', shortEn: 'Tue', color: 'normal' },
  { nameNp: 'बुधबार', shortNp: 'बुध', nameEn: 'Wednesday', shortEn: 'Wed', color: 'normal' },
  { nameNp: 'बिहीबार', shortNp: 'बिही', nameEn: 'Thursday', shortEn: 'Thu', color: 'normal' },
  { nameNp: 'शुक्रबार', shortNp: 'शुक्र', nameEn: 'Friday', shortEn: 'Fri', color: 'normal' },
  { nameNp: 'शनिबार', shortNp: 'शनि', nameEn: 'Saturday', shortEn: 'Sat', color: 'holiday' }
];

export const NEPALI_NUMERALS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliNumeral(num) {
  if (num === null || num === undefined) return '';
  return num.toString().split('').map(char => {
    const digit = parseInt(char, 10);
    return isNaN(digit) ? char : NEPALI_NUMERALS[digit];
  }).join('');
}

export function toEnglishNumeral(nepaliStr) {
  if (!nepaliStr) return '';
  let str = nepaliStr.toString();
  NEPALI_NUMERALS.forEach((np, idx) => {
    str = str.replaceAll(np, idx.toString());
  });
  return str;
}

// Fixed solar date festivals (by BS Month 0..11 and BS Day 1..32)
const FIXED_FESTIVALS = {
  '0-1': { name: 'नयाँ वर्ष / नववर्ष', nameEn: 'Nepali New Year', isHoliday: true, desc: 'Bikram Sambat New Year celebration' },
  '0-11': { name: 'लोकतन्त्र दिवस', nameEn: 'Democracy Day', isHoliday: false, desc: 'Celebration of restoration of democracy' },
  '1-15': { name: 'गणतन्त्र दिवस', nameEn: 'Republic Day', isHoliday: true, desc: 'Commemoration of Republic Day in Nepal' },
  '2-15': { name: 'राष्ट्रिय धान दिवस / असार १५', nameEn: 'National Paddy Day', isHoliday: false, desc: 'Ropai & Dahi-Chiura feast day' },
  '3-1': { name: 'साउने सङ्क्रान्ति / कर्कट सङ्क्रान्ति', nameEn: 'Saune Sankranti', isHoliday: false, desc: 'Lute Kholne and monsoon feast' },
  '5-3': { name: 'संविधान दिवस', nameEn: 'Constitution Day', isHoliday: true, desc: 'Promulgation of Constitution of Nepal' },
  '8-15': { name: 'तमु ल्होसार', nameEn: 'Tamu Lhosar', isHoliday: true, desc: 'Gurung community New Year' },
  '9-1': { name: 'माघे सङ्क्रान्ति / मकर सङ्क्रान्ति', nameEn: 'Maghe Sankranti', isHoliday: true, desc: 'Ghiu Chaku and Tarul eating festival' },
  '9-16': { name: 'शहीद दिवस', nameEn: 'Martyrs\' Day', isHoliday: false, desc: 'Tribute to national martyrs' },
  '10-7': { name: 'राष्ट्रिय प्रजातन्त्र दिवस', nameEn: 'National Democracy Day', isHoliday: true, desc: 'Historic 2007 BS democracy day' },
  '10-24': { name: 'अन्तर्राष्ट्रिय महिला दिवस', nameEn: 'International Women\'s Day', isHoliday: true, desc: 'Global celebration of women\'s rights' }
};

// Lunar-based festival mapping: { [month-paksha-tithi]: festivalInfo }
// month: 0..11, paksha: 'shukla'|'krishna', tithi: 1..15
const LUNAR_FESTIVALS = {
  // Baisakh (0)
  '0-krishna-15': { name: 'मातातीर्थ औंसी (आमाको मुख हेर्ने दिन)', nameEn: 'Mother\'s Day (Matatirtha)', isHoliday: false },
  '0-shukla-3': { name: 'अक्षय तृतीया', nameEn: 'Akshaya Tritiya', isHoliday: false },
  '0-shukla-15': { name: 'बुद्ध जयन्ती / उभौली पर्व', nameEn: 'Buddha Jayanti / Ubhauli', isHoliday: true },

  // Jestha (1)
  '1-shukla-10': { name: 'गङ्गा दशहरा', nameEn: 'Ganga Dussehra', isHoliday: false },
  '1-shukla-15': { name: 'जेष्ठ पूर्णिमा / पनौती जात्रा', nameEn: 'Jestha Purnima', isHoliday: false },

  // Ashadh (2)
  '2-shukla-11': { name: 'हरिशयनी एकादशी (तुलसी रोप्ने दिन)', nameEn: 'Harishayani Ekadashi', isHoliday: false },
  '2-shukla-15': { name: 'गुरु पूर्णिमा / व्यास जयन्ती', nameEn: 'Guru Purnima', isHoliday: false },

  // Shrawan (3)
  '3-shukla-5': { name: 'नाग पञ्चमी', nameEn: 'Nag Panchami', isHoliday: false },
  '3-shukla-15': { name: 'जनै पूर्णिमा / रक्षाबन्धन / क्वाँटी खाने दिन', nameEn: 'Janai Purnima / Raksha Bandhan', isHoliday: true },

  // Bhadra (4)
  '4-krishna-1': { name: 'गाईजात्रा', nameEn: 'Gai Jatra', isHoliday: true },
  '4-krishna-8': { name: 'श्रीकृष्ण जन्माष्टमी', nameEn: 'Krishna Janmashtami', isHoliday: true },
  '4-krishna-15': { name: 'कुशे औंसी (बुबाको मुख हेर्ने दिन)', nameEn: 'Father\'s Day (Kushe Aunsi)', isHoliday: false },
  '4-shukla-3': { name: 'हरितालिका तीज', nameEn: 'Haritalika Teej', isHoliday: true },
  '4-shukla-4': { name: 'गणेश चतुर्थी', nameEn: 'Ganesh Chaturthi', isHoliday: false },
  '4-shukla-5': { name: 'ऋषि पञ्चमी', nameEn: 'Rishi Panchami', isHoliday: false },
  '4-shukla-14': { name: 'इन्द्रजात्रा (काठमाडौं उपत्यका)', nameEn: 'Indra Jatra', isHoliday: true },

  // Ashwin (5) - Dashain Season!
  '5-shukla-1': { name: 'घटस्थापना (दशैं आरम्भ)', nameEn: 'Ghatasthapana (Dashain Begins)', isHoliday: true },
  '5-shukla-7': { name: 'फूलपाती', nameEn: 'Phulpati', isHoliday: true },
  '5-shukla-8': { name: 'महाअष्टमी / कालरात्रि', nameEn: 'Maha Ashtami', isHoliday: true },
  '5-shukla-9': { name: 'महानवमी / आयुध पूजा', nameEn: 'Maha Navami', isHoliday: true },
  '5-shukla-10': { name: 'विजयादशमी / बडादशैं (टीका)', nameEn: 'Vijaya Dashami (Tika)', isHoliday: true },
  '5-shukla-11': { name: 'एकादशी (दशैं टीका)', nameEn: 'Papankusha Ekadashi', isHoliday: true },
  '5-shukla-15': { name: 'कोजाग्रत पूर्णिमा (दशैं समापन)', nameEn: 'Kojagrat Purnima', isHoliday: false },

  // Kartik (6) - Tihar Season!
  '6-krishna-13': { name: 'काग तिहार / धनतेरस', nameEn: 'Kaag Tihar / Dhanteras', isHoliday: false },
  '6-krishna-14': { name: 'कुकुर तिहार / नरक चतुर्दशी', nameEn: 'Kukur Tihar', isHoliday: false },
  '6-krishna-15': { name: 'लक्ष्मी पूजा / दीपावली / सुखरात्री', nameEn: 'Laxmi Puja / Deepawali', isHoliday: true },
  '6-shukla-1': { name: 'गोवर्धन पूजा / म्ह: पूजा / नेपाल संवत्', nameEn: 'Govardhan Puja / Mha Puja', isHoliday: true },
  '6-shukla-2': { name: 'भाइटीका / किजापूजा', nameEn: 'Bhai Tika', isHoliday: true },
  '6-shukla-6': { name: 'छठ पर्व (सूर्य पूजा)', nameEn: 'Chhath Parva', isHoliday: true },
  '6-shukla-11': { name: 'हरिबोधिनी एकादशी (तुलसी विवाह)', nameEn: 'Haribodhini Ekadashi', isHoliday: false },

  // Mangsir (7)
  '7-shukla-15': { name: 'उधौली पर्व / योमरी पुन्ही', nameEn: 'Udhauli / Yomari Punhi', isHoliday: true },

  // Poush (8)
  '8-shukla-15': { name: 'पौष पूर्णिमा / स्वस्थानी व्रत प्रारम्भ', nameEn: 'Swasthani Brata Begins', isHoliday: false },

  // Magh (9)
  '9-shukla-1': { name: 'सोनाम ल्होसार', nameEn: 'Sonam Lhosar', isHoliday: true },
  '9-shukla-5': { name: 'श्रीपञ्चमी / वसन्त पञ्चमी (सरस्वती पूजा)', nameEn: 'Saraswati Puja', isHoliday: false },
  '9-shukla-15': { name: 'माघ पूर्णिमा', nameEn: 'Magh Purnima', isHoliday: false },

  // Falgun (10)
  '10-krishna-14': { name: 'महाशिवरात्रि / सेना दिवस', nameEn: 'Maha Shivaratri', isHoliday: true },
  '10-shukla-1': { name: 'ग्याल्पो ल्होसार', nameEn: 'Gyalpo Lhosar', isHoliday: true },
  '10-shukla-15': { name: 'फागु पूर्णिमा (होली - पहाड/तराई)', nameEn: 'Holi / Fagu Purnima', isHoliday: true },

  // Chaitra (11)
  '11-krishna-14': { name: 'घोडेजात्रा (काठमाडौं उपत्यका)', nameEn: 'Ghode Jatra', isHoliday: true },
  '11-shukla-8': { name: 'चैते दशैं', nameEn: 'Chaite Dashain', isHoliday: false },
  '11-shukla-9': { name: 'राम नवमी', nameEn: 'Ram Navami', isHoliday: true }
};

export function getFestivalsForDate(bsYear, bsMonth, bsDay, adDate) {
  const festivals = [];
  const fixedKey = `${bsMonth}-${bsDay}`;
  if (FIXED_FESTIVALS[fixedKey]) {
    festivals.push(FIXED_FESTIVALS[fixedKey]);
  }

  // Check lunar festivals
  const tithiInfo = calculateVedicTithi(adDate);
  const pakshaKey = tithiInfo.pakshaEn.toLowerCase().includes('shukla') ? 'shukla' : 'krishna';
  const lunarKey = `${bsMonth}-${pakshaKey}-${tithiInfo.tithiNumber}`;

  if (LUNAR_FESTIVALS[lunarKey]) {
    festivals.push(LUNAR_FESTIVALS[lunarKey]);
  }

  // Christmas on Dec 25
  if (adDate.getMonth() === 11 && adDate.getDate() === 25) {
    festivals.push({ name: 'क्रिसमस डे', nameEn: 'Christmas Day', isHoliday: true, desc: 'Celebration of Christmas' });
  }

  return festivals;
}

export function getCurrentNepaliDate() {
  const d = new NepaliDate();
  return {
    year: d.getYear(),
    month: d.getMonth(),
    date: d.getDate(),
    day: d.getDay(),
    raw: d
  };
}

export function getDaysInNepaliMonth(bsYear, bsMonth) {
  // Use NepaliDate internally to find the month days
  // Month is 0-indexed (0 = Baisakh, 11 = Chaitra)
  try {
    const testDate = new NepaliDate(bsYear, bsMonth, 1);
    // Find last valid day by testing up to 33
    for (let day = 32; day >= 28; day--) {
      try {
        const testD = new NepaliDate(bsYear, bsMonth, day);
        if (testD.getMonth() === bsMonth) {
          return day;
        }
      } catch (e) {
        continue;
      }
    }
  } catch (err) {
    // Fallback standard average
    return 30;
  }
  return 30;
}

export function generateCalendarGrid(bsYear, bsMonth) {
  const daysInMonth = getDaysInNepaliMonth(bsYear, bsMonth);
  const firstDay = new NepaliDate(bsYear, bsMonth, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  const today = getCurrentNepaliDate();

  // Trailing days from previous month
  const prevMonthIndex = bsMonth === 0 ? 11 : bsMonth - 1;
  const prevMonthYear = bsMonth === 0 ? bsYear - 1 : bsYear;
  const daysInPrevMonth = getDaysInNepaliMonth(prevMonthYear, prevMonthIndex);

  const grid = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const pDate = daysInPrevMonth - i;
    const nepDate = new NepaliDate(prevMonthYear, prevMonthIndex, pDate);
    const jsDate = nepDate.toJsDate();
    const tithi = calculateVedicTithi(jsDate);
    const festivals = getFestivalsForDate(prevMonthYear, prevMonthIndex, pDate, jsDate);
    const isSat = nepDate.getDay() === 6;

    grid.push({
      bsYear: prevMonthYear,
      bsMonth: prevMonthIndex,
      bsDate: pDate,
      adDate: jsDate,
      adYear: jsDate.getFullYear(),
      adMonth: jsDate.getMonth(),
      adDay: jsDate.getDate(),
      dayOfWeek: nepDate.getDay(),
      isCurrentMonth: false,
      isToday: false,
      isSaturday: isSat,
      isHoliday: isSat || festivals.some(f => f.isHoliday),
      tithi,
      festivals
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const nepDate = new NepaliDate(bsYear, bsMonth, d);
    const jsDate = nepDate.toJsDate();
    const tithi = calculateVedicTithi(jsDate);
    const festivals = getFestivalsForDate(bsYear, bsMonth, d, jsDate);
    const isSat = nepDate.getDay() === 6;
    const isToday = (bsYear === today.year && bsMonth === today.month && d === today.date);

    grid.push({
      bsYear,
      bsMonth,
      bsDate: d,
      adDate: jsDate,
      adYear: jsDate.getFullYear(),
      adMonth: jsDate.getMonth(),
      adDay: jsDate.getDate(),
      dayOfWeek: nepDate.getDay(),
      isCurrentMonth: true,
      isToday,
      isSaturday: isSat,
      isHoliday: isSat || festivals.some(f => f.isHoliday),
      tithi,
      festivals
    });
  }

  // Next month leading days (fill to multiple of 7, either 35 or 42)
  const remaining = (7 - (grid.length % 7)) % 7;
  const totalNeeded = grid.length + remaining < 35 ? 35 : (grid.length + remaining < 42 ? 42 : grid.length + remaining);
  const nextMonthIndex = bsMonth === 11 ? 0 : bsMonth + 1;
  const nextMonthYear = bsMonth === 11 ? bsYear + 1 : bsYear;

  let nextDayCount = 1;
  while (grid.length < totalNeeded) {
    const nepDate = new NepaliDate(nextMonthYear, nextMonthIndex, nextDayCount);
    const jsDate = nepDate.toJsDate();
    const tithi = calculateVedicTithi(jsDate);
    const festivals = getFestivalsForDate(nextMonthYear, nextMonthIndex, nextDayCount, jsDate);
    const isSat = nepDate.getDay() === 6;

    grid.push({
      bsYear: nextMonthYear,
      bsMonth: nextMonthIndex,
      bsDate: nextDayCount,
      adDate: jsDate,
      adYear: jsDate.getFullYear(),
      adMonth: jsDate.getMonth(),
      adDay: jsDate.getDate(),
      dayOfWeek: nepDate.getDay(),
      isCurrentMonth: false,
      isToday: false,
      isSaturday: isSat,
      isHoliday: isSat || festivals.some(f => f.isHoliday),
      tithi,
      festivals
    });
    nextDayCount++;
  }

  // Gregorian range for the header
  const firstGridDay = grid.find(g => g.isCurrentMonth && g.bsDate === 1);
  const lastGridDay = grid.find(g => g.isCurrentMonth && g.bsDate === daysInMonth);
  const gregorianMonthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let adRangeStr = '';
  if (firstGridDay && lastGridDay) {
    const m1 = gregorianMonthsEn[firstGridDay.adMonth];
    const m2 = gregorianMonthsEn[lastGridDay.adMonth];
    const y1 = firstGridDay.adYear;
    const y2 = lastGridDay.adYear;
    if (m1 === m2) {
      adRangeStr = `${m1} ${y1}`;
    } else if (y1 === y2) {
      adRangeStr = `${m1} / ${m2} ${y1}`;
    } else {
      adRangeStr = `${m1} ${y1} / ${m2} ${y2}`;
    }
  }

  return {
    bsYear,
    bsMonth,
    monthNameNp: NEPALI_MONTHS[bsMonth].nameNp,
    monthNameEn: NEPALI_MONTHS[bsMonth].nameEn,
    season: NEPALI_MONTHS[bsMonth].season,
    daysInMonth,
    adRange: adRangeStr,
    grid
  };
}
