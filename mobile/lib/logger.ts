/**
 * Production-safe logger.
 * All output is suppressed when __DEV__ is false (Play Store builds).
 */
export const logger = {
  log: (...args: any[]) => __DEV__ && console.log('[AquariOS]', ...args),
  warn: (...args: any[]) => __DEV__ && console.warn('[AquariOS]', ...args),
  error: (...args: any[]) => __DEV__ && console.error('[AquariOS]', ...args),
};
