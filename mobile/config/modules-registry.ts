// S15 — Módulos Registry (static mapping, sem import dinâmico)
// Resolve bundler error: import(`../config/modules/${id}.json`)

type ModuleStatus = 'active' | 'coming_soon' | 'locked';
type GateType = 'xp' | 'plan' | 'tokens';

export interface ModuleGate {
  type: GateType;
  min_level?: number;
  min_plan?: string;
  min_tokens?: number;
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: ModuleStatus;
  gate?: ModuleGate;
  lotes?: Array<any>;
  [key: string]: any;
}

// Registry de todos os módulos disponíveis
const MODULE_REGISTRY: Record<string, ModuleConfig> = {
  // Saúde
  preventiva: {
    id: 'preventiva',
    name: 'Saúde Preventiva',
    icon: '💊',
    description: 'Guia completo de prevenção de doenças',
    status: 'active',
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Exercício',
    icon: '💪',
    description: 'Planos de treino personalizados',
    status: 'active',
  },
  nutrição: {
    id: 'nutrição',
    name: 'Nutrição Avançada',
    icon: '🥗',
    description: 'Análise nutricional completa',
    status: 'active',
  },

  // Bem-estar
  meditacao: {
    id: 'meditacao',
    name: 'Meditação & Mindfulness',
    icon: '🧘',
    description: 'Técnicas de relaxamento',
    status: 'active',
  },
  sono: {
    id: 'sono',
    name: 'Otimização do Sono',
    icon: '😴',
    description: 'Melhore sua qualidade de sono',
    status: 'active',
  },
  estresse: {
    id: 'estresse',
    name: 'Controle de Estresse',
    icon: '🧠',
    description: 'Técnicas para reduzir estresse',
    status: 'active',
  },

  // Vitalidade
  energia: {
    id: 'energia',
    name: 'Boosting de Energia',
    icon: '⚡',
    description: 'Aumentar vitalidade diária',
    status: 'active',
  },
  longevidade: {
    id: 'longevidade',
    name: 'Longevidade & Envelhecimento',
    icon: '🕐',
    description: 'Estratégias para viver mais',
    status: 'active',
    gate: {
      type: 'xp',
      min_level: 50,
    },
  },
  biohacking: {
    id: 'biohacking',
    name: 'Biohacking Avançado',
    icon: '🔬',
    description: 'Otimização genética e performance',
    status: 'coming_soon',
    gate: {
      type: 'plan',
      min_plan: 'gold',
    },
  },

  // Premium
  genomica: {
    id: 'genomica',
    name: 'Análise Genômica',
    icon: '🧬',
    description: 'Teste genético completo',
    status: 'locked',
    gate: {
      type: 'tokens',
      min_tokens: 1000,
    },
  },
  ia_coach: {
    id: 'ia_coach',
    name: 'IA Personal Coach',
    icon: '🤖',
    description: 'Coach de IA personalizado 24/7',
    status: 'locked',
    gate: {
      type: 'plan',
      min_plan: 'platinum',
    },
  },
};

/**
 * Busca configuração de módulo por ID
 * @param moduleId - ID do módulo
 * @returns Configuração do módulo ou null se não encontrado
 */
export function getModuleConfig(moduleId: string | string[]): ModuleConfig | null {
  const id = Array.isArray(moduleId) ? moduleId[0] : moduleId;

  if (!id) return null;

  const config = MODULE_REGISTRY[id];

  if (!config) {
    console.warn(`Module not found: ${id}`);
    return null;
  }

  return config;
}

/**
 * Lista todos os módulos
 */
export function getAllModules(): ModuleConfig[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Filtra módulos por status
 */
export function getModulesByStatus(status: ModuleStatus): ModuleConfig[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === status);
}

/**
 * Verifica se módulo existe
 */
export function moduleExists(moduleId: string): boolean {
  return moduleId in MODULE_REGISTRY;
}
