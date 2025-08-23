import { DateTime } from 'luxon';

export function tzNow(tz = 'UTC') {
  return DateTime.now().setZone(tz);
}
export function startOfDay(d: Date | string, tz = 'UTC') {
  return DateTime.fromJSDate(new Date(d)).setZone(tz).startOf('day').toJSDate();
}
export function endOfDay(d: Date | string, tz = 'UTC') {
  return DateTime.fromJSDate(new Date(d)).setZone(tz).endOf('day').toJSDate();
}
export function isoDateOnly(d: Date | string, tz = 'UTC') {
  return DateTime.fromJSDate(new Date(d)).setZone(tz).toISODate();
}
