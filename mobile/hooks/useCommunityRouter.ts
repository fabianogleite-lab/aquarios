// S15 — Community Router (Intent → Comunidade - Integração ProteOS)
// Usa useIntentRouter() para descobrir categoria de comunidade e rotear post

import { useIntentRouter } from './useIntentRouter';
import { usePersonaDetection } from './usePersonaDetection';
import { supabase } from '../lib/supabase';

type Persona = 'ZÉ_DO_APERTO' | 'DONA_MARIA' | 'CARLOS';
type Category = 'SAÚDE' | 'BEM_ESTAR' | 'VITALIDADE' | 'GERAL';

export interface CommunityRouteResult {
  category: Category;
  confidence: number;
  suggestedHelpers: string[]; // user IDs
  shouldPublish: boolean; // validação asclepiOS
}

export function useCommunityRouter() {
  const { route: intentRoute } = useIntentRouter();

  // Mapeia ProteOS embeddings para categorias de comunidade
  const mapIntentToCategory = (intent: string): Category => {
    const intentLower = intent.toLowerCase();

    // Saúde
    if (
      ['saúde', 'doença', 'médico', 'diagnóstico', 'sintoma', 'medicamento', 'check-up'].some(
        k => intentLower.includes(k)
      )
    ) {
      return 'SAÚDE';
    }

    // Bem-estar
    if (
      ['bem-estar', 'mental', 'psicológico', 'emocional', 'ansiedade', 'estresse', 'relaxamento'].some(
        k => intentLower.includes(k)
      )
    ) {
      return 'BEM_ESTAR';
    }

    // Vitalidade
    if (
      ['energia', 'vitalidade', 'cansaço', 'exercício', 'vigor', 'disposição', 'revitalizar'].some(
        k => intentLower.includes(k)
      )
    ) {
      return 'VITALIDADE';
    }

    return 'GERAL';
  };

  // Detecta banned phrases (asclepiOS validation)
  const validateWithAsclepiOS = async (
    content: string,
    persona: Persona
  ): Promise<boolean> => {
    const bannedPhrases: Record<Persona, string[]> = {
      'ZÉ_DO_APERTO': [
        'cura garantida',
        'milagre',
        'substitui médico',
        'sem risco',
        'comprovado 100%'
      ],
      'DONA_MARIA': [
        'prejudicial para a família',
        'destruir vínculo',
        'culpa materna',
        'falha moral'
      ],
      'CARLOS': [
        'incompetência do plano',
        'fraude médica',
        'discriminação',
        'acesso negado'
      ]
    };

    const phrases = bannedPhrases[persona] || [];
    const contentLower = content.toLowerCase();

    for (const phrase of phrases) {
      if (contentLower.includes(phrase)) {
        console.warn(`asclepiOS blocked: "${phrase}" detected for persona ${persona}`);
        return false;
      }
    }

    return true;
  };

  // Rota post para comunidade ideal
  const routePost = async (
    postContent: string,
    userPersona: Persona
  ): Promise<CommunityRouteResult> => {
    try {
      // 1. Usa IntentRouter para descobrir intent
      const intentResult = await intentRoute(postContent);

      // 2. Mapeia intent para categoria
      const category = mapIntentToCategory(postContent);
      const confidence = intentResult.confidence / 100; // Normaliza 0-1

      // 3. Valida com asclepiOS
      const isValid = await validateWithAsclepiOS(postContent, userPersona);

      // 4. Busca top helpers para categoria
      const { data: helpers } = await supabase
        .from('community_helper_stats')
        .select('user_id')
        .order('average_rating', { ascending: false })
        .limit(5);

      const suggestedHelpers = (helpers || []).map((h: any) => h.user_id);

      return {
        category,
        confidence: Math.max(0, Math.min(1, confidence)),
        suggestedHelpers,
        shouldPublish: isValid
      };
    } catch (err) {
      console.error('Error in routePost:', err);
      return {
        category: 'GERAL',
        confidence: 0.5,
        suggestedHelpers: [],
        shouldPublish: false
      };
    }
  };

  // Encontra helpers relevantes por categoria + persona
  const findRelevantHelpers = async (
    category: Category,
    userPersona: Persona,
    limit: number = 5
  ): Promise<string[]> => {
    try {
      // Query helpers com persona match + alta rating
      const { data: helpers } = await supabase
        .from('community_helper_stats')
        .select('user_id')
        .eq('persona', userPersona) // Match persona ideal
        .order('average_rating', { ascending: false })
        .limit(limit);

      return (helpers || []).map((h: any) => h.user_id);
    } catch (err) {
      console.error('Error finding relevant helpers:', err);
      return [];
    }
  };

  return {
    routePost,
    findRelevantHelpers,
    mapIntentToCategory,
    validateWithAsclepiOS
  };
}
