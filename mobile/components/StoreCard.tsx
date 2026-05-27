import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { formatNumber } from '../lib/locale';

interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  link_afiliado: string;
  imagem_url: string;
}

interface StoreCardProps {
  product: Product;
  onBuy: (productId: string) => Promise<void>;
  userTokens: number;
}

export default function StoreCard({ product, onBuy, userTokens }: StoreCardProps) {
  const [loading, setLoading] = useState(false);
  const canAfford = userTokens >= product.preco;

  const handleBuy = async () => {
    setLoading(true);
    try {
      await onBuy(product.id);
    } catch (error) {
      console.error('Erro na compra:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliateLink = () => {
    Linking.openURL(product.link_afiliado).catch(() => {
      alert('Não foi possível abrir o link');
    });
  };

  const categoryColors: Record<string, string> = {
    'Suplementos': '#ef4444',
    'Fitoterapicos': '#f59e0b',
    'Organicos': '#10b981',
    'Bem-estar': '#3b82f6',
    'Livros': '#8b5cf6',
    'Cursos': '#ec4899',
    'Wearables': '#06b6d4',
    'Meditacao': '#6366f1',
    'Terapias': '#d946ef',
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.imagem_url }}
        style={styles.image}
        defaultSource={require('../assets/placeholder.png')}
      />

      <View style={[styles.badge, { backgroundColor: categoryColors[product.categoria] || '#666' }]}>
        <Text style={styles.badgeText}>{product.categoria}</Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.nome}
      </Text>

      <Text style={styles.price}>
        {formatNumber(product.preco)} TKN
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
          onPress={handleBuy}
          disabled={!canAfford || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" size={16} />
          ) : (
            <Text style={styles.buyText}>
              {canAfford ? 'Comprar' : 'Saldo insuficiente'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleAffiliateLink}>
          <Text style={styles.linkText}>🔗 Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#0f0f0f',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    height: 40,
  },
  price: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#4ade80',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  buyText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
  },
  linkText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 12,
  },
});
