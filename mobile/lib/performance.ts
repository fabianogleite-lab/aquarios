/**
 * AquariOS Performance Telemetry
 *
 * Measures real user-perceived speed across mobile screens.
 * Targets: cold start ≤ 2.5s, transitions ≤ 300ms, touch-to-render ≤ 200ms
 *
 * Data flows to Supabase `performance_metrics` table.
 * HygeiOS monitors the `performance_summary` view for degradation.
 */
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import { getDeviceLocale } from './locale';
import { logger } from './logger';

// ─── Internal State ────────────────────────────────────────
let _sessionId: string | null = null;
let _appStartTime: number | null = null;
let _screenStartTimes: Map<string, number> = new Map();

const APP_VERSION = '4.7.0'; // sync with app.json

/** Generate a random session ID per app launch */
const getSessionId = (): string => {
  if (!_sessionId) {
    _sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return _sessionId;
};

// ─── Public API ────────────────────────────────────────────

/**
 * Call once in _layout.tsx when app starts.
 * Records the timestamp for cold start measurement.
 */
export const markAppStart = (): void => {
  _appStartTime = performance.now();
};

/**
 * Call when the first meaningful screen is visible.
 * Computes cold start duration.
 */
export const markAppReady = async (userId?: string): Promise<void> => {
  if (!_appStartTime) return;
  const coldStartMs = Math.round(performance.now() - _appStartTime);
  logger.log(`[Perf] Cold start: ${coldStartMs}ms (target ≤ 2500)`);
  await reportMetric(userId, { app_cold_start_ms: coldStartMs, screen_name: 'app_root' });
  _appStartTime = null;
};

/**
 * Call when navigating TO a screen. Records start timestamp.
 */
export const markScreenStart = (screenName: string): void => {
  _screenStartTimes.set(screenName, performance.now());
};

/**
 * Call when screen content is visible (after data loads).
 * Computes transition duration.
 */
export const markScreenReady = async (
  screenName: string,
  userId?: string,
): Promise<void> => {
  const start = _screenStartTimes.get(screenName);
  if (!start) return;
  const transitionMs = Math.round(performance.now() - start);
  _screenStartTimes.delete(screenName);
  logger.log(`[Perf] ${screenName}: ${transitionMs}ms (target ≤ 300)`);
  await reportMetric(userId, { screen_transition_ms: transitionMs, screen_name: screenName });
};

/**
 * Measure a user interaction (tap → re-render).
 * Wrap the action callback to measure its duration.
 */
export const measureInteraction = async <T>(
  screenName: string,
  action: () => Promise<T>,
  userId?: string,
): Promise<T> => {
  const start = performance.now();
  const result = await action();
  const touchMs = Math.round(performance.now() - start);
  logger.log(`[Perf] Interaction ${screenName}: ${touchMs}ms (target ≤ 200)`);
  // Only report if notably slow (reduce noise)
  if (touchMs > 100) {
    await reportMetric(userId, { touch_to_render_ms: touchMs, screen_name: screenName });
  }
  return result;
};

/**
 * Measure Supabase API round-trip time.
 * Use as wrapper: const data = await measureApi('meals_load', () => supabase.from(...));
 */
export const measureApi = async <T>(
  label: string,
  apiFn: () => Promise<T>,
  userId?: string,
): Promise<T> => {
  const start = performance.now();
  const result = await apiFn();
  const apiMs = Math.round(performance.now() - start);
  logger.log(`[Perf] API ${label}: ${apiMs}ms`);
  if (apiMs > 500) {
    await reportMetric(userId, { api_response_ms: apiMs, screen_name: label });
  }
  return result;
};

// ─── Internal Reporter ─────────────────────────────────────

interface MetricPayload {
  app_cold_start_ms?: number;
  app_warm_start_ms?: number;
  screen_transition_ms?: number;
  touch_to_render_ms?: number;
  fps_average?: number;
  api_response_ms?: number;
  screen_name?: string;
}

const reportMetric = async (
  userId: string | undefined,
  payload: MetricPayload,
): Promise<void> => {
  try {
    const netState = await NetInfo.fetch();
    const locale = getDeviceLocale();
    const countryCode = locale.split('-')[1] ?? locale.toUpperCase();

    const record = {
      user_id: userId ?? null,
      session_id: getSessionId(),
      platform: 'mobile' as const,
      device_model: (Platform.constants as any)?.Model ?? Platform.OS,
      os_version: `${Platform.OS} ${Platform.Version}`,
      app_version: APP_VERSION,
      network_type: netState.type === 'wifi' ? 'wifi'
        : netState.type === 'cellular'
          ? (netState.details as any)?.cellularGeneration ?? '4g'
          : netState.type,
      country_code: countryCode,
      ...payload,
    };

    // Fire-and-forget — never block UI for telemetry
    supabase.from('performance_metrics').insert(record).then(({ error }) => {
      if (error) logger.warn('[Perf] Report failed:', error.message);
    });
  } catch (err) {
    // Telemetry must never crash the app
    logger.warn('[Perf] Report error:', err);
  }
};

// ─── Thresholds (exported for HygeiOS dashboard) ──────────

export const PERFORMANCE_TARGETS = {
  cold_start_ms: 2500,
  warm_start_ms: 1000,
  screen_transition_ms: 300,
  touch_to_render_ms: 200,
  fps_min: 58,
  api_response_ms: 1000,
  // Web Core Web Vitals (for future web version)
  lcp_ms: 2500,
  inp_ms: 200,
  cls_max: 0.1,
  fcp_ms: 1800,
  ttfb_ms: 800,
} as const;
