/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
import dayjs, { type ConfigType } from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

export function formatToDateTime(
  date: ConfigType = undefined,
  format: string = DATE_TIME_FORMAT,
): string {
  if (date) return dayjs(date).format(format);
  return '';
}

export function formatToDate(
  date: ConfigType = undefined,
  format: string = DATE_FORMAT,
): string {
  if (date) return dayjs(date).format(format);
  return '';
}

export const date = dayjs;
