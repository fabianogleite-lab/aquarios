import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { getModuleConfig } from '../config/modules-registry';

interface GateStatus {
  locked: boolean;
  reason?: string;
  requirement?: string;
  currentValue?: number;
}

export function useGate(moduleId: string) {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<GateStatus>({ locked: true });
  const [loading, setLoading] = useState(true);

  const checkGate = useCallback(async () => {
    if (!user?.id) {
      setStatus({ locked: true, reason: 'Not authenticated' });
      setLoading(false);
      return;
    }

    try {
      // Use static registry (avoids dynamic import bundler issues)
      const config = getModuleConfig(moduleId);

      if (!config || !config.gate) {
        setStatus({ locked: false });
        setLoading(false);
        return;
      }

      const gate = config.gate;
      let isLocked = false;
      let reason = '';
      let currentValue = 0;
      let requirement = '';

      switch (gate.type) {
        case 'xp': {
          const { data: xpData } = await supabase
            .from('xp_log')
            .select('xp_earned')
            .eq('user_id', user.id);

          const totalXP = (xpData || []).reduce((sum, record) => sum + record.xp_earned, 0);
          const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
          const level = levelThresholds.findIndex((threshold) => totalXP < threshold) - 1 || levelThresholds.length - 1;

          currentValue = level;
          requirement = `Level ${gate.min_level || 0}`;
          isLocked = level < (gate.min_level || 0);
          reason = isLocked ? `Requires level ${gate.min_level || 0}, you have level ${level}` : '';
          break;
        }

        case 'tokens': {
          const { data: tokenData } = await supabase
            .from('user_tokens')
            .select('amount, expires_at')
            .eq('user_id', user.id);

          const now = new Date();
          const total = (tokenData || [])
            .filter((t) => !t.expires_at || new Date(t.expires_at) > now)
            .reduce((sum, t) => sum + t.amount, 0);

          currentValue = total;
          requirement = `${gate.min_tokens || 0} tokens`;
          isLocked = total < (gate.min_tokens || 0);
          reason = isLocked ? `Requires ${gate.min_tokens || 0} tokens, you have ${total}` : '';
          break;
        }

        case 'plan': {
          const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single();

          const userPlan = profileData?.plan || 'free';
          const planHierarchy: Record<string, number> = { free: 0, starter: 1, pro: 2, premium: 3 };
          const requiredPlanLevel = planHierarchy[gate.min_plan || 'starter'] || 1;
          const userPlanLevel = planHierarchy[userPlan] || 0;

          currentValue = userPlanLevel;
          requirement = `${gate.min_plan || 'Starter'} plan`;
          isLocked = userPlanLevel < requiredPlanLevel;
          reason = isLocked ? `Requires ${gate.min_plan || 'Starter'} plan or higher` : '';
          break;
        }
      }

      setStatus({ locked: isLocked, reason, requirement, currentValue });
    } catch (err) {
      console.error('Failed to check gate', err);
      setStatus({ locked: true, reason: 'Error checking access' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, moduleId]);

  useEffect(() => {
    checkGate();
  }, [checkGate]);

  return { ...status, loading, refetch: checkGate };
}
