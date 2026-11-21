export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getWeekDates(targetDate: Date, includeWeekend = false): Date[] {
  const monday = getMonday(targetDate);
  const count = includeWeekend ? 7 : 5;
  const dates: Date[] = [];

  for (let i = 0; i < count; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    dates.push(nextDate);
  }

  return dates;
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function formatDateToDash(dateStr: string): string {
  // YYYYMMDD -> YYYY-MM-DD
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

export function parseYYYYMMDD(str: string): Date {
  const year = parseInt(str.substring(0, 4), 10);
  const month = parseInt(str.substring(4, 6), 10) - 1;
  const day = parseInt(str.substring(6, 8), 10);
  return new Date(year, month, day);
}

export function formatDateToKorean(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export const KOREAN_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function getDayOfWeekKorean(date: Date): string {
  return KOREAN_DAYS[date.getDay()];
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function addWeeks(date: Date, weeks: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export function getWeekRangeString(monday: Date, fridayOrSunday: Date): string {
  const startYear = monday.getFullYear();
  const endYear = fridayOrSunday.getFullYear();
  const startMonth = monday.getMonth() + 1;
  const endMonth = fridayOrSunday.getMonth() + 1;
  const startDay = monday.getDate();
  const endDay = fridayOrSunday.getDate();

  if (startYear !== endYear) {
    return `${startYear}년 ${startMonth}월 ${startDay}일 ~ ${endYear}년 ${endMonth}월 ${endDay}일`;
  }
  if (startMonth !== endMonth) {
    return `${startYear}년 ${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;
  }
  return `${startYear}년 ${startMonth}월 ${startDay}일 ~ ${endDay}일`;
}
