// S13 — Economia + Loja
// Implementação do Scoring Engine (M-04)
// Vide: memory/integration_roadmap_s13_s15.md § 1.2

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export interface ScoreResult {
  userId: string;
  totalScore: number; // 0.0-1.0
  healthLevel: number; // 0-100 para UI
  planTier: 'Onboarding' | 'Silver' | 'Gold' | 'Family';
  dimensionScores: Record<string, number>;
  detectedPatterns: string[];
  recommendations: string[];
}

export function useHealthScore() {
  const { user } = useAuthStore();

  const calculateHealthScore = async (): Promise<ScoreResult | null> => {
    if (!user?.id) return null;

    try {
      // Fetch telemetry data for user
      const { data: telemetry } = await supabase
        .from('telemetry_vitality_logs')
        .select('metric_type, calculated_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!telemetry || telemetry.length === 0) {
        // Default score for new users
        return {
          userId: user.id,
          totalScore: 0.5,
          healthLevel: 50,
          planTier: 'Onboarding',
          dimensionScores: {},
          detectedPatterns: [],
          recommendations: ['Complete seu perfil de saúde'],
        };
      }

      // Calculate 8 dimensions from telemetry
      const dimensions: Record<string, number> = {
        health_openness: 0.5,
        social_support_index: 0.5,
        sus_engagement: 0.5,
        self_management_score: 0.5,
        stress_regulation: 0.5,
        preventive_adherence: 0.5,
        cognitive_load_index: 0.5,
      };

      // Aggregate telemetry data
      const metricScores: Record<string, number[]> = {};
      telemetry.forEach((t) => {
        if (!metricScores[t.metric_type]) {
          metricScores[t.metric_type] = [];
        }
        metricScores[t.metric_type].push(t.calculated_score || 0.5);
      });

      // Map metric_type to dimension
      const metricToDimension: Record<string, string> = {
        stress_index: 'stress_regulation',
        cardiac_risk_signal: 'health_openness',
        glycemic_adherence: 'preventive_adherence',
        family_integration_score: 'social_support_index',
        preventive_health_score: 'sus_engagement',
        cognitive_load_index: 'cognitive_load_index',
      };

      // Calculate dimension averages
      Object.entries(metricScores).forEach(([metricType, scores]) => {
        const dimension = metricToDimension[metricType];
        if (dimension && scores.length > 0) {
          dimensions[dimension] = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
      });

      // Calculate total score
      const totalScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length;
      const healthLevel = Math.round(totalScore * 100);

      // Determine plan tier
      let planTier: 'Onboarding' | 'Silver' | 'Gold' | 'Family' = 'Onboarding';
      if (healthLevel < 26) planTier = 'Onboarding';
      else if (healthLevel < 51) planTier = 'Silver';
      else if (healthLevel < 76) planTier = 'Gold';
      else planTier = 'Family';

      // Detect patterns
      const patterns: string[] = [];
      if (dimensions.health_openness < 0.3) patterns.push('denial_pattern');
      if (dimensions.preventive_adherence < 0.4) patterns.push('chronic_risk');
      if (dimensions.stress_regulation < 0.4) patterns.push('stress_overload');

      return {
        userId: user.id,
        totalScore,
        healthLevel,
        planTier,
        dimensionScores: dimensions,
        detectedPatterns: patterns,
        recommendations: generateRecommendations(planTier, patterns),
      };
    } catch (error) {
      console.error('Error calculating health score:', error);
      return null;
    }
  };

  const generateRecommendations = (planTier: string, patterns: string[]): string[] => {
    const recommendations: string[] = [];

    if (planTier === 'Onboarding') {
      recommendations.push('Complete seu perfil de saúde');
      recommendations.push('Participe de comunidades');
    }
    if (patterns.includes('denial_pattern')) {
      recommendations.push('Agende check-up com especialista');
    }
    if (patterns.includes('chronic_risk')) {
      recommendations.push('Mantenha aderência à medicação');
    }
    if (patterns.includes('stress_overload')) {
      recommendations.push('Pratique técnicas de relaxamento');
    }

    return recommendations;
  };

  return { calculateHealthScore };
}
