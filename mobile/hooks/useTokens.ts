import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface TokenBalance {
  purchased: number;
  donated: number;
  daily: number;
  total: number;
}

interface TokenHistory {
  type: 'earned' | 'spent';
  amount: number;
  reason: string;
  date: string;
}

export function useTokens() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<TokenBalance>({ purchased: 0, donated: 0, daily: 0, total: 0 });
  const [history, setHistory] = useState<TokenHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial balance and filter expired tokens
  const refreshBalance = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get all token records
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      let purchased = 0,
        donated = 0,
        daily = 0;

      // Aggregate balances, filtering expired tokens
      (data || []).forEach((token) => {
        if (token.expires_at && new Date(token.expires_at) <= now) {
          // Expired — skip
          return;
        }

        switch (token.token_type) {
          case 'purchased':
            purchased += token.amount;
            break;
          case 'donated':
            donated += token.amount;
            break;
          case 'daily':
            daily += token.amount;
            break;
        }
      });

      setBalance({ purchased, donated, daily, total: purchased + donated + daily });
    } catch (err) {
      console.error('Failed to refresh token balance', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh on mount
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user?.id) throw new Error('User not authenticated');
      if (balance.total < amount) {
        console.warn('Insufficient tokens');
        return false;
      }

      try {
        // Deduct tokens (prioritize: purchased > donated > daily)
        let remaining = amount;
        const updates: { id: string; amount: number }[] = [];

        // Get all tokens sorted by type priority
        const { data: tokens } = await supabase
          .from('user_tokens')
          .select('*')
          .eq('user_id', user.id)
          .order('token_type', { ascending: false }); // purchased first

        if (!tokens) return false;

        for (const token of tokens) {
          if (token.expires_at && new Date(token.expires_at) <= new Date()) continue;
          if (remaining <= 0) break;

          const deduct = Math.min(remaining, token.amount);
          updates.push({ id: token.id, amount: token.amount - deduct });
          remaining -= deduct;
        }

        // Apply updates
        for (const update of updates) {
          await supabase.from('user_tokens').update({ amount: update.amount }).eq('id', update.id);
        }

        // Record in purchase/history
        await supabase.from('purchases').insert([
          {
            user_id: user.id,
            product_id: 'internal',
            amount_cents: amount * 100,
            status: 'paid',
            payment_method: 'tokens',
          },
        ]);

        // Refresh balance
        await refreshBalance();
        return true;
      } catch (err) {
        console.error('Failed to spend tokens', err);
        return false;
      }
    },
    [user?.id, balance.total, refreshBalance]
  );

  const earn = useCallback(
    async (amount: number, type: 'purchased' | 'donated' | 'daily', expiresIn?: number): Promise<boolean> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;

        const { error } = await supabase.from('user_tokens').insert([
          {
            user_id: user.id,
            token_type: type,
            amount,
            expires_at: expiresAt?.toISOString(),
          },
        ]);

        if (error) throw error;
        await refreshBalance();
        return true;
      } catch (err) {
        console.error('Failed to earn tokens', err);
        return false;
      }
    },
    [user?.id, refreshBalance]
  );

  return {
    balance,
    spend,
    earn,
    refreshBalance,
    loading,
  };
}
