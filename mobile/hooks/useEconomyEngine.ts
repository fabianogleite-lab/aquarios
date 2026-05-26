import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { useState } from 'react';

interface EconomyEngineResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useEconomyEngine() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const callEngine = async (
    action: 'earn_xp' | 'spend_tokens' | 'check_gate' | 'get_badges' | 'purchase',
    data: Record<string, any>
  ): Promise<EconomyEngineResult> => {
    setLoading(true);

    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('engine', {
        body: {
          action,
          data,
          userId: user.id,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (err: any) {
      console.error(`Engine error (${action}):`, err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    earnXP: (amount: number) => callEngine('earn_xp', { amount }),
    spendTokens: (amount: number) => callEngine('spend_tokens', { amount }),
    purchase: (productId: string, price: number) =>
      callEngine('purchase', { productId, price }),
    checkGate: (moduleId: string) => callEngine('check_gate', { moduleId }),
    getBadges: () => callEngine('get_badges', {}),
    getUserStats: async () => {
      const result = await callEngine('get_badges', {});
      if (result.success) {
        return { badges: result.data, success: true };
      }
      return { success: false, error: result.error };
    },
  };
}
