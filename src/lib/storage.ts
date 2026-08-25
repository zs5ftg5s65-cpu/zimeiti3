// 简单的 localStorage 封装，替代 @lark-apaas/client-toolkit-lite 的 scopedStorage
// 提供相同的 getItem / setItem / removeItem 接口

const PREFIX = "__app__";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // ignore quota errors
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export const scopedStorage = {
  getItem: safeGet,
  setItem: safeSet,
  removeItem: safeRemove,
};
