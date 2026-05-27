// S15 — Community API Client (chama Edge Function /community)

import { supabase } from '../lib/supabase';

type Action = 'create_post' | 'create_reply' | 'get_helpers' | 'rate_reply';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useCommunityAPI() {
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch (err) {
      console.error('Error getting auth token:', err);
      return null;
    }
  };

  const callAPI = async <T = any>(
    action: Action,
    payload: Record<string, any>
  ): Promise<APIResponse<T>> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/community?action=${action}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'API Error' };
      }

      return result as APIResponse<T>;
    } catch (err) {
      console.error('API call error:', err);
      return { success: false, error: (err as Error).message };
    }
  };

  // Create post
  const createPost = async (
    title: string,
    content: string,
    category: string
  ): Promise<APIResponse> => {
    return callAPI('create_post', { title, content, category });
  };

  // Create reply
  const createReply = async (
    postId: string,
    content: string
  ): Promise<APIResponse> => {
    return callAPI('create_reply', { postId, content });
  };

  // Get top helpers
  const getHelpers = async (): Promise<APIResponse> => {
    return callAPI('get_helpers', {});
  };

  // Rate a reply
  const rateReply = async (replyId: string, rating: number): Promise<APIResponse> => {
    return callAPI('rate_reply', { replyId, rating });
  };

  return {
    createPost,
    createReply,
    getHelpers,
    rateReply,
  };
}
