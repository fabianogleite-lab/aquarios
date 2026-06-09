import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import XPBar from '../../components/XPBar';
import StoreCard from '../../components/StoreCard';
import { useEconomyEngine } from '../../hooks/useEconomyEngine';
import { formatNumber } from '../../lib/locale';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import products from '../../data/products.json';

interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  link_afiliado: string;
  imagem_url: string;
}

interface UserStats {
  totalXP: number;
  level: number;
  tokens: number;
}

export default function StoreScreen() {
  const { user } = useAuthStore();
  const { purchase, loading: engineLoading } = useEconomyEngine();

  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    tokens: 9999,
  });
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Todos', ...new Set(products.map((p) => p.categoria))];

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.categoria === selectedCategory);

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  const loadUserStats = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setStats((prev) => ({
          ...prev,
          totalXP: data.total_xp,
          level: data.level,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (stats.tokens < product.preco) {
      Alert.alert('Saldo insuficiente', `Você precisa de ${product.preco} tokens`);
      return;
    }

    const result = await purchase(productId, product.preco);
    if (result.success) {
      setStats((prev) => ({
        ...prev,
        tokens: prev.tokens - product.preco,
      }));
      Alert.alert('Compra realizada!', `Você adquiriu ${product.nome}`);
      // Refresh stats to update from server
      loadUserStats();
    } else {
      Alert.alert('Erro na compra', result.error || 'Tente novamente');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com XPBar */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Loja AquariOS</Text>
        <XPBar currentXP={stats.totalXP} currentLevel={stats.level} />
        <View style={styles.tokensBox}>
          <Text style={styles.tokensLabel}>Seus tokens:</Text>
          <Text style={styles.tokensValue}>{formatNumber(stats.tokens)} TKN</Text>
        </View>
      </View>

      {/* Tabs de Categorias */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, selectedCategory === item && styles.tabActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[styles.tabText, selectedCategory === item && styles.tabTextActive]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Grid de Produtos */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <StoreCard
              product={item}
              onBuy={handleBuyProduct}
              userTokens={stats.tokens}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nenhum produto nesta categoria</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.cardDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  tokensBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokensLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  tokensValue: {
    color: colors.gold,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  tabsContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textLight,
  },
  listContent: {
    padding: spacing.sm,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
  },
});
