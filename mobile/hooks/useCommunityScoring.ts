// S15 — Community Scoring Engine (Comunidades Ranking - Algoritmo M-04)
// Scores helpers baseado em expertise (persona match) + engagement (replies + ratings)

import { supabase } from '../lib/supabase';

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';

export interface Helper {
  userId: string;
  userName: string;
  persona: Persona;
  replyCount: number;
  averageRating: number;
  helpfulCount: number;
  expertiseScore: number;
  engagementScore: number;
  finalScore: number;
}

export interface CommunityScoreResult {
  helpers: Helper[];
  topHelpers: Helper[];
  totalHelpers: number;
}

export function useCommunityScoring() {
  // Calcula expertise score baseado em persona match
  const calculateExpertiseScore = (helperPersona: Persona, userPersona: Persona): number => {
    // Match exato = 1.0 | Match category = 0.7 | Sem match = 0.3
    if (helperPersona === userPersona) {
      return 1.0;
    }

    // Agrupa personas por categoria
    const economicCategory: Record<Persona, string> = {
      'ZÉ_DO_APERTO': 'LOW_INCOME',
      'DONA_MARIA': 'FIXED_INCOME',
      'CARLOS': 'MIDDLE_HIGH'
    };

    if (economicCategory[helperPersona] === economicCategory[userPersona]) {
      return 0.7;
    }

    return 0.3;
  };

  // Calcula engagement score baseado em replies + ratings
  const calculateEngagementScore = (
    replyCount: number,
    averageRating: number,
    helpfulCount: number
  ): number => {
    const maxReplies = 100; // Normalizador
    const replyNormalized = Math.min(replyCount / maxReplies, 1.0);
    const ratingNormalized = averageRating / 5.0;
    const helpfulNormalized = Math.min(helpfulCount / 50, 1.0);

    // Weighted average: replies 40%, rating 40%, helpful 20%
    const engagement =
      replyNormalized * 0.4 + ratingNormalized * 0.4 + helpfulNormalized * 0.2;

    return parseFloat(engagement.toFixed(2));
  };

  // Score final = expertise * 0.5 + engagement * 0.5
  const calculateFinalScore = (expertise: number, engagement: number): number => {
    const final = expertise * 0.5 + engagement * 0.5;
    return parseFloat(final.toFixed(2));
  };

  // Busca helpers e calcula scores
  const scoreHelpers = async (userPersona: Persona): Promise<Helper[]> => {
    try {
      // Query: busca replies + profiles agregadas
      const { data: replies, error } = await supabase
        .from('community_replies')
        .select(`
          user_id,
          user_profiles:user_id(name, persona),
          rating,
          helpful_count
        `)
        .not('user_id', 'is', null);

      if (error) {
        console.error('Error fetching community replies:', error);
        return [];
      }

      if (!replies || replies.length === 0) {
        return [];
      }

      // Agrupa por helper e calcula metricas
      const helperMap = new Map<string, any>();

      replies.forEach((reply: any) => {
        const userId = reply.user_id;
        if (!helperMap.has(userId)) {
          helperMap.set(userId, {
            userId,
            userName: reply.user_profiles?.name || 'Anonymous',
            persona: reply.user_profiles?.persona || 'ZÉ_DO_APERTO',
            replies: [],
            ratings: [],
            helpfulCounts: []
          });
        }

        const helper = helperMap.get(userId);
        helper.replies.push(reply);
        if (reply.rating) helper.ratings.push(reply.rating);
        if (reply.helpful_count) helper.helpfulCounts.push(reply.helpful_count);
      });

      // Converte para Helper array com scores
      const helpers: Helper[] = Array.from(helperMap.values()).map((data: any) => {
        const replyCount = data.replies.length;
        const averageRating =
          data.ratings.length > 0
            ? data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length
            : 0;
        const helpfulCount = data.helpfulCounts.reduce((a: number, b: number) => a + b, 0);

        const expertiseScore = calculateExpertiseScore(data.persona, userPersona);
        const engagementScore = calculateEngagementScore(replyCount, averageRating, helpfulCount);
        const finalScore = calculateFinalScore(expertiseScore, engagementScore);

        return {
          userId: data.userId,
          userName: data.userName,
          persona: data.persona,
          replyCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
          helpfulCount,
          expertiseScore,
          engagementScore,
          finalScore
        };
      });

      return helpers;
    } catch (err) {
      console.error('Error in scoreHelpers:', err);
      return [];
    }
  };

  // Retorna top N helpers ranked
  const getRankedHelpers = async (
    userPersona: Persona,
    limit: number = 10
  ): Promise<CommunityScoreResult> => {
    const helpers = await scoreHelpers(userPersona);

    // Ordena por finalScore DESC
    const sorted = helpers.sort((a, b) => b.finalScore - a.finalScore);
    const topHelpers = sorted.slice(0, limit);

    return {
      helpers: sorted,
      topHelpers,
      totalHelpers: helpers.length
    };
  };

  return { scoreHelpers, getRankedHelpers };
}
