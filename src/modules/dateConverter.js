import NepaliDatePackage from 'nepali-date-converter';
import { NEPALI_MONTHS, DAYS_OF_WEEK, toNepaliNumeral } from './nepaliCalendar.js';
import { calculateVedicTithi } from './astronomy.js';

const NepaliDate = NepaliDatePackage.default?.default || NepaliDatePackage.default || NepaliDatePackage;

export function convertBsToAd(bsYear, bsMonthIndex, bsDay) {
  try {
    const nepDate = new NepaliDate(Number(bsYear), Number(bsMonthIndex), Number(bsDay));
    const jsDate = nepDate.toJsDate();
    const tithi = calculateVedicTithi(jsDate);

    // Difference from today
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()).getTime();
    const diffDays = Math.round((targetMid - todayMid) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      bsDate: {
        year: Number(bsYear),
        month: Number(bsMonthIndex),
        monthNameNp: NEPALI_MONTHS[bsMonthIndex].nameNp,
        monthNameEn: NEPALI_MONTHS[bsMonthIndex].nameEn,
        day: Number(bsDay),
        dayNp: toNepaliNumeral(bsDay),
        yearNp: toNepaliNumeral(bsYear)
      },
      adDate: {
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        monthName: jsDate.toLocaleString('default', { month: 'long' }),
        day: jsDate.getDate(),
        dayOfWeek: jsDate.getDay(),
        dayName: DAYS_OF_WEEK[jsDate.getDay()].nameEn,
        dayNameNp: DAYS_OF_WEEK[jsDate.getDay()].nameNp,
        isoString: jsDate.toISOString().split('T')[0],
        formatted: jsDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      tithi,
      diffDays,
      diffText: diffDays === 0 ? 'Today' : (diffDays > 0 ? `In ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`)
    };
  } catch (err) {
    return { success: false, error: err.message || 'Invalid Nepali Date' };
  }
}

export function convertAdToBs(adYear, adMonth, adDay) {
  try {
    const jsDate = new Date(Number(adYear), Number(adMonth) - 1, Number(adDay));
    if (isNaN(jsDate.getTime())) {
      return { success: false, error: 'Invalid Gregorian Date' };
    }
    const nepDate = new NepaliDate(jsDate);
    const bsYear = nepDate.getYear();
    const bsMonth = nepDate.getMonth();
    const bsDayVal = nepDate.getDate();
    const tithi = calculateVedicTithi(jsDate);

    // Difference from today
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()).getTime();
    const diffDays = Math.round((targetMid - todayMid) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      bsDate: {
        year: bsYear,
        month: bsMonth,
        monthNameNp: NEPALI_MONTHS[bsMonth].nameNp,
        monthNameEn: NEPALI_MONTHS[bsMonth].nameEn,
        day: bsDayVal,
        dayNp: toNepaliNumeral(bsDayVal),
        yearNp: toNepaliNumeral(bsYear),
        formattedNp: `${toNepaliNumeral(bsYear)} ${NEPALI_MONTHS[bsMonth].nameNp} ${toNepaliNumeral(bsDayVal)}`,
        formattedEn: `${bsDayVal} ${NEPALI_MONTHS[bsMonth].nameEn} ${bsYear}`
      },
      adDate: {
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        monthName: jsDate.toLocaleString('default', { month: 'long' }),
        day: jsDate.getDate(),
        dayOfWeek: jsDate.getDay(),
        dayName: DAYS_OF_WEEK[jsDate.getDay()].nameEn,
        dayNameNp: DAYS_OF_WEEK[jsDate.getDay()].nameNp,
        formatted: jsDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      tithi,
      diffDays,
      diffText: diffDays === 0 ? 'Today' : (diffDays > 0 ? `In ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`)
    };
  } catch (err) {
    return { success: false, error: err.message || 'Error converting date' };
  }
}
