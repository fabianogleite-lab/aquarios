import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { GenericModule } from '../../../components/GenericModule';
import { TokenGate } from '../../../components/TokenGate';
import { LoadingState } from '../../../components/LoadingState';
import { useXP } from '../../../hooks/useXP';
import { useTokens } from '../../../hooks/useTokens';
import { useGate } from '../../../hooks/useGate';
import { colors } from '../../../lib/theme';

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'coming_soon' | 'locked';
  gate?: { type: 'xp' | 'plan' | 'tokens'; min_level?: number; min_plan?: string; min_tokens?: number };
  lotes?: Array<any>;
  [key: string]: any;
}

export default function ModuleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const { totalXP } = useXP();
  const { balance } = useTokens();
  const { locked: isLocked, reason: gateReason } = useGate(id as string);

  useEffect(() => {
    loadConfig();
  }, [id]);

  const loadConfig = async () => {
    try {
      if (!id) return;

      // Dynamically import config based on module ID
      const configModule = await import(`../../../config/modules/${id}.json`);
      setConfig(configModule.default);
    } catch (err) {
      console.error('Failed to load module config', err);
      // Fallback to coming soon page
      router.replace({ pathname: '/coming-soon', params: { module: id as string } });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message={`Carregando módulo...`} />;
  }

  if (!config) {
    return <LoadingState message="Módulo não encontrado" />;
  }

  // Determine gate status and render appropriately
  if (isLocked && config.gate) {
    let currentValue = 0;

    switch (config.gate.type) {
      case 'xp':
        currentValue = totalXP;
        break;
      case 'tokens':
        currentValue = balance.total;
        break;
    }

    return (
      <View style={s.container}>
        <TokenGate
          gate={config.gate}
          currentValue={currentValue}
          reason={gateReason}
          onUpgrade={() => router.push('/store')}
        />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <GenericModule
        config={config}
        currentXP={totalXP}
        onSelectLot={(lot) => {
          // Handle lot selection - can navigate to lot details or perform action
          console.log('Selected lot:', lot);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
