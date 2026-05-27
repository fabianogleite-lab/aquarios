import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FadeInView } from '../../components/FadeInView';
import { colors, fontSize, spacing, radius } from '../../lib/theme';
import {
  DIVERGENCIAS,
  SEVERITY_META,
  PRIORITY_META,
  getSummary,
  type Divergencia,
  type Severity,
  type Priority,
  type Option,
} from '../../data/divergencias';

const STORAGE_KEY = '@aquarios:divergencias:decisions';

type Decisions = Record<string, string>; // id → letter (A/B/C/D)

type FilterSeverity = 'all' | Severity;
type FilterPriority = 'all' | Priority;

export default function DivergenciasScreen() {
  const [decisions, setDecisions] = useState<Decisions>({});
  const [filterSev, setFilterSev] = useState<FilterSeverity>('all');
  const [filterPri, setFilterPri] = useState<FilterPriority>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setDecisions(JSON.parse(raw)); } catch {}
      }
    });
  }, []));

  const persist = async (next: Decisions) => {
    setDecisions(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const choose = (divId: string, letter: string) => {
    const next = { ...decisions, [divId]: letter };
    persist(next);
  };

  const clearAll = () => {
    Alert.alert(
      'Limpar decisões',
      'Remove todas as escolhas marcadas. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: () => persist({}) },
      ]
    );
  };

  const exportSummary = () => {
    const lines: string[] = ['# Decisões — DEVPACK v4 Audit', ''];
    const decided = DIVERGENCIAS.filter(d => decisions[d.id]);
    const pending = DIVERGENCIAS.filter(d => !decisions[d.id]);

    lines.push(`**Decididas:** ${decided.length} de ${DIVERGENCIAS.length}`);
    lines.push('');
    lines.push('## Decididas');
    for (const d of decided) {
      const opt = d.options.find(o => o.letter === decisions[d.id]);
      lines.push(`- **${d.id} ${d.module}** → Opção ${decisions[d.id]}: ${opt?.title} (${opt?.effort})`);
    }
    if (pending.length > 0) {
      lines.push('');
      lines.push('## Pendentes');
      for (const d of pending) {
        lines.push(`- ${d.id} ${d.module} — ${SEVERITY_META[d.severity].label} / ${PRIORITY_META[d.priority].label}`);
      }
    }
    Alert.alert('Export', lines.join('\n').slice(0, 2000), [{ text: 'OK' }]);
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const filtered = useMemo(() => {
    return DIVERGENCIAS.filter(d => {
      if (filterSev !== 'all' && d.severity !== filterSev) return false;
      if (filterPri !== 'all' && d.priority !== filterPri) return false;
      return true;
    }).sort((a, b) => {
      const pa = PRIORITY_META[a.priority].order;
      const pb = PRIORITY_META[b.priority].order;
      if (pa !== pb) return pa - pb;
      return a.id.localeCompare(b.id);
    });
  }, [filterSev, filterPri]);

  const summary = useMemo(() => getSummary(), []);
  const decidedCount = Object.keys(decisions).length;
  const progressPct = Math.round((decidedCount / DIVERGENCIAS.length) * 100);

  return (
    <ScrollView style={s.container}>
      <FadeInView>
        <View style={s.header}>
          <Text style={s.title}>📊 Matriz de Divergências</Text>
          <Text style={s.subtitle}>DEVPACK v4 vs Código — 25 divergências auditadas</Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Decisões tomadas</Text>
            <Text style={s.progressVal}>{decidedCount} / {DIVERGENCIAS.length}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={s.progressPct}>{progressPct}% concluído</Text>
        </View>
      </FadeInView>

      <FadeInView delay={120}>
        <View style={s.statsRow}>
          <StatCard icon="🔴" label="Crítica" value={summary.bySeverity.critical} color={SEVERITY_META.critical.color} />
          <StatCard icon="🟡" label="Média"   value={summary.bySeverity.medium}   color={SEVERITY_META.medium.color} />
          <StatCard icon="🟢" label="Baixa"   value={summary.bySeverity.low}      color={SEVERITY_META.low.color} />
          <StatCard icon="⭐" label="Inova"   value={summary.bySeverity.innovation} color={SEVERITY_META.innovation.color} />
        </View>
      </FadeInView>

      <FadeInView delay={160}>
        <View style={s.filterSection}>
          <Text style={s.filterTitle}>Filtrar por severidade</Text>
          <View style={s.filterRow}>
            <FilterChip active={filterSev === 'all'}        label="Todas"   onPress={() => setFilterSev('all')} />
            <FilterChip active={filterSev === 'critical'}   label="🔴"      onPress={() => setFilterSev('critical')} />
            <FilterChip active={filterSev === 'medium'}     label="🟡"      onPress={() => setFilterSev('medium')} />
            <FilterChip active={filterSev === 'low'}        label="🟢"      onPress={() => setFilterSev('low')} />
            <FilterChip active={filterSev === 'innovation'} label="⭐"     onPress={() => setFilterSev('innovation')} />
          </View>

          <Text style={[s.filterTitle, { marginTop: spacing.md }]}>Filtrar por prioridade</Text>
          <View style={s.filterRow}>
            <FilterChip active={filterPri === 'all'} label="Todas"        onPress={() => setFilterPri('all')} />
            <FilterChip active={filterPri === 'P1'}  label="P1 Imediata"  onPress={() => setFilterPri('P1')} />
            <FilterChip active={filterPri === 'P2'}  label="P2 Pré"       onPress={() => setFilterPri('P2')} />
            <FilterChip active={filterPri === 'P3'}  label="P3 Pós"       onPress={() => setFilterPri('P3')} />
            <FilterChip active={filterPri === 'P4'}  label="P4 Docs"      onPress={() => setFilterPri('P4')} />
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={exportSummary}>
            <Text style={s.actionBtnText}>📤 Exportar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnSecondary]} onPress={clearAll}>
            <Text style={s.actionBtnText}>🗑 Limpar</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      <View style={s.listSection}>
        {filtered.map((d, i) => (
          <FadeInView key={d.id} delay={240 + i * 30}>
            <DivergenciaCard
              divergencia={d}
              chosen={decisions[d.id]}
              expanded={expanded.has(d.id)}
              onToggle={() => toggle(d.id)}
              onChoose={(letter) => choose(d.id, letter)}
            />
          </FadeInView>
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>Nenhuma divergência com esses filtros</Text>
          </View>
        )}
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>
          📖 Documento humano completo: mobile/docs/AUDIT_MATRIX_DEVPACK_V4.md{'\n'}
          ⚙ Dados (fonte): mobile/data/divergencias.ts{'\n\n'}
          Auditoria por Claude Opus 4.7 · 27/05/2026
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={[s.statCard, { borderColor: color + '44' }]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DivergenciaCard({
  divergencia,
  chosen,
  expanded,
  onToggle,
  onChoose,
}: {
  divergencia: Divergencia;
  chosen?: string;
  expanded: boolean;
  onToggle: () => void;
  onChoose: (letter: string) => void;
}) {
  const sevMeta = SEVERITY_META[divergencia.severity];
  const priMeta = PRIORITY_META[divergencia.priority];
  const prerecorded = divergencia.options.find(o => o.chosen)?.letter;
  const effectiveChoice = chosen ?? prerecorded;
  const hasDecision = !!effectiveChoice;

  return (
    <View style={[s.card, hasDecision && s.cardDecided]}>
      <TouchableOpacity onPress={onToggle} style={s.cardHeader} activeOpacity={0.7}>
        <View style={s.cardHeaderTop}>
          <Text style={s.cardId}>{divergencia.id}</Text>
          <View style={s.cardBadges}>
            <View style={[s.badge, { backgroundColor: sevMeta.color + '22', borderColor: sevMeta.color }]}>
              <Text style={[s.badgeText, { color: sevMeta.color }]}>{sevMeta.icon} {sevMeta.label}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>{priMeta.label}</Text>
            </View>
          </View>
        </View>

        <Text style={s.cardTitle}>{divergencia.title}</Text>
        <Text style={s.cardModule}>{divergencia.module} · DEVPACK {divergencia.devpackRef}</Text>

        {hasDecision && (
          <View style={s.chosenBanner}>
            <Text style={s.chosenText}>✅ Decidido: Opção {effectiveChoice}</Text>
          </View>
        )}

        {divergencia.notes && (
          <View style={s.notesBanner}>
            <Text style={s.notesText}>📌 {divergencia.notes}</Text>
          </View>
        )}

        <Text style={s.expandHint}>{expanded ? '▼ recolher' : '▶ ver opções'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={s.cardBody}>
          <View style={s.comparisonRow}>
            <View style={s.comparisonCol}>
              <Text style={s.comparisonLabel}>📜 DEVPACK diz</Text>
              <Text style={s.comparisonText}>{divergencia.devpackSays}</Text>
            </View>
            <View style={s.comparisonCol}>
              <Text style={s.comparisonLabel}>💻 Código diz</Text>
              <Text style={s.comparisonText}>{divergencia.codeReality}</Text>
            </View>
          </View>

          <Text style={s.typeText}>Tipo: {divergencia.type}</Text>

          {divergencia.blockedBy && (
            <View style={s.blockedBanner}>
              <Text style={s.blockedText}>🔗 Bloqueado por {divergencia.blockedBy}</Text>
            </View>
          )}

          <Text style={s.optionsTitle}>Opções disponíveis</Text>
          {divergencia.options.map((opt) => (
            <OptionRow
              key={opt.letter}
              option={opt}
              chosen={chosen === opt.letter}
              onPress={() => onChoose(opt.letter)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function OptionRow({ option, chosen, onPress }: { option: Option; chosen: boolean; onPress: () => void }) {
  const isPrerecorded = option.chosen;
  const showChosen = chosen || isPrerecorded;
  return (
    <TouchableOpacity
      style={[s.optionRow, showChosen && s.optionRowChosen, option.recommended && !showChosen && s.optionRowRec]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={s.optionHeader}>
        <View style={[s.optionLetter, showChosen && s.optionLetterChosen]}>
          <Text style={[s.optionLetterText, showChosen && s.optionLetterTextChosen]}>{option.letter}</Text>
        </View>
        <View style={s.optionContent}>
          <View style={s.optionTitleRow}>
            <Text style={s.optionTitle}>{option.title}</Text>
            {option.recommended && (
              <View style={s.recBadge}>
                <Text style={s.recBadgeText}>recomendado</Text>
              </View>
            )}
            {isPrerecorded && (
              <View style={[s.recBadge, { backgroundColor: colors.success + '22' }]}>
                <Text style={[s.recBadgeText, { color: colors.success }]}>decisão Fabiano</Text>
              </View>
            )}
          </View>
          {option.description !== '' && (
            <Text style={s.optionDesc}>{option.description}</Text>
          )}
          <Text style={s.optionEffort}>Esforço: {option.effort}</Text>
        </View>
        {showChosen && <Text style={s.optionCheck}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.xl, paddingTop: 32, paddingBottom: spacing.lg },
  title: { fontSize: fontSize.hero, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },

  progressCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { color: colors.textSecondary, fontSize: fontSize.body },
  progressVal: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700' },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressPct: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'right' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: { fontSize: 20, marginBottom: 2 },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },

  filterSection: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  filterTitle: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  chipTextActive: { color: colors.primary, fontWeight: '600' },

  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  actionBtnText: { color: colors.bg, fontWeight: '700', fontSize: fontSize.body },

  listSection: { paddingHorizontal: spacing.xl, marginTop: spacing.lg },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardDecided: { borderColor: colors.success + '88', borderWidth: 1 },
  cardHeader: { padding: spacing.md },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardId: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  cardBadges: { flexDirection: 'row', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  badgeText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600' },
  cardTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.xs },
  cardModule: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  chosenBanner: {
    backgroundColor: colors.success + '22',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  chosenText: { color: colors.success, fontSize: fontSize.sm, fontWeight: '600' },
  notesBanner: {
    backgroundColor: colors.primarySubtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.sm,
    borderRadius: radius.sm,
  },
  notesText: { color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 16 },
  expandHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },

  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  comparisonRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  comparisonCol: { flex: 1 },
  comparisonLabel: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700', marginBottom: 4 },
  comparisonText: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },

  typeText: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', marginBottom: spacing.md },

  blockedBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  blockedText: { color: colors.error, fontSize: fontSize.sm, fontWeight: '600' },

  optionsTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.sm },

  optionRow: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRowChosen: { borderColor: colors.success, backgroundColor: colors.success + '11' },
  optionRowRec:    { borderColor: colors.primary + '88' },

  optionHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  optionLetterChosen: { backgroundColor: colors.success },
  optionLetterText: { color: colors.text, fontSize: fontSize.body, fontWeight: '700' },
  optionLetterTextChosen: { color: colors.bg },
  optionContent: { flex: 1 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  optionTitle: { color: colors.text, fontSize: fontSize.body, fontWeight: '600' },
  recBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  recBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '600' },
  optionDesc: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2, lineHeight: 17 },
  optionEffort: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 },
  optionCheck: { color: colors.success, fontSize: fontSize.xxl, fontWeight: '700', marginLeft: spacing.sm },

  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted, fontSize: fontSize.body },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  footerText: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16, textAlign: 'center' },
});
