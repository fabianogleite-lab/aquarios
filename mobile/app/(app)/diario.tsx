import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function DiarioScreen() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([
    { id: '1', date: '22 Mai 2026', text: 'Hoje o AquariOS rodou pela primeira vez no meu celular. Um marco.' },
  ]);

  const saveEntry = () => {
    if (!entry.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      text: entry,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setEntry('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputArea}>
        <Text style={styles.prompt}>O que está presente agora?</Text>
        <TextInput
          style={styles.textInput}
          value={entry}
          onChangeText={setEntry}
          placeholder="Escreva sua reflexão..."
          placeholderTextColor="#3a4a5a"
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
          <Text style={styles.saveBtnText}>Salvar Reflexão</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.entriesList}>
        {entries.map((e) => (
          <View key={e.id} style={styles.entryCard}>
            <Text style={styles.entryDate}>{e.date}</Text>
            <Text style={styles.entryText}>{e.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090c14' },
  inputArea: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#141c28' },
  prompt: { color: '#b8952a', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  textInput: { backgroundColor: '#0d1520', borderRadius: 12, padding: 16, color: '#ccd6e8', fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#141c28' },
  saveBtn: { marginTop: 12, backgroundColor: '#b8952a', borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#090c14', fontWeight: '700', fontSize: 15 },
  entriesList: { padding: 20 },
  entryCard: { backgroundColor: '#0d1520', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#141c28' },
  entryDate: { color: '#3a4a5a', fontSize: 12, marginBottom: 8 },
  entryText: { color: '#ccd6e8', fontSize: 15, lineHeight: 22 },
});
