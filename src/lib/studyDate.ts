// 30天学习计划：Day ↔ 真实日期 的统一映射（全部使用本地时区，避免 UTC 差一天）
// 数据兼容说明：
// - 只新增一个 localStorage key：__app_study_start_date（经 scopedStorage 加前缀）
// - 不修改/删除任何既有 key；开始日期只在"不存在时"建立一次，之后永不被 new Date() 覆盖
import { scopedStorage } from './storage';

const START_KEY = '__app_study_start_date';
const WEEKDAYS_CN = ['日', '一', '二', '三', '四', '五', '六'];
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 本地时区 Date -> 'YYYY-MM-DD'（用本地年月日，不用 toISOString，避免 UTC 偏移） */
export function toISODateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' -> 本地时区 Date（时间固定为 12:00，规避夏令时/跨日边界） */
export function parseISODateLocal(iso: string): Date {
  const [y, m, dd] = iso.split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, dd || 1, 12, 0, 0, 0);
}

export function todayISOLocal(): string {
  return toISODateLocal(new Date());
}

export function isValidISODate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return !Number.isNaN(parseISODateLocal(s).getTime());
}

export function addDaysLocal(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** 第 day 天（1..30）对应的日期 = 开始日期 + (day-1) 天，本地计算 */
export function computeDayDate(startISO: string, day: number): Date {
  const clamped = Math.min(30, Math.max(1, Math.floor(day) || 1));
  return addDaysLocal(parseISODateLocal(startISO), clamped - 1);
}

/** 读取已保存的开始日期；不存在/损坏时返回 null（不会在此自动生成） */
export function getStartDateISO(): string | null {
  const raw = scopedStorage.getItem(START_KEY);
  return isValidISODate(raw) ? raw : null;
}

/**
 * 第一次正式开始计划时建立开始日期并持久化。
 * 已存在则原样返回——绝不用当前日期覆盖已有开始日期。
 */
export function ensureStartDateISO(): string {
  const existing = getStartDateISO();
  if (existing) return existing;
  const iso = todayISOLocal();
  scopedStorage.setItem(START_KEY, iso);
  return iso;
}

/** 用户显式"重置计划"时调用，清除开始日期，下次进入会重新建立 */
export function resetStartDateISO(): void {
  scopedStorage.removeItem(START_KEY);
}

/** 任意组件取某一天对应日期（内部幂等确保开始日期已建立） */
export function getDayDate(day: number): Date {
  return computeDayDate(ensureStartDateISO(), day);
}

export function formatDateCN(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateISO(d: Date): string {
  return toISODateLocal(d);
}

export function weekdayCN(d: Date): string {
  return WEEKDAYS_CN[d.getDay()];
}

/** 一行式中文：2026年8月30日 星期日 */
export function formatDayLabelCN(day: number): string {
  const d = getDayDate(day);
  return `${formatDateCN(d)} 星期${weekdayCN(d)}`;
}

/**
 * 今天对应计划第几天（基于开始日期，本地计算）。
 * 开始前(<1)或已结束(>30)返回 null；用于"回到今天"，绝不自动覆盖用户选中的 Day。
 */
export function getTodayDay(startISO?: string): number | null {
  const start = startISO ?? getStartDateISO();
  if (!start || !isValidISODate(start)) return null;
  const diff = Math.round(
    (parseISODateLocal(todayISOLocal()).getTime() - parseISODateLocal(start).getTime()) / DAY_MS,
  ) + 1;
  if (diff < 1 || diff > 30) return null;
  return diff;
}
