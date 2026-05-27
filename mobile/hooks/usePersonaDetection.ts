// S14 — Cascata 3 Níveis (PersonaSegmentation - Algoritmo M-02)
// L1: Demográfico | L2: Socioeconômico | L3: Comportamental

import { useHealthScore } from './useHealthScore';
import { supabase } from '../lib/supabase';

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';
type EconomicContext = 'LOW_INCOME_VARIABLE' | 'FIXED_LOW_INCOME' | 'MIDDLE_TO_HIGH';
type Tone = 'PRAGMATIC_DIRECT' | 'SUPPORTIVE_CLINICAL' | 'CLINICAL_URGENT';

export interface PersonaDetectionResult {
  persona: Persona;
  confidence: number;
  economicContext: EconomicContext;
  tone: Tone;
  faqSubset: string[];
  recommendations: string[];
}

export interface UserProfile {
  userId: string;
  age?: number;
  gender?: string;
  location?: string;
  income?: number;
  savingsRate?: number;
  searchHistory?: string[];
  interactionFrequency?: number;
}

export function usePersonaDetection() {
  const { calculateHealthScore } = useHealthScore();

  const calculateL1Score = (age?: number, gender?: string, location?: string): number => {
    let score = 0.5;

    if (age) {
      if (age < 25) score += 0.1;
      else if (age < 40) score += 0.15;
      else if (age < 60) score += 0.2;
      else score += 0.25;
    }

    if (gender === 'female') score += 0.05;

    if (location) {
      const locationLower = location.toLowerCase();
      if (['norte', 'nordeste'].includes(locationLower)) score -= 0.1;
      if (['sudeste', 'sul'].includes(locationLower)) score += 0.1;
    }

    return Math.min(1.0, Math.max(0.1, score));
  };

  const detectEconomicContext = (healthLevel: number, income?: number, savingsRate?: number): EconomicContext => {
    if (healthLevel < 33 || (income && income < 2000) || (savingsRate && savingsRate < 0.1)) {
      return 'LOW_INCOME_VARIABLE';
    }

    if (healthLevel < 66 || (income && income < 5000) || (savingsRate && savingsRate < 0.3)) {
      return 'FIXED_LOW_INCOME';
    }

    return 'MIDDLE_TO_HIGH';
  };

  const selectPersonaFromEconomic = (economic: EconomicContext): Persona => {
    switch (economic) {
      case 'LOW_INCOME_VARIABLE':
        return 'ZÉ_DO_APERTO';
      case 'FIXED_LOW_INCOME':
        return 'DONA_MARIA';
      case 'MIDDLE_TO_HIGH':
        return 'CARLOS';
    }
  };

  const analyzeBehaviorL3 = async (userId: string, searchHistory?: string[]): Promise<Tone> => {
    let pragmaticScore = 0;
    let supportiveScore = 0;
    let urgentScore = 0;

    if (searchHistory) {
      const urgentKeywords = ['emergência', 'urgente', 'rápido', 'dor', 'agudo'];
      const supportiveKeywords = ['família', 'crianças', 'relacionamento', 'vínculos', 'suporte'];
      const pragmaticKeywords = ['sus', 'gratuito', 'acesso', 'preventiva', 'público'];

      searchHistory.forEach(query => {
        const queryLower = query.toLowerCase();
        if (urgentKeywords.some(k => queryLower.includes(k))) urgentScore += 1;
        if (supportiveKeywords.some(k => queryLower.includes(k))) supportiveScore += 1;
        if (pragmaticKeywords.some(k => queryLower.includes(k))) pragmaticScore += 1;
      });
    }

    try {
      const { data: telemetry } = await supabase
        .from('telemetry_vitality_logs')
        .select('*')
        .eq('user_id', userId)
        .limit(10);

      if (telemetry && telemetry.length > 0) {
        urgentScore += telemetry.filter(t => t.log_type === 'alert').length;
        supportiveScore += telemetry.filter(t => t.log_type === 'social').length;
        pragmaticScore += telemetry.filter(t => t.log_type === 'preventive').length;
      }
    } catch (err) {
      console.warn('Telemetry fetch failed for L3 analysis:', err);
    }

    if (urgentScore > pragmaticScore && urgentScore > supportiveScore) {
      return 'CLINICAL_URGENT';
    }
    if (supportiveScore > pragmaticScore && supportiveScore > urgentScore) {
      return 'SUPPORTIVE_CLINICAL';
    }
    return 'PRAGMATIC_DIRECT';
  };

  const detect = async (userProfile: UserProfile): Promise<PersonaDetectionResult> => {
    const { userId, age, gender, location, income, savingsRate, searchHistory } = userProfile;

    const l1Score = calculateL1Score(age, gender, location);

    const scoreResult = await calculateHealthScore();
    const healthLevel = scoreResult?.healthLevel ?? 50;
    const economicContext = detectEconomicContext(healthLevel, income, savingsRate);
    const persona = selectPersonaFromEconomic(economicContext);

    const tone = await analyzeBehaviorL3(userId, searchHistory);

    const faqSubset = getFAQsForPersona(persona);
    const recommendations = generateRecommendations(persona, economicContext, healthLevel);

    const confidence = Math.round(l1Score * 100);

    return {
      persona,
      confidence,
      economicContext,
      tone,
      faqSubset,
      recommendations
    };
  };

  return { detect };
}

const getFAQsForPersona = (persona: Persona): string[] => {
  const faqsByPersona: Record<Persona, string[]> = {
    'ZÉ_DO_APERTO': [
      'faq_zé_001', 'faq_zé_002', 'faq_zé_003', 'faq_zé_004',
      'faq_zé_005', 'faq_zé_006', 'faq_zé_007', 'faq_zé_008'
    ],
    'DONA_MARIA': [
      'faq_dona_001', 'faq_dona_002', 'faq_dona_003', 'faq_dona_004',
      'faq_dona_005', 'faq_dona_006', 'faq_dona_007', 'faq_dona_008', 'faq_dona_009'
    ],
    'CARLOS': [
      'faq_carlos_001', 'faq_carlos_002', 'faq_carlos_003', 'faq_carlos_004',
      'faq_carlos_005', 'faq_carlos_006', 'faq_carlos_007', 'faq_carlos_008'
    ]
  };

  return faqsByPersona[persona] || [];
};

const generateRecommendations = (persona: Persona, economic: EconomicContext, healthLevel: number): string[] => {
  const recommendations: string[] = [];

  if (healthLevel < 50) {
    recommendations.push('Comece com o módulo de Preventiva');
  }

  if (persona === 'ZÉ_DO_APERTO') {
    recommendations.push('Acesse SUS e confira sua cobertura');
    if (economic === 'LOW_INCOME_VARIABLE') {
      recommendations.push('Você pode ter acesso a programas de saúde gratuitos');
    }
  } else if (persona === 'DONA_MARIA') {
    recommendations.push('Seção Família pode ser importante para seu contexto');
    recommendations.push('Considere compartilhar com membros da sua família');
  } else if (persona === 'CARLOS') {
    recommendations.push('Recomendamos exames preventivos anuais');
    recommendations.push('Seu plano Gold oferece acesso a especialistas');
  }

  return recommendations;
}
