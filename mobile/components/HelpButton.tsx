// HelpButton — "?" de ajuda contextual (AlexandriOS) reutilizável em qualquer tela.
// Puxa da tabela alexandrios_kb pelo `anchor` (ex: "settings", "proteos") via o client
// Supabase já configurado do app (anon key, leitura pública) — sem URL fixa, sem CORS.
// Fallback: se não houver entrada para a âncora, mostra a ajuda geral do público.
import { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, fontSize, spacing, radius } from '../lib/theme';

type Item = { question: string; answer: string };

export function HelpButton({
  anchor,
  publico = 'usuario',
  label,
}: { anchor?: string; publico?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    setOpen(true);
    setLoading(true);
    try {
      let query = supabase
        .from('alexandrios_kb')
        .select('question,answer')
        .eq('publico', publico);
      if (anchor) query = query.eq('anchor', anchor);
      let { data } = await query;
      if ((!data || data.length === 0) && anchor) {
        const fallback = await supabase
          .from('alexandrios_kb')
          .select('question,answer')
          .eq('publico', publico)
          .limit(20);
        data = fallback.data;
      }
      setItems((data as Item[]) || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={load} accessibilityLabel="Ajuda desta tela" style={hs.btn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={hs.btnTxt}>?</Text>
      </TouchableOpacity>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={hs.overlay}>
          <View style={hs.sheet}>
            <View style={hs.header}>
              <Text style={hs.title}>Ajuda{label ? ` · ${label}` : ''}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={hs.close}>Fechar</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
              <ScrollView style={{ marginTop: spacing.sm }}>
                {items.length ? (
                  items.map((it, i) => (
                    <View key={i} style={hs.item}>
                      <Text style={hs.q}>{it.question}</Text>
                      <Text style={hs.a}>{it.answer}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={hs.a}>Sem ajuda para esta tela ainda. Toque em “Central de Ajuda” para ver tudo.</Text>
                )}
                <View style={{ height: spacing.xxl }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const hs = StyleSheet.create({
  btn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnTxt: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700', lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl,
    maxHeight: '80%', borderTopWidth: 1, borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '700' },
  close: { color: colors.textSecondary, fontSize: fontSize.md },
  item: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  q: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  a: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 21 },
});
