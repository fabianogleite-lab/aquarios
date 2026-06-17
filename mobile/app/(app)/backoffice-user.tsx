import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import { formatDate } from '../../lib/locale';

interface Projeto {
  id: string;
  nome: string;
  categoria: string;
  plano: string;
  status: string;
  created_at: string;
}

interface Lead {
  id: string;
  projeto_id: string;
  canal_contato: string;
  lead_score: 'hot' | 'warm' | 'cold';
  status: 'novo' | 'contactado' | 'convertido' | 'perdido';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Pedido {
  id: string;
  order_id: string;
  status_transporte: string;
  transportadora?: string;
  ultimo_evento?: string;
  entregue_em?: string;
  created_at: string;
}

interface KPIs {
  leads_hot: number;
  leads_warm: number;
  leads_cold: number;
  leads_convertidos: number;
  pedidos_entregues: number;
  pedidos_em_transito: number;
  pedidos_pendentes: number;
  taxa_conversao: number;
}

export default function BackofficeUserScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    leads_hot: 0, leads_warm: 0, leads_cold: 0, leads_convertidos: 0,
    pedidos_entregues: 0, pedidos_em_transito: 0, pedidos_pendentes: 0,
    taxa_conversao: 0
  });

  const [tab, setTab] = useState<'overview' | 'leads' | 'pedidos'>('overview');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const loadProjetos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('herme_projetos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
      if (data && data.length > 0) {
        setProjetoSelecionado(data[0]);
        await loadDados(data[0].id);
      }
    } catch (err) {
      Alert.alert('Erro', `Falha ao carregar projetos: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDados = async (projetoId: string) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('herme_leads')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // Pedidos via join
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('cl_logistica_tracking')
        .select(`
          id, order_id, status_transporte, transportadora, ultimo_evento, entregue_em, created_at
        `)
        .in('produto_id', (
          await supabase
            .from('escambos_produtos')
            .select('id')
            .eq('projeto_id', projetoId)
        ).data?.map((p: any) => p.id) || []);

      if (pedidosError) throw pedidosError;
      setPedidos(pedidosData || []);

      // Calcular KPIs
      const leadsArray = leadsData || [];
      const pedidosArray = pedidosData || [];
      const convertidos = leadsArray.filter((l: Lead) => l.status === 'convertido').length;

      setKpis({
        leads_hot: leadsArray.filter((l: Lead) => l.lead_score === 'hot').length,
        leads_warm: leadsArray.filter((l: Lead) => l.lead_score === 'warm').length,
        leads_cold: leadsArray.filter((l: Lead) => l.lead_score === 'cold').length,
        leads_convertidos: convertidos,
        pedidos_entregues: pedidosArray.filter((p: Pedido) => p.status_transporte === 'entregue').length,
        pedidos_em_transito: pedidosArray.filter((p: Pedido) => ['em_transito', 'saiu_entrega'].includes(p.status_transporte)).length,
        pedidos_pendentes: pedidosArray.filter((p: Pedido) => p.status_transporte === 'pendente').length,
        taxa_conversao: leadsArray.length > 0 ? Math.round((convertidos / leadsArray.length) * 100) : 0
      });
    } catch (err) {
      Alert.alert('Erro', `Falha ao carregar dados: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProjetos();
    }, [user])
  );

  const scoreColor = (score: 'hot' | 'warm' | 'cold') => {
    switch (score) {
      case 'hot': return '#ef4444';
      case 'warm': return '#f59e0b';
      case 'cold': return '#6b7280';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'entregue': return '#10b981';
      case 'em_transito':
      case 'saiu_entrega': return '#3b82f6';
      case 'pendente': return '#f59e0b';
      case 'devolvido':
      case 'extraviado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const KPICard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
    <View style={[styles.kpiCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );

  const LeadRow = ({ lead }: { lead: Lead }) => (
    <Pressable
      style={styles.leadRow}
      onPress={() => {
        Alert.alert(
          `Lead #${lead.id.slice(0, 8)}`,
          `Canal: ${lead.canal_contato}\nStatus: ${lead.status}\nScore: ${lead.lead_score}\n${lead.observacoes ? `Notas: ${lead.observacoes}` : ''}`,
          [{ text: 'OK' }]
        );
      }}
    >
      <View style={styles.leadBadge}>
        <Text style={[styles.leadBadgeText, { color: scoreColor(lead.lead_score) }]}>
          {lead.lead_score.toUpperCase()}
        </Text>
      </View>
      <View style={styles.leadInfo}>
        <Text style={styles.leadChannel}>{lead.canal_contato}</Text>
        <Text style={styles.leadDate}>{formatDate(new Date(lead.created_at))}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor(lead.status) }]}>
        <Text style={styles.statusText}>{lead.status}</Text>
      </View>
    </Pressable>
  );

  const PedidoRow = ({ pedido }: { pedido: Pedido }) => (
    <View style={styles.pedidoRow}>
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoOrderId}>Pedido {pedido.order_id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(pedido.status_transporte) }]}>
          <Text style={styles.statusText}>{pedido.status_transporte}</Text>
        </View>
      </View>
      {pedido.transportadora && (
        <Text style={styles.pedidoTransportadora}>{pedido.transportadora}</Text>
      )}
      {pedido.ultimo_evento && (
        <Text style={styles.pedidoEvento}>{pedido.ultimo_evento}</Text>
      )}
      {pedido.entregue_em && (
        <Text style={styles.pedidoEntrega}>Entregue em {formatDate(new Date(pedido.entregue_em))}</Text>
      )}
    </View>
  );

  if (!user?.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Você precisa estar autenticado</Text>
      </View>
    );
  }

  if (!projetoSelecionado) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhum projeto encontrado. Crie um em EscambOS.</Text>
      </View>
    );
  }

  const leadsFiltered = filterStatus ? leads.filter(l => l.status === filterStatus) : leads;

  return (
    <FadeInView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Project Header */}
        <View style={styles.projectHeader}>
          <View>
            <Text style={styles.projectName}>{projetoSelecionado.nome}</Text>
            <Text style={styles.projectCategory}>{projetoSelecionado.categoria}</Text>
          </View>
          <View style={[styles.planBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.planText}>{projetoSelecionado.plano.toUpperCase()}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          {(['overview', 'leads', 'pedidos'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'overview' ? '📊' : t === 'leads' ? '👥' : '📦'} {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <>
            {/* Overview Tab */}
            {tab === 'overview' && (
              <>
                <Text style={styles.sectionTitle}>Leads</Text>
                <View style={styles.kpiGrid}>
                  <KPICard label="Hot" value={kpis.leads_hot} color="#ef4444" />
                  <KPICard label="Warm" value={kpis.leads_warm} color="#f59e0b" />
                  <KPICard label="Cold" value={kpis.leads_cold} color="#6b7280" />
                </View>

                <Text style={styles.sectionTitle}>Conversão</Text>
                <View style={styles.kpiGrid}>
                  <KPICard label="Convertidos" value={kpis.leads_convertidos} color="#10b981" />
                  <KPICard label="Taxa" value={`${kpis.taxa_conversao}%`} color="#3b82f6" />
                </View>

                <Text style={styles.sectionTitle}>Pedidos</Text>
                <View style={styles.kpiGrid}>
                  <KPICard label="Entregues" value={kpis.pedidos_entregues} color="#10b981" />
                  <KPICard label="Em trânsito" value={kpis.pedidos_em_transito} color="#3b82f6" />
                  <KPICard label="Pendentes" value={kpis.pedidos_pendentes} color="#f59e0b" />
                </View>
              </>
            )}

            {/* Leads Tab */}
            {tab === 'leads' && (
              <>
                <View style={styles.filterBar}>
                  {['novo', 'contactado', 'convertido', 'perdido', null].map(status => (
                    <TouchableOpacity
                      key={status || 'all'}
                      style={[
                        styles.filterChip,
                        filterStatus === status && styles.filterChipActive
                      ]}
                      onPress={() => setFilterStatus(filterStatus === status ? null : status)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filterStatus === status && styles.filterChipTextActive
                      ]}>
                        {status || 'Todos'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {leadsFiltered.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum lead encontrado</Text>
                ) : (
                  <View style={styles.leadsList}>
                    {leadsFiltered.map(lead => (
                      <LeadRow key={lead.id} lead={lead} />
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Pedidos Tab */}
            {tab === 'pedidos' && (
              <>
                {pedidos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
                ) : (
                  <View style={styles.pedidosList}>
                    {pedidos.map(pedido => (
                      <PedidoRow key={pedido.id} pedido={pedido} />
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  projectName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  projectCategory: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  planBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  planText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  loader: {
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  kpiGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  kpiValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  leadsList: {
    gap: spacing.md,
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  leadBadge: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.cardDark,
  },
  leadBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  leadInfo: {
    flex: 1,
  },
  leadChannel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  leadDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  pedidosList: {
    gap: spacing.md,
  },
  pedidoRow: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pedidoOrderId: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textLight,
  },
  pedidoTransportadora: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  pedidoEvento: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  pedidoEntrega: {
    fontSize: fontSize.xs,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
