import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface XPResult {
  total: number;
  level: number;
  nextLevelXP: number;
  newBadge?: string;
}

// XP required to reach each level (exponential growth)
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export function useXP() {
  const { user } = useAuthStore();
  const [totalXP, setTotalXP] = useState(0);

  // Load current totalXP on mount so components can display it immediately
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.total_xp) setTotalXP(data.total_xp);
      });
  }, [user?.id]);

  const logXP = useCallback(
    async (action: string, xpAmount: number, module?: string): Promise<XPResult> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Insert into xp_log
      const { data: logData, error: logError } = await supabase
        .from('xp_log')
        .insert([{ user_id: user.id, action, xp_earned: xpAmount, module }])
        .select();

      if (logError) throw logError;

      // Get total XP
      const { data: xpData, error: xpError } = await supabase
        .from('xp_log')
        .select('xp_earned')
        .eq('user_id', user.id);

      if (xpError) throw xpError;

      const total = (xpData || []).reduce((sum, record) => sum + record.xp_earned, 0);
      setTotalXP(total);

      // Calculate level
      const level = LEVEL_THRESHOLDS.findIndex((threshold) => total < threshold) - 1 || LEVEL_THRESHOLDS.length - 1;
      const nextLevelXP = LEVEL_THRESHOLDS[Math.min(level + 1, LEVEL_THRESHOLDS.length - 1)] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

      // Check for new badge unlock
      let newBadge: string | undefined;
      const { data: badgeData } = await supabase
        .from('badges')
        .select('badge_key')
        .eq('user_id', user.id)
        .eq('badge_key', `level_${level}`);

      if (!badgeData || badgeData.length === 0) {
        // Badge not yet unlocked for this level
        const { error: badgeError } = await supabase.from('badges').insert([
          {
            user_id: user.id,
            badge_key: `level_${level}`,
            unlocked_at: new Date().toISOString(),
          },
        ]);

        if (!badgeError) {
          newBadge = `level_${level}`;
        }
      }

      return {
        total,
        level,
        nextLevelXP,
        newBadge,
      };
    },
    [user?.id]
  );

  return { logXP, totalXP };
}
